"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDriver = createDriver;
exports.listDrivers = listDrivers;
exports.getDriver = getDriver;
exports.updateDriver = updateDriver;
exports.deleteDriver = deleteDriver;
exports.driverLogin = driverLogin;
const typeorm_1 = require("typeorm");
const Driver_1 = require("../entities/Driver");
const driver_dto_1 = require("../dtos/driver.dto");
const class_validator_1 = require("class-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Create a new driver
async function createDriver(req, res) {
    const dto = Object.assign(new driver_dto_1.CreateDriverDto(), req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid driver data', errors });
    }
    const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
    const driver = driverRepo.create(dto);
    await driverRepo.save(driver);
    res.status(201).json({ ...driver, password: undefined }); // Do not return password
}
// Get all drivers
async function listDrivers(req, res) {
    const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
    const drivers = await driverRepo.find();
    res.status(200).json(drivers.map(d => ({ ...d, password: undefined })));
}
// Get a single driver by ID
async function getDriver(req, res) {
    const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
    const driver = await driverRepo.findOne({ where: { id: req.params.id } });
    if (!driver) {
        return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
    }
    res.status(200).json({ ...driver, password: undefined });
}
// Update a driver by ID
async function updateDriver(req, res) {
    const dto = Object.assign(new driver_dto_1.UpdateDriverDto(), req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid driver data', errors });
    }
    const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
    const driver = await driverRepo.findOne({ where: { id: req.params.id } });
    if (!driver) {
        return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
    }
    driverRepo.merge(driver, dto);
    await driverRepo.save(driver);
    res.status(200).json({ ...driver, password: undefined });
}
// Delete a driver by ID
async function deleteDriver(req, res) {
    const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
    const result = await driverRepo.delete(req.params.id);
    if (result.affected === 0) {
        return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
    }
    res.status(204).send();
}
// Driver login function (passport-local style, but manual)
async function driverLogin(req, res) {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Phone number and password are required' });
    }
    const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
    const driver = await driverRepo.findOne({ where: { phoneNumber } });
    if (!driver) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid phone number or password' });
    }
    const isMatch = await bcrypt_1.default.compare(password, driver.password);
    if (!isMatch) {
        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid phone number or password' });
    }
    // Remove password before sending response
    const { password: _, ...driverSafe } = driver;
    res.status(200).json({ message: 'Login successful', driver: driverSafe });
}
//# sourceMappingURL=driver.controller.js.map