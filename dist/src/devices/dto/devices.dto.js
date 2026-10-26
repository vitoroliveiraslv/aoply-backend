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
exports.TelemetryBatchDto = exports.PlaybackLogEntryDto = exports.TelemetryPingDto = exports.ClaimPairingDto = exports.RequestPairingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RequestPairingDto {
    macAddress;
    osName;
    osVersion;
    appVersion;
    resolution;
}
exports.RequestPairingDto = RequestPairingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestPairingDto.prototype, "macAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestPairingDto.prototype, "osName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestPairingDto.prototype, "osVersion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestPairingDto.prototype, "appVersion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestPairingDto.prototype, "resolution", void 0);
class ClaimPairingDto {
    pairingCode;
    name;
    location;
    organizationId;
    assignedScheduleId;
    fallbackPlaylistId;
}
exports.ClaimPairingDto = ClaimPairingDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 7),
    __metadata("design:type", String)
], ClaimPairingDto.prototype, "pairingCode", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimPairingDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimPairingDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimPairingDto.prototype, "organizationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimPairingDto.prototype, "assignedScheduleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClaimPairingDto.prototype, "fallbackPlaylistId", void 0);
class TelemetryPingDto {
    deviceId;
    storageFreeMb;
    currentAssetId;
    status;
}
exports.TelemetryPingDto = TelemetryPingDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TelemetryPingDto.prototype, "deviceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TelemetryPingDto.prototype, "storageFreeMb", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TelemetryPingDto.prototype, "currentAssetId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TelemetryPingDto.prototype, "status", void 0);
class PlaybackLogEntryDto {
    assetId;
    playlistId;
    startedAt;
    endedAt;
    durationPlayedSeconds;
    completedWithoutInterruption;
    errorMessage;
}
exports.PlaybackLogEntryDto = PlaybackLogEntryDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaybackLogEntryDto.prototype, "assetId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaybackLogEntryDto.prototype, "playlistId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlaybackLogEntryDto.prototype, "startedAt", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlaybackLogEntryDto.prototype, "endedAt", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PlaybackLogEntryDto.prototype, "durationPlayedSeconds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PlaybackLogEntryDto.prototype, "completedWithoutInterruption", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaybackLogEntryDto.prototype, "errorMessage", void 0);
class TelemetryBatchDto {
    deviceId;
    entries;
}
exports.TelemetryBatchDto = TelemetryBatchDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TelemetryBatchDto.prototype, "deviceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlaybackLogEntryDto),
    __metadata("design:type", Array)
], TelemetryBatchDto.prototype, "entries", void 0);
//# sourceMappingURL=devices.dto.js.map