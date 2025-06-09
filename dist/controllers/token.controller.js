"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
async function generateToken(req, res) {
    const { restaurantId } = req.body;
    if (!restaurantId) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'restaurantId is required' });
    }
    const payload = { restaurantId };
    const options = { expiresIn: 60 * 60 }; // 1 hour in seconds
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
    res.status(200).json({ token });
}
//# sourceMappingURL=token.controller.js.map