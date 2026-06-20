import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const REACT_PROJECT_COMMAND = process.env.REACT_PROJECT_COMMAND;

// Comma-separated list of allowed origins. Unset => allow all (dev convenience).
export const CORS_ORIGIN = process.env.CORS_ORIGIN;

