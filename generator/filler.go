package generator

import "golang.org/x/net/html"

type Filler interface {
	Id() string
	Replacements() map[string][]*html.Node
}
