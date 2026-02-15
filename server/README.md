Server (Express + MongoDB)

Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI`.
2. Install dependencies in `server` folder:

```bash
npm install
```

3. Start in development (requires `nodemon`):

```bash
npm run dev
```

Notes
- This project saves passwords directly into the database (no hashing) because it was requested. This is insecure for production.
