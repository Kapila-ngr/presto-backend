"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const driver_routes_1 = __importDefault(require("./routes/driver.routes"));
const token_controller_1 = require("./controllers/token.controller");
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
async function initializeDatabase() {
    await (0, typeorm_1.createConnection)({
        type: 'mysql',
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT) || 3306,
        username: process.env.DATABASE_USERNAME || 'root',
        password: process.env.DATABASE_PASSWORD || 'password',
        database: process.env.DATABASE_NAME || 'presto_dispatch',
        entities: ['src/entities/*.ts'],
        synchronize: true
    });
}
app.use('v1/dispatch/:locationId/orders', order_routes_1.default);
app.use('v1/dispatch/drivers', driver_routes_1.default);
app.post('/generate-token', token_controller_1.generateToken);
async function startServer() {
    await initializeDatabase();
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}
startServer().catch(console.error);
//# sourceMappingURL=index.js.map