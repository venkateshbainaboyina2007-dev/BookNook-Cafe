
const express = require("express");
const cors = require("cors");

// Import route files
const guestRoutes = require("./routes/guestRoutes");
const gameRoutes = require("./routes/gameRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// Import database initialization
const initializeDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (request, response) => {
  response.status(200).json({
    message: "Welcome to BookNook Cafe API",
    status: "Running"
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    const db = await initializeDB();

    // Connect API routes
    app.use("/guests", guestRoutes(db));
    app.use("/games", gameRoutes(db));
    app.use("/bookings", bookingRoutes(db));

    // Global error handling middleware
    app.use((error, request, response, next) => {
      console.error("Server Error:", error.stack);

      if (response.headersSent) {
        return next(error);
      }

      response.status(500).json({
        error: "Internal Server Error"
      });
    });

    // Start Express server
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`BookNook Cafe server running on port ${PORT}`);
      console.log("BookNook Cafe server started successfully");
      console.log("Server running at http://localhost:3000");
    });

  } catch (error) {
    console.error(
      "Database initialization failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
