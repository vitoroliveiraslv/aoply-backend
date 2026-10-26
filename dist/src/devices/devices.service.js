"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DevicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const devices_gateway_1 = require("./devices.gateway");
const crypto = __importStar(require("crypto"));
let DevicesService = DevicesService_1 = class DevicesService {
    prisma;
    gateway;
    logger = new common_1.Logger(DevicesService_1.name);
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    generateSixDigitCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async requestPairing(dto, ip) {
        try {
            await this.prisma.device.deleteMany({
                where: {
                    status: 'PENDING_PAIRING',
                    OR: [
                        { pairingCodeExpiresAt: { lt: new Date() } },
                        ...(ip ? [{ ipAddress: ip }] : []),
                    ],
                },
            });
        }
        catch (e) {
            this.logger.warn(`Falha na limpeza de pareamentos pendentes antigos: ${e?.message}`);
        }
        const pairingCode = this.generateSixDigitCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const device = await this.prisma.device.create({
            data: {
                pairingCode,
                pairingCodeExpiresAt: expiresAt,
                status: 'PENDING_PAIRING',
                ipAddress: ip,
                macAddress: dto.macAddress,
                osName: dto.osName || 'Android TV',
                osVersion: dto.osVersion,
                appVersion: dto.appVersion,
                resolution: dto.resolution || '1920x1080',
            },
        });
        const formattedCode = `${pairingCode.slice(0, 3)}-${pairingCode.slice(3)}`;
        this.logger.log(`Novo código de pareamento gerado: ${formattedCode} para o dispositivo ${device.id}`);
        return {
            deviceId: device.id,
            pairingCode,
            formattedCode,
            expiresAt,
            expiresInSeconds: 600,
        };
    }
    async claimPairing(dto) {
        const cleanCode = dto.pairingCode.replace(/[^0-9]/g, '');
        const device = await this.prisma.device.findFirst({
            where: {
                pairingCode: cleanCode,
                pairingCodeExpiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!device) {
            throw new common_1.BadRequestException('Código de pareamento inválido ou expirado. Verifique a tela da TV.');
        }
        let orgId = dto.organizationId;
        if (!orgId) {
            let defaultOrg = await this.prisma.organization.findFirst();
            if (!defaultOrg) {
                defaultOrg = await this.prisma.organization.create({
                    data: {
                        name: 'Organização Principal',
                        slug: 'org-principal',
                    },
                });
            }
            orgId = defaultOrg.id;
        }
        const deviceToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(deviceToken).digest('hex');
        let validScheduleId = null;
        if (dto.assignedScheduleId && dto.assignedScheduleId.trim().length > 0) {
            const sched = await this.prisma.schedule.findUnique({ where: { id: dto.assignedScheduleId } });
            if (sched)
                validScheduleId = sched.id;
        }
        let validPlaylistId = null;
        if (dto.fallbackPlaylistId && dto.fallbackPlaylistId.trim().length > 0) {
            const pl = await this.prisma.playlist.findUnique({ where: { id: dto.fallbackPlaylistId } });
            if (pl)
                validPlaylistId = pl.id;
        }
        const updatedDevice = await this.prisma.device.update({
            where: { id: device.id },
            data: {
                name: dto.name,
                location: dto.location,
                organizationId: orgId,
                assignedScheduleId: validScheduleId,
                fallbackPlaylistId: validPlaylistId,
                deviceTokenHash: tokenHash,
                pairingCode: null,
                pairingCodeExpiresAt: null,
                status: 'ONLINE',
                lastPingAt: new Date(),
            },
        });
        this.gateway.notifyDevicePaired(cleanCode, {
            deviceId: updatedDevice.id,
            deviceToken,
            organizationId: orgId,
        });
        this.logger.log(`Dispositivo [${updatedDevice.id} - ${dto.name}] pareado com sucesso!`);
        return {
            success: true,
            device: updatedDevice,
        };
    }
    async findAll(organizationId) {
        const devices = await this.prisma.device.findMany({
            where: {
                ...(organizationId ? { organizationId } : {}),
                deviceTokenHash: { not: null },
                status: { not: 'PENDING_PAIRING' },
            },
            include: {
                assignedSchedule: true,
                fallbackPlaylist: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        const now = Date.now();
        return devices.map((d) => {
            const isWsConnected = this.gateway.isDeviceConnected(d.id);
            const isPingRecent = d.lastPingAt && (now - new Date(d.lastPingAt).getTime()) < 120000;
            const isOnline = isWsConnected || isPingRecent;
            const effectiveStatus = isOnline ? 'ONLINE' : 'OFFLINE';
            return {
                ...d,
                status: effectiveStatus,
            };
        });
    }
    async delete(id) {
        const device = await this.prisma.device.findUnique({ where: { id } });
        if (!device)
            throw new common_1.NotFoundException('Dispositivo não encontrado');
        try {
            this.gateway.sendRemoteCommand(id, 'player:unpair');
        }
        catch (e) {
            this.logger.warn(`Não foi possível enviar comando unpair para ${id}: ${e?.message}`);
        }
        await this.prisma.device.delete({ where: { id } });
        this.logger.log(`Dispositivo [${id} - ${device.name || 'Sem nome'}] excluído com sucesso.`);
        return { success: true, message: `Dispositivo excluído com sucesso.` };
    }
    async deleteDisconnected() {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const result = await this.prisma.device.deleteMany({
            where: {
                OR: [
                    { status: 'OFFLINE' },
                    { status: 'PENDING_PAIRING' },
                    { lastPingAt: null },
                    { lastPingAt: { lt: twoMinutesAgo } },
                ],
            },
        });
        this.logger.log(`${result.count} dispositivo(s) desconectado(s) excluído(s).`);
        return { success: true, count: result.count };
    }
    async findOne(id) {
        const device = await this.prisma.device.findUnique({
            where: { id },
            include: {
                assignedSchedule: {
                    include: {
                        rules: {
                            include: { playlist: { include: { items: { include: { asset: true } } } } },
                        },
                    },
                },
                fallbackPlaylist: {
                    include: { items: { include: { asset: true } } },
                },
            },
        });
        if (!device)
            throw new common_1.NotFoundException('Dispositivo não encontrado');
        return device;
    }
    async getDeviceManifest(deviceId) {
        const device = await this.findOne(deviceId);
        const now = new Date();
        const currentDayOfWeek = now.getDay();
        const currentTimeStr = now.toTimeString().split(' ')[0];
        let activePlaylist = null;
        if (device.assignedSchedule && device.assignedSchedule.rules?.length > 0) {
            const activeRule = device.assignedSchedule.rules.find((rule) => {
                return (rule.isActive &&
                    rule.dayOfWeek === currentDayOfWeek &&
                    currentTimeStr >= rule.startTime &&
                    currentTimeStr <= rule.endTime);
            });
            if (activeRule && activeRule.playlist) {
                activePlaylist = activeRule.playlist;
            }
        }
        if (!activePlaylist) {
            if (device.fallbackPlaylist) {
                let parsedRules = null;
                try {
                    parsedRules = device.fallbackPlaylist.interleaveRules ? JSON.parse(device.fallbackPlaylist.interleaveRules) : null;
                }
                catch { }
                if (!parsedRules?.activeDays || parsedRules.activeDays.includes(currentDayOfWeek)) {
                    activePlaylist = device.fallbackPlaylist;
                }
            }
            if (!activePlaylist && device.organizationId) {
                const orgPlaylists = await this.prisma.playlist.findMany({
                    where: { organizationId: device.organizationId, isActive: true },
                    include: {
                        items: {
                            include: { asset: true },
                            orderBy: { position: 'asc' },
                        },
                    },
                });
                for (const pl of orgPlaylists) {
                    try {
                        const r = pl.interleaveRules ? JSON.parse(pl.interleaveRules) : null;
                        if (r?.activeDays && r.activeDays.includes(currentDayOfWeek)) {
                            activePlaylist = pl;
                            break;
                        }
                    }
                    catch { }
                }
                if (!activePlaylist && orgPlaylists.length > 0) {
                    activePlaylist = orgPlaylists[0];
                }
            }
        }
        const items = (activePlaylist?.items || [])
            .sort((a, b) => a.position - b.position)
            .map((item) => ({
            id: item.id,
            position: item.position,
            category: item.category,
            customDurationSeconds: item.customDurationSeconds || item.asset.durationSeconds,
            isMuted: item.isMuted,
            asset: {
                id: item.asset.id,
                name: item.asset.name,
                type: item.asset.type,
                cdnUrl: item.asset.cdnUrl,
                checksumSha256: item.asset.checksumSha256,
                fileSizeBytes: item.asset.fileSizeBytes ? item.asset.fileSizeBytes.toString() : null,
                externalId: item.asset.externalId,
                durationSeconds: item.asset.durationSeconds,
            },
        }));
        let parsedInterleaveRules = null;
        if (activePlaylist?.interleaveRules) {
            try {
                parsedInterleaveRules = JSON.parse(activePlaylist.interleaveRules);
            }
            catch (e) {
                parsedInterleaveRules = null;
            }
        }
        return {
            deviceId: device.id,
            deviceName: device.name,
            timestamp: now.toISOString(),
            playlist: activePlaylist
                ? {
                    id: activePlaylist.id,
                    name: activePlaylist.name,
                    version: activePlaylist.version,
                    interleaveRules: parsedInterleaveRules || {
                        type: 'INTERVAL_BY_COUNT',
                        youtubeFrequency: 3,
                    },
                    items,
                }
                : null,
        };
    }
    async recordPing(dto) {
        return this.prisma.device.update({
            where: { id: dto.deviceId },
            data: {
                lastPingAt: new Date(),
                status: dto.status || 'ONLINE',
                storageFreeMb: dto.storageFreeMb,
                currentAssetId: dto.currentAssetId,
            },
        });
    }
    async recordPlaybackBatch(dto) {
        if (!dto.entries || dto.entries.length === 0)
            return { count: 0 };
        const records = dto.entries.map((entry) => ({
            deviceId: dto.deviceId,
            assetId: entry.assetId,
            playlistId: entry.playlistId,
            startedAt: new Date(entry.startedAt),
            endedAt: new Date(entry.endedAt),
            durationPlayedSeconds: entry.durationPlayedSeconds,
            completedWithoutInterruption: entry.completedWithoutInterruption ?? true,
            errorMessage: entry.errorMessage,
        }));
        await this.prisma.playbackLog.createMany({
            data: records,
        });
        return { count: records.length };
    }
    async requestScreenshot(id) {
        const device = await this.findOne(id);
        this.gateway.requestDeviceScreenshot(device.id);
        return { success: true, message: 'Solicitação de captura enviada para a TV' };
    }
    getLatestScreenshot(id) {
        return this.gateway.getLatestScreenshot(id);
    }
    async sendRemoteCommand(id, command, payload) {
        const device = await this.findOne(id);
        this.gateway.sendRemoteCommand(device.id, command, payload);
        return { success: true, message: `Comando ${command} enviado para a tela ${device.name}` };
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = DevicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, devices_gateway_1.DevicesGateway])
], DevicesService);
//# sourceMappingURL=devices.service.js.map