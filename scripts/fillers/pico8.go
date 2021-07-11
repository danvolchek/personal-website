package fillers

import (
	"golang.org/x/net/html"
	"gopkg.in/yaml.v2"
	"os"
)

type cartData struct {
	Repo   string
	Branch string
	Carts  []pico8Cart
}

type pico8Cart struct {
	Name        string
	Description string
	Path        string
	Link        string
}

type pico8Filler struct {
	carts []pico8Cart
}

func NewPico8Filler(cartsPath, outputPath string) (*pico8Filler, error) {
	var data cartData

	raw, err := os.ReadFile(cartsPath)
	if err != nil {
		return nil, err
	}

	err = yaml.Unmarshal(raw, &data)
	if err != nil {
		return nil, err
	}

	retriever := cartRetriever{
		repo:       data.Repo,
		branch:     data.Branch,
		outputPath: outputPath,
	}

	for i, cart := range data.Carts {
		err := retriever.Retrieve(cart.Name, cart.Path)
		if err != nil {
			return nil, err
		}
		data.Carts[i].Link = "/pico8/" + cart.Path
	}

	return &pico8Filler{
		carts: data.Carts,
	}, nil
}

func (p pico8Filler) Id() string {
	return "pico8"
}

func (p pico8Filler) Replacements() map[string][]*html.Node {
	return map[string][]*html.Node{
		"carts": executeTemplate(templates.pico8Carts, p.carts),
	}
}
