# BookNook Cafe – Board Game Booking Management System

## 1. Project Overview

BookNook Cafe is a Board Game Booking Management System developed using Node.js, Express.js, and SQLite.

The system allows guests to register, view available board games, book games, and return previously booked games.

It also prevents the same game from being booked by multiple guests at the same time.

## 2. Technologies Used

- Node.js
- Express.js
- SQLite
- JavaScript
- Postman
- Git and GitHub

## 3. Project Structure

```text
BookNook-Cafe/
│
├── config/
│   └── db.js
│
├── database/
│   └── booknook.db
│
├── routes/
│   ├── guestRoutes.js
│   ├── gameRoutes.js
│   └── bookingRoutes.js
│
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## 4. Database Structure

The project contains three related tables.

### Guests
- guest_id
- guest_name
- phone

### Games
- game_id
- game_name
- min_players
- max_players

### Bookings
- booking_id
- guest_id
- game_id
- booked_at
- returned_at

The bookings table uses foreign keys to connect guests and games.

## 5. Installation and Setup

### Step 1: Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Step 2: Navigate to the project folder

```bash
cd BookNook-Cafe
```

### Step 3: Install dependencies

```bash
npm install
```

### Step 4: Start the server

```bash
node server.js
```

The server runs at:

```text
http://localhost:3000
```

The database and tables are initialized automatically when the server starts.

## 6. API Endpoints

### Guest APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /guests | Get all guests |
| GET | /guests/:id | Get guest by ID |
| POST | /guests | Add a guest |
| DELETE | /guests/:id | Delete a guest |

### Game APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /games | Get all games |
| GET | /games/:id | Get game by ID |
| POST | /games | Add a game |
| PUT | /games/:id | Update a game |
| DELETE | /games/:id | Delete a game |
| GET | /games?players=2 | Search games by player count |

### Booking APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | /bookings | Get bookings with guest and game details |
| POST | /bookings | Book a game |
| PUT | /bookings/:id/return | Return a booked game |

## 7. Special Feature – Double Booking Prevention

The system prevents a game from being booked by two guests simultaneously.

Example:

1. Asha books Game 1.
2. Ravi attempts to book Game 1.
3. The system returns HTTP 409 Conflict.
4. Asha returns Game 1.
5. Ravi can now successfully book Game 1.

Example error response:

```json
{
  "error": "Game 1 is already booked"
}
```

A database-level unique index also prevents multiple active bookings for the same game.

## 8. Validation and Error Handling

The application includes:

- Guest name validation.
- Phone number validation.
- Duplicate phone number prevention.
- Game details validation.
- Player count validation.
- Guest and game existence checks.
- Booking conflict handling.
- Appropriate HTTP status codes.

## 9. Testing

The API endpoints were tested using Postman.

Tested functionalities include:

- Adding and retrieving guests.
- Updating and deleting games.
- Searching games by player count.
- Booking and returning games.
- Preventing duplicate active bookings.
- Retrieving booking details using SQL JOIN.

## 10. Conclusion

BookNook Cafe demonstrates backend development fundamentals using Express.js and SQLite. It implements REST API operations, database relationships, validation, SQL JOIN operations, and booking conflict prevention.

The project provides a simple backend solution for managing board game bookings in a cafe environment.