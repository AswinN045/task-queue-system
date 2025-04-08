Task Queue System

This project is a Task Queue System built with NestJS, MongoDB, and the @nestjs/schedule package for background task processing. It supports:

    Task creation via API
    Background processing with retry logic
    Rate-limiting (e.g., 5 tasks per minute)
    Priority-based task processing

Features
  Task creation API
  Background task processing every minute
  Rate-limiting (max 5 tasks/minute)
  Task status tracking (pending, processing, completed, failed)
  Priority-based task processing (higher priority first)
  Retry failed tasks up to 3 times
  Swagger API documentation

Tech Stack
  NestJS
  MongoDB
  Mongoose
  @nestjs/schedule
  Docker + Docker Compose

Setup Instructions
  1. Clone the Repo

    git clone https://github.com/AswinN045/task-queue-system.git
    cd task-queue-system

  2. Install Dependencies

    npm install

  3. Environment Configuration

    Create a .env file:

    PORT=8081
    MONGO_URI=mongodb://localhost:27017/task-queue

    If using Docker, use: MONGO_URI=mongodb://mongo:27017/task-queue

  Run with Docker

    Make sure Docker is installed, then:

    docker-compose up --build

The app will be available at: http://localhost:8081

 Run Locally (Without Docker)

Make sure MongoDB is running locally at localhost:27017.

  npm run start:dev or nest start

 Example API Requests
 Create a Task

  curl -X POST http://localhost:8081/tasks \
    -H "Content-Type: application/json" \
    -d '{ "type": "email", "priority": 3(Optional) }'

Get Task By ID

  curl http://localhost:8081/tasks/<task_id>

Get Status Counts

  curl http://localhost:8081/tasks/status

Swagger API:
  The API documentation will available at: http://localhost:8081/docs

We use @nestjs/schedule to periodically and automatically process tasks in the background, with full control over execution, retries, rate-limiting, and error handling — all within our NestJS app.

