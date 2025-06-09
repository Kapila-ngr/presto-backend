"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
function authMiddleware(req, res, next) {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const restaurantId = req.params.locationId;
    if (!token || !restaurantId) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing token or restaurant ID' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.restaurantId !== restaurantId) {
            return res.status(403).json({ code: 'FORBIDDEN', message: 'Restaurant ID mismatch' });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({ code: 'INVALID_TOKEN', message: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=auth.js.map