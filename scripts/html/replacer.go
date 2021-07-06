package html

import (
	"fmt"
	"golang.org/x/net/html"
	"os"
	"strings"
)

type Replacer struct {
	path     string
	contents *html.Node
}

func NewReplacer(base, path string) (Replacer, error) {
	file, err := os.Open(base)
	if err != nil {
		return Replacer{}, fmt.Errorf("replacer: couldn't open existing file: %s", err)
	}

	node, err := html.Parse(file)
	if err != nil {
		return Replacer{}, fmt.Errorf("replacer: couldn't parse existing html: %s", err)
	}

	err = file.Close()
	if err != nil {
		return Replacer{}, fmt.Errorf("replacer: couldn't close existing file: %s", err)
	}

	return Replacer{
		path:     path,
		contents: node,
	}, nil
}

func (r Replacer) Replace(replacement []*html.Node, contentsId string) error {
	target := traverse(r.contents, func(node *html.Node) bool {
		if node.Type != html.ElementNode {
			return false
		}

		id, ok := getContentId(node)
		if !ok {
			return false
		}

		return id == contentsId
	})

	if target == nil {
		return fmt.Errorf("replacer: couldn't find existing node with data-contents attribute %s", contentsId)
	}

	removeContentId(target)

	for _, child := range children(target) {
		target.RemoveChild(child)
	}

	for _, node := range replacement {
		target.AppendChild(node)
	}

	return nil
}

func (r Replacer) Write() error {
	file, err := os.Create(r.path)
	if err != nil {
		return fmt.Errorf("replacer: couldn't create new file: %s", err)
	}
	defer file.Close()

	err = html.Render(file, r.contents)
	if err != nil {
		return fmt.Errorf("replacer: couldn't render html: %s", err)
	}

	return nil
}

func (r Replacer) AllReplaced() error {
	var contentIds []string
	traverse(r.contents, func(node *html.Node) bool {
		if node.Type != html.ElementNode {
			return false
		}

		id, ok := getContentId(node)
		if ok {
			contentIds = append(contentIds, id)
		}

		return false
	})

	if len(contentIds) != 0 {
		return fmt.Errorf("replacer: found unreplaced content ids: %s", strings.Join(contentIds, ", "))
	}

	return nil
}

func traverse(node *html.Node, action func(node *html.Node) bool) *html.Node {
	stop := action(node)

	if stop {
		return node
	}

	for _, child := range children(node) {
		if result := traverse(child, action); result != nil {
			return result
		}
	}

	return nil
}

func children(node *html.Node) []*html.Node {
	var result []*html.Node
	for child := node.FirstChild; child != nil; child = child.NextSibling {
		result = append(result, child)
	}

	return result
}

func getContentId(node *html.Node) (string, bool) {
	for _, attr := range node.Attr {
		if attr.Key == "data-contents" {
			return attr.Val, attr.Val != ""
		}
	}

	return "", false
}

func removeContentId(node *html.Node) {
	var result []html.Attribute
	for _, attr := range node.Attr {
		if attr.Key != "data-contents" {
			result = append(result, attr)
		}
	}

	node.Attr = result
}
