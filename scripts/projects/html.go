package projects

import (
	"bytes"
	"fmt"
	html2 "github.com/danvolchek/personal-website/scripts/html"
	"golang.org/x/net/html"
	"html/template"
)

func GenerateReplacements() map[string][]*html.Node {
	return map[string][]*html.Node{
		"project-descriptions":   generateDescriptions(),
		"project-details":       generateDetails(),
	}
}

var tmplDesc = template.Must(template.New("project-descriptions").
	Parse(`{{/* trim start */ -}}

{{- range .}}
<div>
	<div>{{.Name}}</div>
	<div>{{.ShortDescription}}</div>
	<div><a href="#{{.Id}}">more details</a></div>
</div>
{{- end}}

{{- /* trim end */}}`))

var tmplDetail = template.Must(template.New("project-details").
	Parse(`{{/* trim start */ -}}

{{- range .}}
<div class="hidden" data-project="{{.Id}}">
	<div class="section">
		<div class="header-with-link">
			<div>Project: {{.Name}}</div>
			<a target="_blank" href="{{.SourceCode}}">source code</a>
		</div>
		{{.LongDescription}}
	</div>
	{{- range .Sections}}
		{{.}}
	{{- end}}
</div>
{{- end}}
<div data-project="">
	<p>Click on a project to learn more</p>
</div>

{{- /* trim end */}}`))


func generateDescriptions() []*html.Node {
	buffer := bytes.NewBuffer(nil)

	err := tmplDesc.Execute(buffer, projects)
	if err != nil {
		panic(fmt.Sprintf("projects: could not generate descriptions HTML: %s", err))
	}

	return html2.Parse(buffer)
}

func generateDetails() []*html.Node {
	buffer := bytes.NewBuffer(nil)

	err := tmplDetail.Execute(buffer, projects)
	if err != nil {
		panic(fmt.Sprintf("projects: could not generate details HTML: %s", err))
	}

	return html2.Parse(buffer)
}