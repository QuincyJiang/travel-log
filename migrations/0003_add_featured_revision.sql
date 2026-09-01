CREATE TABLE photo_featured_state (
  trip_id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 0
);

INSERT INTO photo_featured_state (trip_id, revision)
SELECT trip_id, 0
FROM photo_index_state;
