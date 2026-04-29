import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
const envVarsSchema = z.object({
    NODE_ENV: z.enum(['production', 'development', 'test']),
    PORT: z.string().default('5000'),
    DATABASE_URL: z.string().describe('PostgreSQL connection string'),
    CORS_ORIGIN: z.string().default('*'),
});
const envVars = envVarsSchema.safeParse(process.env);
if (!envVars.success) {
    throw new Error(`Config validation error: ${envVars.error.message}`);
}
export const config = {
    env: envVars.data.NODE_ENV,
    port: parseInt(envVars.data.PORT, 10),
    database: {
        url: envVars.data.DATABASE_URL,
    },
    cors: {
        origin: envVars.data.CORS_ORIGIN,
    }
};
