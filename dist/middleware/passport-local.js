"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const typeorm_1 = require("typeorm");
const Driver_1 = require("../entities/Driver");
const bcrypt_1 = __importDefault(require("bcrypt"));
passport_1.default.use('driver-local', new passport_local_1.Strategy({
    usernameField: 'email', // or 'email' if you want
    passwordField: 'password',
}, async (email, password, done) => {
    try {
        const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
        const driver = await driverRepo.findOne({ where: { email } });
        if (!driver)
            return done(null, false, { message: 'Incorrect phone number.' });
        const isMatch = await bcrypt_1.default.compare(password, driver.password);
        if (!isMatch)
            return done(null, false, { message: 'Incorrect password.' });
        // Never return password
        const { password: _, ...driverSafe } = driver;
        return done(null, driverSafe);
    }
    catch (err) {
        return done(err);
    }
}));
passport_1.default.serializeUser((user, done) => done(null, user.id));
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
        const driver = await driverRepo.findOne({ where: { id } });
        if (driver) {
            const { password, ...driverSafe } = driver;
            done(null, driverSafe);
        }
        else {
            done(null, false);
        }
    }
    catch (err) {
        done(err);
    }
});
exports.default = passport_1.default;
//# sourceMappingURL=passport-local.js.map