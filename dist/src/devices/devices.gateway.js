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
var DevicesGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let DevicesGateway = DevicesGateway_1 = class DevicesGateway {
    logger = new common_1.Logger(DevicesGateway_1.name);
    latestScreenshots = new Map();
    connectedDevices = new Map();
    socketToDevice = new Map();
    server;
    handleConnection(client) {
        this.logger.log(`Client conectado ao WebSocket: ${client.id}`);
    }
    handleDisconnect(client) {
        const deviceId = this.socketToDevice.get(client.id);
        if (deviceId) {
            this.connectedDevices.delete(deviceId);
            this.socketToDevice.delete(client.id);
            this.logger.log(`Dispositivo [${deviceId}] desconectado do WebSocket`);
            this.server.emit('admin:devices_updated');
        }
        else {
            this.logger.log(`Client desconectado do WebSocket: ${client.id}`);
        }
    }
    isDeviceConnected(deviceId) {
        return this.connectedDevices.has(deviceId);
    }
    handleJoinPairing(client, data) {
        const rawCode = data?.pairingCode || '';
        const code = rawCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (!code) {
            return { success: false, error: 'Código de pareamento inválido' };
        }
        const room = `pairing:${code}`;
        client.join(room);
        this.logger.log(`TV [${client.id}] entrou na sala de pareamento: ${room}`);
        return { success: true, room };
    }
    handleRegisterDevice(client, data) {
        if (!data?.deviceId) {
            return { success: false, error: 'ID do dispositivo ausente' };
        }
        const room = `device:${data.deviceId}`;
        client.join(room);
        this.connectedDevices.set(data.deviceId, client.id);
        this.socketToDevice.set(client.id, data.deviceId);
        this.logger.log(`Dispositivo [${data.deviceId}] registrado e ONLINE na sala ${room}`);
        this.server.emit('admin:devices_updated');
        return { success: true, room };
    }
    handleScreenshotCaptured(client, data) {
        const timestamp = new Date().toISOString();
        this.latestScreenshots.set(data.deviceId, {
            dataUrl: data.screenshotDataUrl,
            assetName: data.assetName,
            timestamp,
        });
        this.logger.log(`Screenshot recebido do dispositivo ${data.deviceId} (${data.assetName || 'Sem título'})`);
        this.server.emit(`admin:screenshot:${data.deviceId}`, {
            deviceId: data.deviceId,
            screenshotDataUrl: data.screenshotDataUrl,
            assetName: data.assetName,
            timestamp,
        });
        return { success: true };
    }
    notifyDevicePaired(pairingCode, payload) {
        const cleanCode = (pairingCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        const room = `pairing:${cleanCode}`;
        this.logger.log(`Emitindo evento 'device:paired' na sala ${room}`);
        this.server.to(room).emit('device:paired', payload);
    }
    notifyPlaylistUpdated(deviceId, playlistId) {
        const room = `device:${deviceId}`;
        this.logger.log(`Notificando atualização de playlist [${playlistId || 'all'}] para ${room}`);
        this.server.to(room).emit('player:sync', {
            playlistId,
            timestamp: new Date().toISOString(),
        });
    }
    requestDeviceScreenshot(deviceId) {
        const room = `device:${deviceId}`;
        this.logger.log(`Enviando solicitação de screenshot para a sala ${room}`);
        this.server.to(room).emit('player:capture_screenshot', {
            deviceId,
            requestedAt: new Date().toISOString(),
        });
    }
    getLatestScreenshot(deviceId) {
        return this.latestScreenshots.get(deviceId) || null;
    }
    sendRemoteCommand(deviceId, command, payload) {
        const room = `device:${deviceId}`;
        this.server.to(room).emit('player:command', { command, payload, timestamp: new Date().toISOString() });
    }
};
exports.DevicesGateway = DevicesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], DevicesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('pairing:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], DevicesGateway.prototype, "handleJoinPairing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('device:register'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], DevicesGateway.prototype, "handleRegisterDevice", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('device:screenshot_captured'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], DevicesGateway.prototype, "handleScreenshotCaptured", null);
exports.DevicesGateway = DevicesGateway = DevicesGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], DevicesGateway);
//# sourceMappingURL=devices.gateway.js.map