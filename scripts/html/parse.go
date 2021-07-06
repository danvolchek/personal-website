package html

import (
	"fmt"
	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
	"io"
)

func Parse(raw io.Reader) []*html.Node {
	nodes, err := html.ParseFragment(raw, &html.Node{
		Type:     html.ElementNode,
		Data:     "body",
		DataAtom: atom.Body,
	})
	if err != nil {
		panic(fmt.Sprintf("html: could not parse raw HTML: %s", err))
	}

	return nodes
}