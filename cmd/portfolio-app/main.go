package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"portfolio.app/internal/api"
	"portfolio.app/internal/db"
	"portfolio.app/internal/store"
)

func main() {
	port := getenv("PORT", ":8003")
	dbPath := getenv("DB_PATH", "./portfolio.db")
	photosDir := getenv("PHOTOS_DIR", "./public/photos")
	adminEmail := getenv("ADMIN_EMAIL", "")
	adminPassword := getenv("ADMIN_PASSWORD", "")
	jwtSecret := getenv("JWT_SECRET", "")

	if adminEmail == "" || adminPassword == "" || jwtSecret == "" {
		log.Fatal("ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET must be set")
	}

	database, err := db.Open(dbPath)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer database.Close()

	fs := &store.FileStore{Dir: photosDir}
	apiRouter := api.NewRouter(database, fs, adminEmail, adminPassword, jwtSecret)

	distDir := "./dist"
	staticFS := http.FileServer(http.Dir(distDir))

	mux := http.NewServeMux()
	mux.Handle("/api/", apiRouter)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		clean := filepath.Join(distDir, filepath.Clean("/"+r.URL.Path))
		_, err := os.Stat(clean)
		if os.IsNotExist(err) && !strings.Contains(r.URL.Path, ".") {
			http.ServeFile(w, r, filepath.Join(distDir, "index.html"))
			return
		}
		staticFS.ServeHTTP(w, r)
	})

	log.Printf("listening on %s", port)
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatal(err)
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

