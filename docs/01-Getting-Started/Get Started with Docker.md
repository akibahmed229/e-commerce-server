## Overview

This guide shows how to containerize the backend application and PostgreSQL database using **Docker** and **Docker Compose**. Running the project in containers ensures a consistent development environment across different machines.

---

## Prerequisites

Make sure the following tools are installed:

* Docker
* Docker Compose

Verify the installation:

```bash
docker --version
docker compose version
```

---

## 1. Create the Dockerfile

Create a file named `Dockerfile.dev` in the project root.

```dockerfile
FROM node:26-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
```

### Dockerfile Overview

| Instruction          | Description                                      |
| -------------------- | ------------------------------------------------ |
| `FROM`               | Uses the official Node.js Alpine image.          |
| `WORKDIR`            | Sets the working directory inside the container. |
| `COPY package*.json` | Copies dependency files.                         |
| `RUN npm install`    | Installs project dependencies.                   |
| `COPY . .`           | Copies the application source code.              |
| `EXPOSE 4000`        | Exposes port `4000` inside the container.        |
| `CMD`                | Starts the development server.                   |

---

## 2. (Optional) Build the Docker Image

You can build the image manually to verify that the Dockerfile is working correctly.

```bash
docker build -t ecommerce-backend:latest .
```

---

## 3. Create Docker Compose Configuration

Create a `docker-compose.yml` file in the project root.

```yaml
services:
  ecommerce-backend:
    container_name: ecommerce-backend
    build:
      context: .
      dockerfile: Dockerfile.dev

    ports:
      - "4000:4000"

    environment:
      - PORT=4000
      - DATABASE_URL=postgresql://postgres:postgres@ecommerce-database:5432/ecommerce

    depends_on:
      - ecommerce-database

    volumes:
      - ./:/app
      - /app/node_modules

  ecommerce-database:
    container_name: ecommerce-database
    image: postgres:16-alpine

    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ecommerce

    ports:
      - "5430:5432"

    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Services

#### `ecommerce-backend`

Runs the Node.js/Express backend application.

* Builds the image using `Dockerfile.dev`
* Maps port `4000`
* Mounts the project directory for live development
* Connects to the PostgreSQL container

#### `ecommerce-database`

Runs a PostgreSQL 16 database.

* Creates the `ecommerce` database automatically
* Persists data using a Docker volume
* Maps container port `5432` to host port `5430`

---

## 4. Start the Containers

Build the images (if necessary) and start all services in detached mode.

```bash
docker compose up --build -d
```

---

## 5. Verify the Containers

Check that both containers are running.

```bash
docker ps
```

Expected containers:

* `ecommerce-backend`
* `ecommerce-database`

---

## 6. Stop the Containers

Stop and remove all containers, networks, and volumes created by Docker Compose.

```bash
docker compose down -v
```

> **Note:** The `-v` flag also removes the PostgreSQL data volume. Omit this flag if you want to preserve your database data.
