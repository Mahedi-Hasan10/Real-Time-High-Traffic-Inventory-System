"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const index_js_1 = require("./index.js");
exports.prisma = global.prisma ||
    new client_1.PrismaClient({
        log: index_js_1.config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: index_js_1.config.database.url,
            },
        },
    });
if (index_js_1.config.env !== 'production') {
    global.prisma = exports.prisma;
}
exports.default = exports.prisma;
