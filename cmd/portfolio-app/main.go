package main

import (
	"database/sql"
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

	if err := seedIfEmpty(database); err != nil {
		log.Fatalf("seed: %v", err)
	}

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

func seedIfEmpty(database *sql.DB) error {
	n, err := db.CountPhotos(database)
	if err != nil {
		return err
	}
	if n > 0 {
		return nil
	}
	log.Println("seeding database with existing photos")
	for _, p := range seedPhotos {
		if _, err := db.InsertPhoto(database, p); err != nil {
			return err
		}
	}
	return nil
}

var seedPhotos = []db.Photo{
	{
		Slug: "golden-hour-patagonia", Title: "Golden Hour, Patagonia", Year: 2025,
		Genres: []string{"landscape", "travel"}, Src: "/photos/golden-hour-patagonia.jpg",
		AspectRatio: "3/2",
		Shutter: "1/500s", Aperture: "f/2.8", ISO: 400, Focal: "35mm",
		Camera: "Sony A7IV", Lens: "24–70 f/2.8", Location: "Patagonia, AR",
	},
	{
		Slug: "morning-portrait", Title: "Morning Light", Year: 2025,
		Genres: []string{"portrait"}, Src: "/photos/morning-portrait.jpg",
		AspectRatio: "2/3",
		Shutter: "1/200s", Aperture: "f/1.8", ISO: 200, Focal: "85mm",
		Camera: "Sony A7IV", Lens: "85mm f/1.8",
	},
	{
		Slug: "downtown-rush", Title: "Downtown Rush", Year: 2024,
		Genres: []string{"street"}, Src: "/photos/downtown-rush.jpg",
		AspectRatio: "3/2",
		Shutter: "1/1000s", Aperture: "f/5.6", ISO: 800, Focal: "28mm",
		Location: "São Paulo, BR",
	},
	{
		Slug: "misty-valleys", Title: "Misty Valleys", Year: 2024,
		Genres: []string{"landscape"}, Src: "/photos/misty-valleys.jpg",
		AspectRatio: "3/2",
		Shutter: "1/60s", Aperture: "f/8", ISO: 100, Focal: "24mm",
		Camera: "Sony A7IV", Location: "Serra Gaúcha, BR",
	},
	{
		Slug: "tokyo-alley", Title: "Tokyo Alley", Year: 2024,
		Genres: []string{"street", "travel"}, Src: "/photos/tokyo-alley.jpg",
		AspectRatio: "2/3",
		Shutter: "1/125s", Aperture: "f/4", ISO: 1600, Focal: "35mm",
		Location: "Tokyo, JP",
	},
	{
		Slug: "dunes-at-dusk", Title: "Dunes at Dusk", Year: 2025,
		Genres: []string{"landscape", "travel"}, Src: "/photos/dunes-at-dusk.jpg",
		AspectRatio: "1",
		Shutter: "1/250s", Aperture: "f/11", ISO: 200, Focal: "50mm",
	},
	{
		Slug: "mountain-ridge", Title: "Mountain Ridge", Year: 2023,
		Genres: []string{"landscape"}, Src: "/photos/mountain-ridge.jpg",
		AspectRatio: "3/2",
		Shutter: "1/320s", Aperture: "f/9", ISO: 100, Focal: "24mm",
		Camera: "Sony A7IV", Lens: "16–35 f/4", Location: "Andes, CL",
	},
	{
		Slug: "golden-portrait", Title: "Golden Hour Portrait", Year: 2023,
		Genres: []string{"portrait"}, Src: "/photos/golden-portrait.jpg",
		AspectRatio: "2/3",
		Shutter: "1/400s", Aperture: "f/2", ISO: 160, Focal: "85mm",
		Camera: "Sony A7IV", Lens: "85mm f/1.8",
	},
	{
		Slug: "market-alley", Title: "Market Alley", Year: 2023,
		Genres: []string{"street", "travel"}, Src: "/photos/market-alley.jpg",
		AspectRatio: "3/2",
		Shutter: "1/800s", Aperture: "f/4", ISO: 400, Focal: "28mm",
		Location: "Marrakech, MA",
	},
	{
		Slug: "fog-forest", Title: "Fog Forest", Year: 2022,
		Genres: []string{"landscape"}, Src: "/photos/fog-forest.jpg",
		AspectRatio: "3/2",
		Shutter: "1/30s", Aperture: "f/11", ISO: 100, Focal: "50mm",
		Camera: "Sony A7IV", Lens: "50mm f/1.4", Location: "Floresta Negra, DE",
	},
	{
		Slug: "coastal-cliff", Title: "Coastal Cliff", Year: 2022,
		Genres: []string{"landscape", "travel"}, Src: "/photos/coastal-cliff.jpg",
		AspectRatio: "2/3",
		Shutter: "1/640s", Aperture: "f/6.3", ISO: 200, Focal: "35mm",
		Camera: "Sony A7IV", Location: "Algarve, PT",
	},
	{
		Slug: "urban-geometry", Title: "Urban Geometry", Year: 2022,
		Genres: []string{"street"}, Src: "/photos/urban-geometry.jpg",
		AspectRatio: "4/3",
		Shutter: "1/2000s", Aperture: "f/8", ISO: 400, Focal: "21mm",
		Location: "Berlin, DE",
	},
}
