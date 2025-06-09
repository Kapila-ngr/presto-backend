"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const driver_controller_1 = require("../controllers/driver.controller");
const shift_controller_1 = require("../controllers/shift.controller");
const router = (0, express_1.Router)();
router.post('/create', driver_controller_1.createDriver);
router.post('/login', driver_controller_1.driverLogin);
router.get('/:locationId/list', driver_controller_1.listDrivers);
router.get('/:locationId/:id', driver_controller_1.getDriver);
router.put('/:id', driver_controller_1.updateDriver);
router.delete('/:id', driver_controller_1.deleteDriver);
// Shift-related routes for drivers
router.post('/shifts', shift_controller_1.createShift); // Create shift for driver
router.put('/shifts/:id', shift_controller_1.updateShift); // Update shift by shift id
router.get('/:locationId/:driverId/is-on-shift', shift_controller_1.isDriverOnShift); // Check if driver is on shift
exports.default = router;
//# sourceMappingURL=driver.routes.js.map