CREATE TABLE trips (
  id TEXT PRIMARY KEY,
  eyebrow TEXT NOT NULL,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  period TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL,
  cover_path TEXT NOT NULL,
  cover_alt TEXT NOT NULL,
  summary TEXT NOT NULL,
  route_label TEXT NOT NULL,
  overview_map_embed TEXT NOT NULL,
  overview_map_external TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trips_create_featured_state
AFTER INSERT ON trips
BEGIN
  INSERT OR IGNORE INTO photo_featured_state (trip_id, revision)
  VALUES (NEW.id, 0);
END;

CREATE TABLE trip_tags (
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY (trip_id, sort_order),
  UNIQUE (trip_id, name)
);

CREATE TABLE trip_metrics (
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (trip_id, sort_order)
);

CREATE TABLE trip_overview_nodes (
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  PRIMARY KEY (trip_id, sort_order)
);

CREATE TABLE trip_days (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 99),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  image_path TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  stay TEXT NOT NULL,
  stay_arrival TEXT,
  transport TEXT NOT NULL,
  duration TEXT NOT NULL,
  UNIQUE (trip_id, day_number)
);

CREATE INDEX trip_days_trip_idx ON trip_days (trip_id, day_number);

CREATE TABLE day_route_nodes (
  day_id TEXT NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  place_query TEXT NOT NULL,
  PRIMARY KEY (day_id, sort_order)
);

CREATE TABLE day_route_legs (
  day_id TEXT NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  mode TEXT NOT NULL,
  PRIMARY KEY (day_id, sort_order)
);

CREATE TABLE day_timeline_items (
  day_id TEXT NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  time_label TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT NOT NULL,
  PRIMARY KEY (day_id, sort_order)
);

CREATE TABLE places (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  image_path TEXT NOT NULL,
  UNIQUE (name, type, image_path)
);

CREATE TABLE day_places (
  id TEXT PRIMARY KEY,
  day_id TEXT NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL REFERENCES places(id),
  sort_order INTEGER NOT NULL,
  description TEXT NOT NULL,
  UNIQUE (day_id, sort_order)
);

CREATE TABLE day_place_details (
  day_place_id TEXT NOT NULL REFERENCES day_places(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  label TEXT NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (day_place_id, sort_order)
);

CREATE TABLE content_sources (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  UNIQUE (label, url)
);

CREATE TABLE day_place_sources (
  day_place_id TEXT NOT NULL REFERENCES day_places(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES content_sources(id),
  sort_order INTEGER NOT NULL,
  PRIMARY KEY (day_place_id, sort_order)
);

CREATE TABLE day_tips (
  day_id TEXT NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (day_id, sort_order)
);

CREATE TABLE food_guides (
  day_id TEXT PRIMARY KEY REFERENCES trip_days(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  note TEXT NOT NULL
);

CREATE TABLE food_specialties (
  day_id TEXT NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (day_id, sort_order)
);

CREATE TABLE restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  map_query TEXT NOT NULL,
  UNIQUE (name, map_query)
);

CREATE TABLE day_restaurants (
  day_id TEXT NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
  sort_order INTEGER NOT NULL,
  note TEXT NOT NULL,
  source_id TEXT REFERENCES content_sources(id),
  PRIMARY KEY (day_id, sort_order)
);

CREATE TABLE media_credits (
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  subject TEXT NOT NULL,
  attribution TEXT NOT NULL,
  source_url TEXT NOT NULL,
  PRIMARY KEY (trip_id, sort_order)
);

CREATE TABLE photo_upload_leases (
  trip_id TEXT NOT NULL,
  checksum TEXT NOT NULL,
  photo_id TEXT NOT NULL,
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 99),
  reserved_at TEXT NOT NULL,
  PRIMARY KEY (trip_id, checksum)
);

CREATE INDEX photo_upload_leases_reserved_idx
  ON photo_upload_leases (reserved_at);
