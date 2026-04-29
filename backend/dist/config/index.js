"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const envVarsSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['production', 'development', 'test']),
    PORT: zod_1.z.string().default('5000'),
    DATABASE_URL: zod_1.z.string().describe('PostgreSQL connection string'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
});
const envVars = envVarsSchema.safeParse(process.env);
if (!envVars.success) {
    throw new Error(`Config validation error: ${envVars.error.message}`);
}
exports.config = {
    env: envVars.data.NODE_ENV,
    port: parseInt(envVars.data.PORT, 10),
    database: {
        url: envVars.data.DATABASE_URL,
    },
    cors: {
        origin: envVars.data.CORS_ORIGIN,
    }
};
