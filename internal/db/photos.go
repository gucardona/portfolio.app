package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
)

type Photo struct {
	ID          int64
	Slug        string
	Title       string
	Year        int
	Genres      []string
	Src         string
	AspectRatio string
	Shutter     string
	Aperture    string
	ISO         int
	Focal       string
	Camera      string
	Lens        string
	Location    string
	SortOrder   int
}

func ListPhotos(db *sql.DB) ([]Photo, error) {
	rows, err := db.Query(`
		SELECT id, slug, title, year, genres, src, aspect_ratio,
		       shutter, aperture, iso, focal, camera, lens, location, sort_order
		FROM photos
		ORDER BY sort_order ASC, created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var photos []Photo
	for rows.Next() {
		var p Photo
		var genresJSON string
		err := rows.Scan(&p.ID, &p.Slug, &p.Title, &p.Year, &genresJSON, &p.Src,
			&p.AspectRatio, &p.Shutter, &p.Aperture, &p.ISO, &p.Focal,
			&p.Camera, &p.Lens, &p.Location, &p.SortOrder)
		if err != nil {
			return nil, err
		}
		if err := json.Unmarshal([]byte(genresJSON), &p.Genres); err != nil {
			return nil, err
		}
		photos = append(photos, p)
	}
	return photos, rows.Err()
}

func GetPhotoBySlug(db *sql.DB, slug string) (*Photo, error) {
	var p Photo
	var genresJSON string
	err := db.QueryRow(`
		SELECT id, slug, title, year, genres, src, aspect_ratio,
		       shutter, aperture, iso, focal, camera, lens, location, sort_order
		FROM photos WHERE slug = ?`, slug).
		Scan(&p.ID, &p.Slug, &p.Title, &p.Year, &genresJSON, &p.Src,
			&p.AspectRatio, &p.Shutter, &p.Aperture, &p.ISO, &p.Focal,
			&p.Camera, &p.Lens, &p.Location, &p.SortOrder)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(genresJSON), &p.Genres); err != nil {
		return nil, err
	}
	return &p, nil
}

func InsertPhoto(db *sql.DB, p Photo) (int64, error) {
	genresJSON, err := json.Marshal(p.Genres)
	if err != nil {
		return 0, err
	}
	res, err := db.Exec(`
		INSERT INTO photos (slug, title, year, genres, src, aspect_ratio,
		                    shutter, aperture, iso, focal, camera, lens, location, sort_order)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		p.Slug, p.Title, p.Year, string(genresJSON), p.Src, p.AspectRatio,
		p.Shutter, p.Aperture, nullInt(p.ISO), p.Focal, p.Camera, p.Lens, p.Location, p.SortOrder)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func UpdatePhoto(db *sql.DB, slug string, p Photo) error {
	genresJSON, err := json.Marshal(p.Genres)
	if err != nil {
		return err
	}
	res, err := db.Exec(`
		UPDATE photos SET title=?, year=?, genres=?, aspect_ratio=?,
		                  shutter=?, aperture=?, iso=?, focal=?, camera=?, lens=?, location=?
		WHERE slug=?`,
		p.Title, p.Year, string(genresJSON), p.AspectRatio,
		p.Shutter, p.Aperture, nullInt(p.ISO), p.Focal, p.Camera, p.Lens, p.Location,
		slug)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

func DeletePhoto(db *sql.DB, slug string) error {
	res, err := db.Exec(`DELETE FROM photos WHERE slug=?`, slug)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return fmt.Errorf("not found")
	}
	return nil
}

func CountPhotos(db *sql.DB) (int, error) {
	var n int
	err := db.QueryRow(`SELECT COUNT(*) FROM photos`).Scan(&n)
	return n, err
}

func nullInt(v int) any {
	if v == 0 {
		return nil
	}
	return v
}
