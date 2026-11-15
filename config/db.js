
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const fs = require("fs");

// Database file path
const dbPath = path.join(
  __dirname,
  "../database/booknook.db"
);

// Create database folder if it does not exist
fs.mkdirSync(path.dirname(dbPath), {
  recursive: true
});

const initializeDB = async () => {
  // Open SQLite database
  const db = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign key constraints
  await db.exec("PRAGMA foreign_keys = ON");

  // Create Guests table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS guests (
      guest_id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_name TEXT NOT NULL,
      phone TEXT UNIQUE
    );
  `);

  // Create Games table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      game_id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_name TEXT NOT NULL,
      min_players INTEGER NOT NULL,
      max_players INTEGER NOT NULL
    );
  `);

  // Create Bookings table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_id INTEGER NOT NULL,
      game_id INTEGER NOT NULL,
      booked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      returned_at TEXT,

      FOREIGN KEY (guest_id)
        REFERENCES guests(guest_id),

      FOREIGN KEY (game_id)
        REFERENCES games(game_id)
    );
  `);

  // Prevent multiple active bookings for the same game
  await db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS one_active_booking_per_game
    ON bookings(game_id)
    WHERE returned_at IS NULL;
  `);

  console.log("Database and tables created successfully");

  return db;
};

module.exports = initializeDB;
