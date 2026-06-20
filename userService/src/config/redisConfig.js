import { REDIS_URL, REDIS_HOST, REDIS_PORT } from './serverConfig.js';

// Prefer a full connection URL (managed Redis like Upstash/Redis Cloud, incl.
// auth + TLS via the rediss:// scheme). Fall back to host/port for local dev.
const redisConfig = REDIS_URL || { host: REDIS_HOST, port: REDIS_PORT };

export default redisConfig;