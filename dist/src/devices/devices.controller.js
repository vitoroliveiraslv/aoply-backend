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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesController = void 0;
const common_1 = require("@nestjs/common");
const devices_service_1 = require("./devices.service");
const devices_dto_1 = require("./dto/devices.dto");
let DevicesController = class DevicesController {
    devicesService;
    constructor(devicesService) {
        this.devicesService = devicesService;
    }
    requestPairing(dto, ip) {
        return this.devicesService.requestPairing(dto, ip);
    }
    claimPairing(dto) {
        return this.devicesService.claimPairing(dto);
    }
    findAll(organizationId) {
        return this.devicesService.findAll(organizationId);
    }
    findOne(id) {
        return this.devicesService.findOne(id);
    }
    getManifest(id) {
        return this.devicesService.getDeviceManifest(id);
    }
    recordPing(dto) {
        return this.devicesService.recordPing(dto);
    }
    recordTelemetry(dto) {
        return this.devicesService.recordPlaybackBatch(dto);
    }
    sendCommand(id, body) {
        return this.devicesService.sendRemoteCommand(id, body.command, body.payload);
    }
    requestScreenshot(id) {
        return this.devicesService.requestScreenshot(id);
    }
    getScreenshot(id) {
        return {
            deviceId: id,
            screenshot: this.devicesService.getLatestScreenshot(id),
        };
    }
    deleteDisconnected() {
        return this.devicesService.deleteDisconnected();
    }
    delete(id) {
        return this.devicesService.delete(id);
    }
};
exports.DevicesController = DevicesController;
__decorate([
    (0, common_1.Post)('request-pairing'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [devices_dto_1.RequestPairingDto, String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "requestPairing", null);
__decorate([
    (0, common_1.Post)('claim-pairing'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [devices_dto_1.ClaimPairingDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "claimPairing", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/manifest'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "getManifest", null);
__decorate([
    (0, common_1.Post)('ping'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [devices_dto_1.TelemetryPingDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "recordPing", null);
__decorate([
    (0, common_1.Post)('telemetry'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [devices_dto_1.TelemetryBatchDto]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "recordTelemetry", null);
__decorate([
    (0, common_1.Post)(':id/command'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "sendCommand", null);
__decorate([
    (0, common_1.Post)(':id/screenshot/request'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "requestScreenshot", null);
__decorate([
    (0, common_1.Get)(':id/screenshot'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "getScreenshot", null);
__decorate([
    (0, common_1.Delete)('cleanup/disconnected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "deleteDisconnected", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "delete", null);
exports.DevicesController = DevicesController = __decorate([
    (0, common_1.Controller)('api/v1/devices'),
    __metadata("design:paramtypes", [devices_service_1.DevicesService])
], DevicesController);
//# sourceMappingURL=devices.controller.js.map