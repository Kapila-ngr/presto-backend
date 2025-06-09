"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
async function validate(data, type) {
    const instance = (0, class_transformer_1.plainToClass)(type, data);
    const errors = await (0, class_validator_1.validate)(instance);
    if (errors.length)
        return null;
    return instance;
}
//# sourceMappingURL=validator.js.map