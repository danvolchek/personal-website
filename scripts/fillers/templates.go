package fillers

import (
	"fmt"
	"html/template"
	"strconv"
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

var tmplCarts = template.Must(template.New("pico-8-carts").
	Parse(`{{/* trim start */ -}}

{{- range .}}
<div>
	<div>{{.Name}}</div>
	<div>{{.Description}}</div>
	<div>
		{{- if ne .Link "" -}}
			<a target="_blank" href="{{.Link}}">Play!</a>
		{{- else -}}
			link pending
		{{- end -}}
	</div>
</div>
{{- end}}

{{- /* trim end */}}`))

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
		<div class="section three-cols">
			<div>{{.Name}}</div>
			<div data-content="{{.Id}}"></div>
		</div>
	{{- end}}
</div>
{{- end}}
<div data-project="">
	<p>Click on a project to learn more</p>
</div>

{{- /* trim end */}}`))

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
