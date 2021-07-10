package fillers

import (
	"bytes"
	"golang.org/x/net/html"
	"gopkg.in/yaml.v2"
	"html/template"
	"os"
)

type project struct {
	Id               string
	Name             string
	ShortDescription string
	LongDescription  template.HTML
	SourceCode       string
	Sections         []section
}

type section struct {
	Name string
	Id   string
}

type projectsFiller struct {
	projects []project
}

func NewProjectsFiller(projectsPath string) (*projectsFiller, error) {
	var projects []project

	data, err := os.ReadFile(projectsPath)
	if err != nil {
		return nil, err
	}

	err = yaml.Unmarshal(data, &projects)
	if err != nil {
		return nil, err
	}

	for i := range projects {
		projects[i].LongDescription = parseMarkdown(projects[i].LongDescription)
	}

	return &projectsFiller{
		projects: projects,
	}, nil
}

func (p projectsFiller) Id() string {
	return "projects"
}

func (p projectsFiller) Replacements() map[string][]*html.Node {
	return map[string][]*html.Node{
		"descriptions": p.generateDescriptions(),
		"details":      p.generateDetails(),
	}
}

func (p projectsFiller) generateDescriptions() []*html.Node {
	buffer := bytes.NewBuffer(nil)

	err := tmplDesc.Execute(buffer, p.projects)
	if err != nil {
		panic(err)
	}

	return parseHTML(buffer)
}

func (p projectsFiller) generateDetails() []*html.Node {
	buffer := bytes.NewBuffer(nil)

	err := tmplDetail.Execute(buffer, p.projects)
	if err != nil {
		panic(err)
	}

	return parseHTML(buffer)
}
