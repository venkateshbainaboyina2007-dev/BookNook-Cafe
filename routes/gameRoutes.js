
const express = require("express");

const router = express.Router();

module.exports = (db) => {

  // 1. GET all games and search by number of players
  router.get("/", async (request, response) => {
    const { players } = request.query;

    let games;

    if (players !== undefined) {
      const playerCount = Number(players);

      if (!Number.isInteger(playerCount) || playerCount <= 0) {
        return response.status(400).json({
          error: "Players must be a positive integer"
        });
      }

      games = await db.all(
        `SELECT * FROM games
         WHERE min_players <= ? AND max_players >= ?`,
        [playerCount, playerCount]
      );
    } else {
      games = await db.all("SELECT * FROM games");
    }

    response.status(200).json(games);
  });

  // 2. GET one game by ID
  router.get("/:id", async (request, response) => {
    const { id } = request.params;

    const game = await db.get(
      "SELECT * FROM games WHERE game_id = ?",
      [id]
    );

    if (!game) {
      return response.status(404).json({
        error: "Game not found"
      });
    }

    response.status(200).json(game);
  });

  // 3. ADD a new game
  router.post("/", async (request, response) => {
    const { game_name, min_players, max_players } = request.body;

    if (
      typeof game_name !== "string" ||
      !game_name.trim() ||
      !Number.isInteger(min_players) ||
      !Number.isInteger(max_players) ||
      min_players <= 0 ||
      max_players < min_players
    ) {
      return response.status(400).json({
        error: "Enter a valid game name, minimum players, and maximum players"
      });
    }

    const result = await db.run(
      `INSERT INTO games (game_name, min_players, max_players)
       VALUES (?, ?, ?)`,
      [game_name.trim(), min_players, max_players]
    );

    response.status(201).json({
      message: "Game added successfully",
      game_id: result.lastID
    });
  });

  // 4. UPDATE a game
  router.put("/:id", async (request, response) => {
    const { id } = request.params;
    const { game_name, min_players, max_players } = request.body;

    if (
      typeof game_name !== "string" ||
      !game_name.trim() ||
      !Number.isInteger(min_players) ||
      !Number.isInteger(max_players) ||
      min_players <= 0 ||
      max_players < min_players
    ) {
      return response.status(400).json({
        error: "Enter valid game details"
      });
    }

    const game = await db.get(
      "SELECT * FROM games WHERE game_id = ?",
      [id]
    );

    if (!game) {
      return response.status(404).json({
        error: "Game not found"
      });
    }

    await db.run(
      `UPDATE games
       SET game_name = ?, min_players = ?, max_players = ?
       WHERE game_id = ?`,
      [game_name.trim(), min_players, max_players, id]
    );

    response.status(200).json({
      message: "Game updated successfully"
    });
  });

  // 5. DELETE a game
  router.delete("/:id", async (request, response) => {
    const { id } = request.params;

    const game = await db.get(
      "SELECT * FROM games WHERE game_id = ?",
      [id]
    );

    if (!game) {
      return response.status(404).json({
        error: "Game not found"
      });
    }

    const booking = await db.get(
      "SELECT * FROM bookings WHERE game_id = ?",
      [id]
    );

    if (booking) {
      return response.status(409).json({
        error: "Cannot delete a game with booking history"
      });
    }

    await db.run(
      "DELETE FROM games WHERE game_id = ?",
      [id]
    );

    response.status(200).json({
      message: "Game deleted successfully"
    });
  });

  return router;
};
