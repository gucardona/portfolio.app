package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const (
	port    = ":8003"
	distDir = "./dist"
)

func main() {
	fs := http.FileServer(http.Dir(distDir))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Clean the path and check if the file exists on disk.
		// Anything without a file extension that isn't a real asset
		// gets served index.html so React Router handles it.
		clean := filepath.Join(distDir, filepath.Clean("/"+r.URL.Path))
		_, err := os.Stat(clean)
		if os.IsNotExist(err) && !strings.Contains(r.URL.Path, ".") {
			http.ServeFile(w, r, filepath.Join(distDir, "index.html"))
			return
		}
		fs.ServeHTTP(w, r)
	})

	log.Printf("listening on %s", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}
