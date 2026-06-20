import express from 'express';
import {
    PORT,
    NODE_ENV,
    CORS_ORIGIN,
    BULL_BOARD_USER,
    BULL_BOARD_PASSWORD,
} from './config/serverConfig.js';
import apiRouter from './routes/index.js'
import cors from "cors";
 import bullServerAdapter from './config/bullBoardConfig.js';
 import connectDB from './config/dbConfig.js';

const app = express();

// Restrict CORS to configured origins; fall back to "*" when unset (dev).
const allowedOrigins = CORS_ORIGIN
    ? CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*';

// Basic-auth guard for the Bull Board UI. When no credentials are configured,
// the UI is only reachable outside production.
function bullBoardAuth(req, res, next) {
    if (!BULL_BOARD_USER || !BULL_BOARD_PASSWORD) {
        if (NODE_ENV === 'production') {
            return res
                .status(403)
                .send('Bull Board is disabled. Set BULL_BOARD_USER and BULL_BOARD_PASSWORD.');
        }
        return next();
    }
    const [scheme, encoded] = (req.headers.authorization || '').split(' ');
    if (scheme === 'Basic' && encoded) {
        const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
        if (user === BULL_BOARD_USER && pass === BULL_BOARD_PASSWORD) {
            return next();
        }
    }
    res.set('WWW-Authenticate', 'Basic realm="Bull Board"');
    return res.status(401).send('Authentication required.');
}

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/ui', bullBoardAuth, bullServerAdapter.getRouter());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log("Server is running on port: ", PORT);
    connectDB();
})