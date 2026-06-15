package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	dbpkg "portfolio.app/internal/db"
	"portfolio.app/internal/store"
)

type photosHandler struct {
	db    *sql.DB
	store *store.FileStore
}

// photoResponse matches the shape the frontend expects from photos.js.
type photoResponse struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Year        int      `json:"year"`
	Genres      []string `json:"genres"`
	Src         string   `json:"src"`
	AspectRatio string   `json:"aspectRatio"`
	EXIF        *exif    `json:"exif,omitempty"`
}

type exif struct {
	Shutter  string `json:"shutter,omitempty"`
	Aperture string `json:"aperture,omitempty"`
	ISO      int    `json:"iso,omitempty"`
	Focal    string `json:"focal,omitempty"`
	Camera   string `json:"camera,omitempty"`
	Lens     string `json:"lens,omitempty"`
	Location string `json:"location,omitempty"`
}

func toResponse(p dbpkg.Photo) photoResponse {
	resp := photoResponse{
		Slug:        p.Slug,
		Title:       p.Title,
		Year:        p.Year,
		Genres:      p.Genres,
		Src:         p.Src,
		AspectRatio: p.AspectRatio,
	}
	e := &exif{
		Shutter:  p.Shutter,
		Aperture: p.Aperture,
		ISO:      p.ISO,
		Focal:    p.Focal,
		Camera:   p.Camera,
		Lens:     p.Lens,
		Location: p.Location,
	}
	// Omit exif block entirely if all fields are empty.
	if e.Shutter != "" || e.Aperture != "" || e.ISO != 0 || e.Focal != "" ||
		e.Camera != "" || e.Lens != "" || e.Location != "" {
		resp.EXIF = e
	}
	return resp
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func (h *photosHandler) list(w http.ResponseWriter, r *http.Request) {
	photos, err := dbpkg.ListPhotos(h.db)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	resp := make([]photoResponse, len(photos))
	for i, p := range photos {
		resp[i] = toResponse(p)
	}
	writeJSON(w, http.StatusOK, resp)
}

func (h *photosHandler) create(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	_, fileHeader, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file required", http.StatusBadRequest)
		return
	}

	if err := h.store.Save(fileHeader); err != nil {
		if strings.Contains(err.Error(), "conflict") {
			http.Error(w, "file already exists", http.StatusConflict)
			return
		}
		http.Error(w, "failed to save file", http.StatusInternalServerError)
		return
	}

	filename := filepath.Base(fileHeader.Filename)
	slug := r.FormValue("slug")
	if slug == "" {
		slug = strings.TrimSuffix(filename, filepath.Ext(filename))
	}

	year, _ := strconv.Atoi(r.FormValue("year"))
	isoVal, _ := strconv.Atoi(r.FormValue("iso"))

	var genres []string
	if g := r.FormValue("genres"); g != "" {
		if err := json.Unmarshal([]byte(g), &genres); err != nil {
			for _, s := range strings.Split(g, ",") {
				genres = append(genres, strings.TrimSpace(s))
			}
		}
	}

	p := dbpkg.Photo{
		Slug:        slug,
		Title:       r.FormValue("title"),
		Year:        year,
		Genres:      genres,
		Src:         "/photos/" + filename,
		AspectRatio: r.FormValue("aspectRatio"),
		Shutter:     r.FormValue("shutter"),
		Aperture:    r.FormValue("aperture"),
		ISO:         isoVal,
		Focal:       r.FormValue("focal"),
		Camera:      r.FormValue("camera"),
		Lens:        r.FormValue("lens"),
		Location:    r.FormValue("location"),
	}

	if _, err := dbpkg.InsertPhoto(h.db, p); err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			http.Error(w, "slug already exists", http.StatusConflict)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, toResponse(p))
}

func (h *photosHandler) update(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	var req struct {
		Title       string   `json:"title"`
		Year        int      `json:"year"`
		Genres      []string `json:"genres"`
		AspectRatio string   `json:"aspectRatio"`
		Shutter     string   `json:"shutter"`
		Aperture    string   `json:"aperture"`
		ISO         int      `json:"iso"`
		Focal       string   `json:"focal"`
		Camera      string   `json:"camera"`
		Lens        string   `json:"lens"`
		Location    string   `json:"location"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	p := dbpkg.Photo{
		Title:       req.Title,
		Year:        req.Year,
		Genres:      req.Genres,
		AspectRatio: req.AspectRatio,
		Shutter:     req.Shutter,
		Aperture:    req.Aperture,
		ISO:         req.ISO,
		Focal:       req.Focal,
		Camera:      req.Camera,
		Lens:        req.Lens,
		Location:    req.Location,
	}

	if err := dbpkg.UpdatePhoto(h.db, slug, p); err != nil {
		if err.Error() == "not found" {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	updated, err := dbpkg.GetPhotoBySlug(h.db, slug)
	if err != nil || updated == nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, toResponse(*updated))
}

func (h *photosHandler) delete(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	photo, err := dbpkg.GetPhotoBySlug(h.db, slug)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if photo == nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if err := dbpkg.DeletePhoto(h.db, slug); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	// Remove file — log on failure, don't error.
	filename := filepath.Base(photo.Src)
	if err := h.store.Delete(filename); err != nil {
		fmt.Printf("warn: could not delete file %s: %v\n", filename, err)
	}

	w.WriteHeader(http.StatusNoContent)
}
