-- In-store display playlist, edited in /admin and played by /store-display.
CREATE TABLE IF NOT EXISTS playlist_items (
  position int PRIMARY KEY CHECK (position >= 0),
  url text NOT NULL CHECK (length(url) <= 2048)
);
