"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.RegisterDto = exports.LoginDto = void 0;
const class_validator_1 = require("class-validator");
class LoginDto {
    identifier;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'E-mail ou nome de usuário é obrigatório' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "identifier", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class RegisterDto {
    fullName;
    email;
    password;
    organizationName;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome completo é obrigatório' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'E-mail é obrigatório' }),
    (0, class_validator_1.IsEmail)({}, { message: 'E-mail em formato inválido' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }),
    (0, class_validator_1.MinLength)(6, { message: 'A senha deve possuir no mínimo 6 caracteres' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "organizationName", void 0);
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'E-mail é obrigatório' }),
    (0, class_validator_1.IsEmail)({}, { message: 'E-mail em formato inválido' }),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
    email;
    token;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'E-mail é obrigatório' }),
    (0, class_validator_1.IsEmail)({}, { message: 'E-mail em formato inválido' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Código de recuperação é obrigatório' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Nova senha é obrigatória' }),
    (0, class_validator_1.MinLength)(6, { message: 'A nova senha deve possuir no mínimo 6 caracteres' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class ChangePasswordDto {
    userId;
    currentPassword;
    newPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'ID do usuário é obrigatório' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Senha atual é obrigatória' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Nova senha é obrigatória' }),
    (0, class_validator_1.MinLength)(6, { message: 'A nova senha deve possuir no mínimo 6 caracteres' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map