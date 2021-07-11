package fillers

import (
	"bytes"
	"fmt"
	"golang.org/x/net/html"
	"html/template"
	"path/filepath"
	"strconv"
)

type templateHolder struct {
	pico8Carts *template.Template
	pico8Play  *template.Template

	projectDescriptions *template.Template
	projectDetails      *template.Template

	stardewMods *template.Template
}

var templates templateHolder

func InitTemplates(path string) {
	templates.pico8Carts = templateFromFile(path, "pico8Carts.html")
	templates.pico8Play = templateFromFile(path, "pico8Play.html")

	templates.projectDescriptions = templateFromFile(path, "projectDescriptions.html")
	templates.projectDetails = templateFromFile(path, "projectDetails.html")

	templates.stardewMods = templateFromFileFuncs(path, "stardewMods.html", map[string]interface{}{
		"FormatDownloads": formatDownloads,
	})
}

func templateFromFile(path, name string) *template.Template {
	return templateFromFileFuncs(path, name, nil)
}

func templateFromFileFuncs(path, name string, funcs map[string]interface{}) *template.Template {
	tmpl := template.New(name)
	if funcs != nil {
		tmpl.Funcs(funcs)
	}

	return template.Must(tmpl.ParseFiles(filepath.Join(path, name)))
}

func executeTemplate(template *template.Template, data interface{}) []*html.Node {
	buffer := bytes.NewBuffer(nil)

	err := template.Execute(buffer, data)
	if err != nil {
		panic(err)
	}

	return parseHTML(buffer)
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
