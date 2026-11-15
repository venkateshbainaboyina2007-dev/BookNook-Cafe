
const express = require("express");

const router = express.Router();

module.exports = (db) => {

  // 1. GET all guests
  router.get("/", async (request, response) => {
    const guests = await db.all(
      "SELECT * FROM guests"
    );

    response.status(200).json(guests);
  });

  // 2. GET one guest by ID
  router.get("/:id", async (request, response) => {
    const { id } = request.params;

    const guest = await db.get(
      "SELECT * FROM guests WHERE guest_id = ?",
      [id]
    );

    if (!guest) {
      return response.status(404).json({
        error: "Guest not found"
      });
    }

    response.status(200).json(guest);
  });

  // 3. ADD a new guest
  router.post("/", async (request, response) => {
    const { guest_name, phone } = request.body;

    // Validate guest name
    if (
      typeof guest_name !== "string" ||
      !guest_name.trim()
    ) {
      return response.status(400).json({
        error: "Guest name is required"
      });
    }

    // Validate phone number
    if (
      phone !== undefined &&
      (typeof phone !== "string" || !/^\d{10}$/.test(phone))
    ) {
      return response.status(400).json({
        error: "Phone number must contain exactly 10 digits"
      });
    }

    try {
      const result = await db.run(
        `INSERT INTO guests (guest_name, phone)
         VALUES (?, ?)`,
        [guest_name.trim(), phone || null]
      );

      response.status(201).json({
        message: "Guest added successfully",
        guest_id: result.lastID
      });

    } catch (error) {

      // Handle duplicate phone number
      if (
        error.code === "SQLITE_CONSTRAINT" &&
        error.message.includes("guests.phone")
      ) {
        return response.status(409).json({
          error: "Phone number already exists"
        });
      }

      throw error;
    }
  });

  // 4. DELETE a guest
  router.delete("/:id", async (request, response) => {
    const { id } = request.params;

    const guest = await db.get(
      "SELECT * FROM guests WHERE guest_id = ?",
      [id]
    );

    if (!guest) {
      return response.status(404).json({
        error: "Guest not found"
      });
    }

    // Check whether guest has booking history
    const booking = await db.get(
      "SELECT * FROM bookings WHERE guest_id = ?",
      [id]
    );

    if (booking) {
      return response.status(409).json({
        error: "Cannot delete guest with booking history"
      });
    }

    await db.run(
      "DELETE FROM guests WHERE guest_id = ?",
      [id]
    );

    response.status(200).json({
      message: "Guest deleted successfully"
    });
  });

  return router;
};
