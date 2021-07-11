package fillers

import (
	"fmt"
	"golang.org/x/net/html"
	"gopkg.in/yaml.v2"
	"os"
	"strings"
	"time"
)

const (
	monthYearFormat = "Jan 2006"
)

type details struct {
	Id          string
	Name        string
	Description string
	Usage       usage
}

type stardewFiller struct {
	Favorites []details
	Other     []details
}

type modData struct {
	Favorites []details
	Other     []details
}

func NewStardewFiller(modsPath, usagePath string) (*stardewFiller, error) {
	retriever := usageRetriever{path: usagePath}

	var mods modData

	data, err := os.ReadFile(modsPath)
	if err != nil {
		panic(err)
	}

	err = yaml.Unmarshal(data, &mods)
	if err != nil {
		panic(err)
	}

	usageData, err := retriever.retrieve()
	if err != nil {
		return nil, err
	}

	fav, err := hydrate(mods.Favorites, usageData)
	if err != nil {
		return nil, err
	}

	other, err := hydrate(mods.Other, usageData)
	if err != nil {
		return nil, err
	}

	return &stardewFiller{
		Favorites: fav,
		Other:     other,
	}, nil
}

func (s stardewFiller) Id() string {
	return "stardew"
}

func (s stardewFiller) Replacements() map[string][]*html.Node {
	return map[string][]*html.Node{
		"favorites":   executeTemplate(templates.stardewMods, s.createModsMap(s.Favorites)),
		"other":       executeTemplate(templates.stardewMods, s.createModsMap(s.Other)),
		"total":       s.generateTotalDownloads(),
		"update-date": s.generateUpdateDate(),
	}
}

func (s stardewFiller) createModsMap(mods []details) map[string]details {
	// the template package's range action iterates in sorted key order over maps
	// so create one here to get alphabetical order
	modsByName := make(map[string]details, len(mods))
	for _, mod := range mods {
		modsByName[mod.Name] = mod
	}

	return modsByName
}

func (s stardewFiller) generateTotalDownloads() []*html.Node {
	sum := 0
	for _, mod := range s.Favorites {
		sum += mod.Usage.TotalDownloads
	}
	for _, mod := range s.Other {
		sum += mod.Usage.TotalDownloads
	}

	return parseHTML(strings.NewReader(formatDownloads(sum, false)))
}

func (s stardewFiller) generateUpdateDate() []*html.Node {
	return parseHTML(strings.NewReader(time.Now().Format(monthYearFormat)))
}

func hydrate(mods []details, usageData map[string]usage) ([]details, error) {
	result := make([]details, len(mods))

	for i, mod := range mods {
		data, ok := usageData[mod.Id]
		if !ok {
			return nil, fmt.Errorf("stardew: need usage for id %s but not found", mod.Id)
		}

		result[i] = mod
		result[i].Usage = data
	}

	return result, nil
}
