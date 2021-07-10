package main

import (
	"fmt"
	"github.com/danvolchek/personal-website/scripts/fillers"
	"os"
)

func main() {
	err := run()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	fmt.Println("Updated! Make sure to run a format to clean up the generated HTML.")
}

func run() error {
	replacer, err := NewReplacer("../data/base.html", "../docs/index.html")
	if err != nil {
		return err
	}

	fillers, err := createFillers()
	if err != nil {
		return err
	}

	replacer.Add(fillers)

	err = replacer.Replace()
	if err != nil {
		return err
	}

	err = replacer.Write()
	if err != nil {
		return err
	}

	return nil
}

func createFillers() ([]Filler, error) {
	projectsFiller, err := fillers.NewProjectsFiller("../data/projects.yaml")
	if err != nil {
		return nil, err
	}

	stardewFiller, err := fillers.NewStardewFiller("../data/mods.yaml", "../data/usage.csv")
	if err != nil {
		return nil, err
	}

	pico8Filler, err := fillers.NewPico8Filler("../data/carts.yaml")
	if err != nil {
		return nil, err
	}

	return []Filler{
		projectsFiller, stardewFiller, pico8Filler,
	}, nil
}
