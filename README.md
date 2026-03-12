# Trello Clone

A full-stack Kanban-style project management web application built as a clone of Trello's core functionalities.

## Tech Stack
- **Frontend**: React.js (Vite), Vanilla CSS, `@hello-pangea/dnd` for drag and drop features.
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon Database) and Prisma ORM

## Features
- **Board View**: Dynamic scrolling columns and cohesive UI design mimicking Trello.
- **Drag & Drop**: Reorder lists horizontally, move cards within lists, and move cards across lists.
- **Card Details Modal**: Edit card descriptions, view labels, dates, members, and add interactive checklists.
- **Live Search Filtering**: Search bar filters cards instantly by text and checks both title and description.
- **RESTful API**: Fast and modular backend endpoints providing full CRUD operations.

## Setup Instructions

### 1. Database
The project uses PostgreSQL. Start by entering your PostgreSQL connection string into the `.env` file of the backend.

### 2. Backend
Navigate to the `backend` folder and run the server:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed     # Populate database with sample data
npm run dev      # Starts Express server at localhost:5000
```

### 3. Frontend
Navigate to the `frontend` folder and run the Vite app:
```bash
cd frontend
npm install
npm run dev      # Starts Vite server at localhost:5173
```


## Assumptions
- Uses a mock user ID and mock authentication logic since the requirement was "no login required." 
- `BoardView.jsx` handles state at the board level to make DnD smooth using `@hello-pangea/dnd`.
- Search filters data in memory on the client to avoid constant round trips, delivering real-time UX.
