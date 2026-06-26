package api

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"portfolio.app/internal/auth"
	"portfolio.app/internal/store"
)

func NewRouter(db *sql.DB, fs *store.FileStore, adminEmail, adminPassword, jwtSecret string) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	ph := &photosHandler{db: db, store: fs}
	ah := &authHandler{email: adminEmail, password: adminPassword, secret: jwtSecret}

	r.Get("/api/photos", ph.list)

	r.Post("/api/auth/login", ah.login)
	r.Post("/api/auth/logout", ah.logout)

	r.Group(func(r chi.Router) {
		r.Use(auth.Middleware(jwtSecret))
		r.Get("/api/auth/me", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusNoContent)
		})
		r.Post("/api/photos", ph.create)
		r.Put("/api/photos/{slug}", ph.update)
		r.Delete("/api/photos/{slug}", ph.delete)
	})

	return r
}
