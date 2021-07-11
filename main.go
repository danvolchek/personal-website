package main

import (
	"fmt"
	"github.com/danvolchek/personal-website/generator"
	"github.com/danvolchek/personal-website/generator/fillers"
	"os"
	"path/filepath"
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
	replacer, err := generator.NewReplacer(filepath.Join("templates", "base.html"), filepath.Join("docs", "index.html"))
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

func createFillers() ([]generator.Filler, error) {
	fillers.InitTemplates("templates")

	projectsFiller, err := fillers.NewProjectsFiller(filepath.Join("data", "projects.yaml"))
	if err != nil {
		return nil, err
	}

	stardewFiller, err := fillers.NewStardewFiller(filepath.Join("data", "mods.yaml"), filepath.Join("data", "usage.csv"))
	if err != nil {
		return nil, err
	}

	pico8Filler, err := fillers.NewPico8Filler(filepath.Join("data", "carts.yaml"), filepath.Join("docs", "pico8"))
	if err != nil {
		return nil, err
	}

	return []generator.Filler{
		projectsFiller, stardewFiller, pico8Filler,
	}, nil
}
