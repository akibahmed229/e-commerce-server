## Overview

This guide walks you through creating a new backend project with **Node.js**, **TypeScript**, and the required dependencies for the e-commerce application.

---

## Prerequisites

Before you begin, ensure you have the following installed:

* Node.js (v22 or later)
* npm
* Git

Verify your installation:

```bash
node -v
npm -v
git --version
```

---

## 1. Create the Project

Create a new project directory and initialize a Node.js application.

```bash
mkdir clean-backend
cd clean-backend
npm init -y
```

---

## 2. Install Runtime Dependencies

Install the packages required to run the application.

```bash
npm install express pg dotenv zod cookie-parser jsonwebtoken bcryptjs express-rate-limit cors
```

| Package            | Purpose                               |
| ------------------ | ------------------------------------- |
| express            | Web framework for building REST APIs  |
| pg                 | PostgreSQL database driver            |
| dotenv             | Loads environment variables           |
| zod                | Request validation                    |
| cookie-parser      | Parses cookies from incoming requests |
| jsonwebtoken       | JWT authentication                    |
| bcryptjs           | Password hashing                      |
| express-rate-limit | API rate limiting                     |
| cors               | Cross-Origin Resource Sharing         |

---

## 3. Install Development Dependencies

Install development tools and TypeScript type definitions.

```bash
npm install -D \
typescript \
tsx \
tsc-alias \
@types/node \
@types/express \
@types/pg \
@types/cookie-parser \
@types/jsonwebtoken \
@types/bcryptjs \
@types/cors
```

These packages provide TypeScript support, type definitions, and utilities for development.

---

## 4. Initialize TypeScript

Generate the default TypeScript configuration.

```bash
npx tsc --init
```

---

## 5. Configure TypeScript

Update your `tsconfig.json` with the following configuration:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Configuration Overview

| Option             | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `target`           | Compiles the project to ECMAScript 2022.                          |
| `module`           | Uses the Node.js module system.                                   |
| `moduleResolution` | Resolves modules using the Node.js strategy.                      |
| `rootDir`          | Specifies the source code directory.                              |
| `outDir`           | Outputs compiled files to the `dist` directory.                   |
| `strict`           | Enables strict type checking.                                     |
| `esModuleInterop`  | Improves compatibility with CommonJS modules.                     |
| `skipLibCheck`     | Skips type checking of declaration files to speed up compilation. |

