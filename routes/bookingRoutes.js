
const express = require("express");

const router = express.Router();

module.exports = (db) => {

  // 1. GET all bookings with guest and game details (JOIN)
  router.get("/", async (request, response) => {
    const bookings = await db.all(`
      SELECT
        bookings.booking_id,
        guests.guest_name,
        games.game_name,
        bookings.booked_at,
        bookings.returned_at
      FROM bookings
      INNER JOIN guests
        ON bookings.guest_id = guests.guest_id
      INNER JOIN games
        ON bookings.game_id = games.game_id
      ORDER BY bookings.booking_id
    `);

    response.status(200).json(bookings);
  });

  // 2. BOOK a game
  router.post("/", async (request, response) => {
    const { guest_id, game_id } = request.body;

    if (
      !Number.isInteger(guest_id) ||
      guest_id <= 0 ||
      !Number.isInteger(game_id) ||
      game_id <= 0
    ) {
      return response.status(400).json({
        error: "Valid guest_id and game_id are required"
      });
    }

    try {
      // Start an immediate transaction
      await db.exec("BEGIN IMMEDIATE");

      // Check whether guest exists
      const guest = await db.get(
        "SELECT * FROM guests WHERE guest_id = ?",
        [guest_id]
      );

      if (!guest) {
        await db.exec("ROLLBACK");
        return response.status(404).json({
          error: "Guest not found"
        });
      }

      // Check whether game exists
      const game = await db.get(
        "SELECT * FROM games WHERE game_id = ?",
        [game_id]
      );

      if (!game) {
        await db.exec("ROLLBACK");
        return response.status(404).json({
          error: "Game not found"
        });
      }

      // Check whether game is already booked
      const activeBooking = await db.get(
        `SELECT * FROM bookings
         WHERE game_id = ? AND returned_at IS NULL`,
        [game_id]
      );

      if (activeBooking) {
        await db.exec("ROLLBACK");
        return response.status(409).json({
          error: `Game ${game_id} is already booked`
        });
      }

      // Create booking
      const result = await db.run(
        `INSERT INTO bookings (guest_id, game_id)
         VALUES (?, ?)`,
        [guest_id, game_id]
      );

      await db.exec("COMMIT");

      response.status(201).json({
        message: "Game booked successfully",
        booking_id: result.lastID
      });

    } catch (error) {
      try {
        await db.exec("ROLLBACK");
      } catch (rollbackError) {
        // Ignore rollback errors if transaction already ended
      }

      console.error("Booking error:", error.message);

      response.status(500).json({
        error: "Unable to book game"
      });
    }
  });

  // 3. RETURN a game
  router.put("/:id/return", async (request, response) => {
    const { id } = request.params;

    const booking = await db.get(
      `SELECT * FROM bookings
       WHERE booking_id = ? AND returned_at IS NULL`,
      [id]
    );

    if (!booking) {
      return response.status(404).json({
        error: "Active booking not found"
      });
    }

    await db.run(
      `UPDATE bookings
       SET returned_at = CURRENT_TIMESTAMP
       WHERE booking_id = ?`,
      [id]
    );

    response.status(200).json({
      message: "Game returned successfully"
    });
  });

  return router;
};
