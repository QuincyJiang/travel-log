CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 99),
  place TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  captured_date TEXT NOT NULL DEFAULT '',
  checksum TEXT NOT NULL,
  date_source TEXT NOT NULL DEFAULT '',
  exif_json TEXT,
  taken_at TEXT NOT NULL DEFAULT '',
  uploaded_at TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  size INTEGER NOT NULL,
  original_key TEXT NOT NULL UNIQUE,
  thumbnail_key TEXT NOT NULL UNIQUE,
  thumbnail_version TEXT,
  featured_order INTEGER
    CHECK (featured_order IS NULL OR featured_order BETWEEN 1 AND 16),
  UNIQUE (trip_id, checksum)
);

CREATE INDEX photos_trip_date_idx
  ON photos (trip_id, day, taken_at, uploaded_at);

CREATE UNIQUE INDEX photos_trip_featured_order_idx
  ON photos (trip_id, featured_order)
  WHERE featured_order IS NOT NULL;
