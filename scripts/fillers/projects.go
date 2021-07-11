package fillers

import (
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

	for i, project := range projects {
		projects[i].LongDescription = parseMarkdown(project.LongDescription)

		for j, section := range project.Sections {
			project.Sections[j].Id = project.Id + "-" + section.Id
		}
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
		"descriptions": executeTemplate(templates.projectDescriptions, p.projects),
		"details":      executeTemplate(templates.projectDetails, p.projects),
	}
}
