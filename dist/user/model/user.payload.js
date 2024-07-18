"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPayload = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_schema_1 = require("./user.schema");
class UserPayload extends (0, swagger_1.PartialType)(user_schema_1.User) {
}
exports.UserPayload = UserPayload;
//# sourceMappingURL=user.payload.js.map