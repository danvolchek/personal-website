package fillers

import (
	"github.com/russross/blackfriday/v2"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
	"html/template"
	"io"
)

func parseHTML(raw io.Reader) []*html.Node {
	nodes, err := html.ParseFragment(raw, &html.Node{
		Type:     html.ElementNode,
		Data:     "body",
		DataAtom: atom.Body,
	})
	if err != nil {
		panic(err)
	}

	return nodes
}

func parseMarkdown(in template.HTML) template.HTML {
	return template.HTML(blackfriday.Run([]byte(in),
		blackfriday.WithRenderer(blackfriday.NewHTMLRenderer(
			blackfriday.HTMLRendererParameters{
				Flags: blackfriday.CommonHTMLFlags | blackfriday.HrefTargetBlank,
			},
		)),
	))
}
