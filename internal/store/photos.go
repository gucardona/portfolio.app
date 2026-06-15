package store

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
)

type FileStore struct {
	Dir string
}

// Save writes the uploaded file to Dir. Returns 409 error if file already exists.
func (s *FileStore) Save(fh *multipart.FileHeader) error {
	dst := filepath.Join(s.Dir, filepath.Base(fh.Filename))
	if _, err := os.Stat(dst); err == nil {
		return fmt.Errorf("conflict: file already exists")
	}

	src, err := fh.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	return err
}

// Delete removes the file from Dir. Logs on failure but does not return error.
func (s *FileStore) Delete(filename string) error {
	dst := filepath.Join(s.Dir, filepath.Base(filename))
	return os.Remove(dst)
}
