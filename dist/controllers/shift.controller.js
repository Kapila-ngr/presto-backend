"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShift = createShift;
exports.updateShift = updateShift;
exports.isDriverOnShift = isDriverOnShift;
const typeorm_1 = require("typeorm");
const Shift_1 = require("../entities/Shift");
const Driver_1 = require("../entities/Driver");
const shift_dto_1 = require("../dtos/shift.dto");
const class_validator_1 = require("class-validator");
const typeorm_2 = require("typeorm");
// Create a new shift
async function createShift(req, res) {
    const dto = Object.assign(new shift_dto_1.CreateShiftDto(), req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid shift data', errors });
    }
    const driverRepo = (0, typeorm_1.getRepository)(Driver_1.Driver);
    const shiftRepo = (0, typeorm_1.getRepository)(Shift_1.Shift);
    const driver = await driverRepo.findOne({ where: { id: dto.driverId } });
    if (!driver) {
        return res.status(404).json({ code: 'DRIVER_NOT_FOUND', message: 'Driver not found' });
    }
    const shift = shiftRepo.create({
        driver,
        shiftStart: new Date(dto.shiftStart),
        shiftEnd: new Date(dto.shiftEnd),
        restaurantId: dto.restaurantId,
    });
    await shiftRepo.save(shift);
    res.status(201).json(shift);
}
// Update an existing shift
async function updateShift(req, res) {
    const shiftId = req.params.id;
    const dto = Object.assign(new shift_dto_1.UpdateShiftDto(), req.body);
    const errors = await (0, class_validator_1.validate)(dto);
    if (errors.length > 0) {
        return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid shift data', errors });
    }
    const shiftRepo = (0, typeorm_1.getRepository)(Shift_1.Shift);
    const shift = await shiftRepo.findOne({ where: { id: shiftId } });
    if (!shift) {
        return res.status(404).json({ code: 'SHIFT_NOT_FOUND', message: 'Shift not found' });
    }
    if (dto.shiftStart)
        shift.shiftStart = new Date(dto.shiftStart);
    if (dto.shiftEnd)
        shift.shiftEnd = new Date(dto.shiftEnd);
    if (dto.restaurantId !== undefined)
        shift.restaurantId = dto.restaurantId;
    await shiftRepo.save(shift);
    res.status(200).json(shift);
}
// Check if a driver is currently on shift
async function isDriverOnShift(req, res) {
    const driverId = req.params.driverId;
    const now = new Date();
    const shiftRepo = (0, typeorm_1.getRepository)(Shift_1.Shift);
    const onShift = await shiftRepo.findOne({
        where: {
            driver: { id: driverId },
            shiftStart: (0, typeorm_2.LessThanOrEqual)(now),
            shiftEnd: (0, typeorm_2.MoreThanOrEqual)(now)
        },
        relations: ['driver']
    });
    res.status(200).json({ driverId, onShift: !!onShift });
}
//# sourceMappingURL=shift.controller.js.map