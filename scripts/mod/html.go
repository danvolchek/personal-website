package mod

import (
	"bytes"
	"fmt"
	html2 "github.com/danvolchek/personal-website/scripts/html"
	"golang.org/x/net/html"
	"html/template"
	"strconv"
	"strings"
	"time"
)

var tmplList = template.Must(template.New("mods-list").
	Funcs(map[string]interface{}{
		"FormatDownloads": formatDownloads,
	}).
	Parse(`{{/* trim start */ -}}

{{- range .}}
<div>
	<div>{{.Name}}</div>
	<div>{{.Description}}</div>
	<div>
		<a target="_blank" href="https://www.nexusmods.com/stardewvalley/mods/{{.Id}}">
			{{FormatDownloads .Usage.TotalDownloads true}}
		</a>
	</div>
</div>
{{- end}}

{{- /* trim end */}}`))

const (
	monthYearFormat = "Jan 2006"
)

func GenerateReplacements(favMods []Details, otherMods []Details) map[string][]*html.Node {
	return map[string][]*html.Node{
		"sdv-favorites":   generateList(favMods),
		"sdv-other":       generateList(otherMods),
		"sdv-total":       generateTotalDownloads(favMods, otherMods),
		"sdv-update-date": generateUpdateDate(),
	}
}

func generateList(mods []Details) []*html.Node {
	// the template package's range action iterates in sorted key order over maps
	// so create one here to get alphabetical order
	modsByName := make(map[string]Details, len(mods))
	for _, mod := range mods {
		modsByName[mod.Name] = mod
	}

	buffer := bytes.NewBuffer(nil)

	err := tmplList.Execute(buffer, modsByName)
	if err != nil {
		panic(fmt.Sprintf("mod: could not generate raw HTML: %s", err))
	}

	return html2.Parse(buffer)
}

func generateTotalDownloads(favMods []Details, otherMods []Details) []*html.Node {
	sum := 0
	for _, mod := range favMods {
		sum += mod.Usage.TotalDownloads
	}
	for _, mod := range otherMods {
		sum += mod.Usage.TotalDownloads
	}

	return html2.Parse(strings.NewReader(formatDownloads(sum, false)))
}

func generateUpdateDate() []*html.Node {
	return html2.Parse(strings.NewReader(time.Now().Format(monthYearFormat)))
}

func formatDownloads(downloads int, short bool) string {
	if downloads < 1000 {
		return strconv.Itoa(downloads)
	}

	formatParts := func(first, second int, modifierShort, modifierLong string) string {
		modifier := modifierShort
		if !short {
			modifier = modifierLong
		}

		if second == 0 {
			return fmt.Sprintf("%v%s", first, modifier)
		}

		return fmt.Sprintf("%v.%v%s", first, second, modifier)
	}

	if downloads < 1000000 {
		return formatParts(downloads/1000, (downloads%1000)/100, "k", "thousand")
	}

	return formatParts(downloads/1000000, (downloads%1000000)/100000, "m", " million")
}