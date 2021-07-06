package mod

import "fmt"

type Details struct {
	Id          string
	Name        string
	Description string
	Usage       Usage
}

type Usage struct {
	TotalDownloads  int
	UniqueDownloads int
	TotalViews      int
}

func GetAll(usageDataPath string) ([]Details, []Details, error) {
	retriever := usageRetriever{path: usageDataPath}

	usageData, err := retriever.Retrieve()
	if err != nil {
		return nil, nil, err
	}

	fav, err := hydrate(favoriteMods, usageData)
	if err != nil {
		return nil, nil, err
	}

	other, err := hydrate(otherMods, usageData)
	if err != nil {
		return nil, nil, err
	}

	return fav, other, nil
}

func hydrate(mods []Details, usageData map[string]Usage) ([]Details, error) {
	result := make([]Details, len(mods))

	for i, mod := range mods {
		data, ok := usageData[mod.Id]
		if !ok {
			return nil, fmt.Errorf("mod: need Usage for id %s but not found", mod.Id)
		}

		result[i] = mod
		result[i].Usage = data
	}

	return result, nil
}
