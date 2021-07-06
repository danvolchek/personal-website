package main

import (
	"fmt"
	"github.com/danvolchek/personal-website/scripts/html"
	"github.com/danvolchek/personal-website/scripts/mod"
	"github.com/danvolchek/personal-website/scripts/projects"
	"os"
)

func main() {
	err := updateHTML()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	fmt.Println("Updated! Make sure to run a format to clean up the generated HTML.")
}

func updateHTML() error {
	replacer, err := html.NewReplacer("html/base.html", "../docs/index.html")
	if err != nil {
		return err
	}

	err = updateProjects(replacer)
	if err != nil {
		return err
	}

	err = updateModDownloads(replacer)
	if err != nil {
		return err
	}

	err = replacer.AllReplaced()
	if err != nil {
		return err
	}

	err = replacer.Write()
	if err != nil {
		return err
	}

	return nil
}

func updateModDownloads(replacer html.Replacer) error {
	favoriteMods, otherMods, err := mod.GetAll("download_counts.csv")
	if err != nil {
		return err
	}

	for contentsId, replacement := range mod.GenerateReplacements(favoriteMods, otherMods) {
		err = replacer.Replace(replacement, contentsId)
		if err != nil {
			return err
		}
	}

	return nil
}

func updateProjects(replacer html.Replacer) error {
	for contentsId, replacement := range projects.GenerateReplacements() {
		err := replacer.Replace(replacement, contentsId)
		if err != nil {
			return err
		}
	}

	return nil
}
