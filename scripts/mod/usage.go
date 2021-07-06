package mod

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
)

type usageRetriever struct {
	path string
}

func (u usageRetriever) Retrieve() (map[string]Usage, error) {
	var data []byte
	var err error

	if u.alreadyDownloaded() {
		data, err = u.read()
	} else {
		data, err = u.download()
	}

	if err != nil {
		return nil, err
	}

	return u.parse(data)
}

func (u usageRetriever) alreadyDownloaded() bool {
	_, err := os.Stat(u.path)
	return err == nil
}

func (u usageRetriever) download() ([]byte, error) {
	res, err := http.Get("https://staticstats.nexusmods.com/live_download_counts/mods/1303.csv")
	if err != nil {
		return nil, fmt.Errorf("usage retriever: couldn't get mod counts: %s", err)
	}

	data, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("usage retriever: couldn't read mod counts: %s", err)
	}

	err = os.WriteFile(u.path, data, 0666)
	if err != nil {
		return nil, fmt.Errorf("usage retriever: couldn't write mod counts: %s", err)
	}

	return data, nil
}

func (u usageRetriever) read() ([]byte, error) {
	data, err := os.ReadFile(u.path)
	if err != nil {
		return nil, fmt.Errorf("usage retriever: couldn't read mod counts: %s", err)
	}

	return data, nil
}

func (u usageRetriever) parse(data []byte) (map[string]Usage, error) {
	reader := csv.NewReader(bytes.NewBuffer(data))
	reader.FieldsPerRecord = 4

	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("usage retriever: couldn't parse mod counts: %s", err)
	}

	usage := make(map[string]Usage)

	for _, record := range records {
		modId := record[0]

		totalDownloads, err := u.parseNumber(record[1], "total downloads")
		if err != nil {
			return nil, err
		}

		uniqueDownloads, err := u.parseNumber(record[2], "unique downloads")
		if err != nil {
			return nil, err
		}

		totalViews, err := u.parseNumber(record[3], "total views")
		if err != nil {
			return nil, err
		}

		usage[modId] = Usage{
			TotalDownloads:  totalDownloads,
			UniqueDownloads: uniqueDownloads,
			TotalViews:      totalViews,
		}
	}

	return usage, nil
}

func (u usageRetriever) parseNumber(value, name string) (int, error) {
	num, err := strconv.Atoi(value)
	if err != nil {
		return 0, fmt.Errorf("usage retriever: couldn't parse %s: %s", name, err)
	}

	return num, nil
}
