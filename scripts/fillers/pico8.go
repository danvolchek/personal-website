package fillers

import (
	"bytes"
	"golang.org/x/net/html"
	"gopkg.in/yaml.v2"
	"os"
)

type pico8Cart struct {
	Name        string
	Description string
	Link        string
}

type pico8Filler struct {
	carts []pico8Cart
}

func NewPico8Filler(cartsPath string) (*pico8Filler, error) {
	var carts []pico8Cart

	data, err := os.ReadFile(cartsPath)
	if err != nil {
		return nil, err
	}

	err = yaml.Unmarshal(data, &carts)
	if err != nil {
		return nil, err
	}

	return &pico8Filler{
		carts: carts,
	}, nil
}

func (p pico8Filler) Id() string {
	return "pico8"
}

func (p pico8Filler) Replacements() map[string][]*html.Node {
	buffer := bytes.NewBuffer(nil)

	err := tmplCarts.Execute(buffer, p.carts)
	if err != nil {
		panic(err)
	}

	return map[string][]*html.Node{
		"carts": parseHTML(buffer),
	}
}
