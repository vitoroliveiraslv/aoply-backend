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
exports.PlaylistsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const devices_gateway_1 = require("../devices/devices.gateway");
let PlaylistsService = class PlaylistsService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async notifyAffectedDevices(playlistId) {
        const directDevices = await this.prisma.device.findMany({
            where: { fallbackPlaylistId: playlistId },
            select: { id: true },
        });
        const scheduleRules = await this.prisma.scheduleRule.findMany({
            where: { playlistId },
            select: { scheduleId: true },
        });
        const scheduleIds = scheduleRules.map((r) => r.scheduleId);
        const scheduleDevices = await this.prisma.device.findMany({
            where: { assignedScheduleId: { in: scheduleIds } },
            select: { id: true },
        });
        const playlist = await this.prisma.playlist.findUnique({
            where: { id: playlistId },
            select: { organizationId: true },
        });
        const orgDevices = playlist?.organizationId
            ? await this.prisma.device.findMany({
                where: { organizationId: playlist.organizationId },
                select: { id: true },
            })
            : [];
        const uniqueDeviceIds = new Set([
            ...directDevices.map((d) => d.id),
            ...scheduleDevices.map((d) => d.id),
            ...orgDevices.map((d) => d.id),
        ]);
        for (const deviceId of uniqueDeviceIds) {
            this.gateway.notifyPlaylistUpdated(deviceId, playlistId);
        }
    }
    async create(dto) {
        let orgId = dto.organizationId;
        if (!orgId) {
            let org = await this.prisma.organization.findFirst();
            if (!org) {
                org = await this.prisma.organization.create({
                    data: { name: 'Organização Principal', slug: 'org-principal' },
                });
            }
            orgId = org.id;
        }
        const defaultRules = {
            type: 'INTERVAL_BY_COUNT',
            youtubeFrequency: 3,
            activeDays: [1, 2, 3, 4, 5],
            allDay: true,
            startTime: '08:00',
            endTime: '18:00',
        };
        const rulesToUse = dto.interleaveRules || defaultRules;
        const interleaveRulesString = JSON.stringify(rulesToUse);
        const playlist = await this.prisma.playlist.create({
            data: {
                organizationId: orgId,
                name: dto.name,
                description: dto.description,
                interleaveRules: interleaveRulesString,
                version: 1,
                items: dto.items && dto.items.length > 0
                    ? {
                        create: dto.items.map((item, index) => ({
                            assetId: item.assetId,
                            position: item.position ?? index,
                            category: item.category || 'CONTENT',
                            customDurationSeconds: item.customDurationSeconds,
                            isMuted: item.isMuted ?? false,
                        })),
                    }
                    : undefined,
            },
            include: {
                items: {
                    include: { asset: true },
                    orderBy: { position: 'asc' },
                },
            },
        });
        await this.syncPlaylistSchedule(playlist.id, playlist.organizationId, rulesToUse);
        let parsedRules = null;
        try {
            parsedRules = playlist.interleaveRules ? JSON.parse(playlist.interleaveRules) : null;
        }
        catch {
            parsedRules = null;
        }
        return {
            ...playlist,
            interleaveRules: parsedRules,
        };
    }
    async findAll(organizationId) {
        const playlists = await this.prisma.playlist.findMany({
            where: organizationId ? { organizationId } : {},
            include: {
                items: {
                    include: { asset: true },
                    orderBy: { position: 'asc' },
                },
                _count: {
                    select: { items: true },
                },
            },
            orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
        });
        return playlists.map((p) => {
            let parsedRules = null;
            if (p.interleaveRules) {
                try {
                    parsedRules = typeof p.interleaveRules === 'string' ? JSON.parse(p.interleaveRules) : p.interleaveRules;
                }
                catch {
                    parsedRules = null;
                }
            }
            return {
                ...p,
                interleaveRules: parsedRules,
            };
        });
    }
    async findOne(id) {
        const playlist = await this.prisma.playlist.findUnique({
            where: { id },
            include: {
                items: {
                    include: { asset: true },
                    orderBy: { position: 'asc' },
                },
            },
        });
        if (!playlist)
            throw new common_1.NotFoundException('Playlist não encontrada');
        let parsedRules = null;
        if (playlist.interleaveRules) {
            try {
                parsedRules = JSON.parse(playlist.interleaveRules);
            }
            catch (e) {
                parsedRules = null;
            }
        }
        return {
            ...playlist,
            interleaveRules: parsedRules,
        };
    }
    async addItem(playlistId, itemDto) {
        const playlist = await this.findOne(playlistId);
        const currentMax = playlist.items.length > 0
            ? Math.max(...playlist.items.map((i) => i.position))
            : -1;
        const position = itemDto.position !== undefined ? itemDto.position : currentMax + 1;
        const item = await this.prisma.playlistItem.create({
            data: {
                playlistId,
                assetId: itemDto.assetId,
                position,
                category: itemDto.category || 'CONTENT',
                customDurationSeconds: itemDto.customDurationSeconds,
                isMuted: itemDto.isMuted ?? false,
            },
            include: { asset: true },
        });
        await this.prisma.playlist.update({
            where: { id: playlistId },
            data: { version: { increment: 1 } },
        });
        await this.notifyAffectedDevices(playlistId);
        return item;
    }
    async removeItem(playlistId, itemId) {
        const item = await this.prisma.playlistItem.findUnique({
            where: { id: itemId },
        });
        if (!item || item.playlistId !== playlistId) {
            throw new common_1.NotFoundException('Item não encontrado nesta playlist');
        }
        await this.prisma.playlistItem.delete({ where: { id: itemId } });
        await this.prisma.playlist.update({
            where: { id: playlistId },
            data: { version: { increment: 1 } },
        });
        await this.notifyAffectedDevices(playlistId);
        return { success: true };
    }
    async reorderItems(playlistId, dto) {
        await this.prisma.$transaction(dto.orders.map((order) => this.prisma.playlistItem.update({
            where: { id: order.itemId },
            data: { position: order.newPosition },
        })));
        await this.prisma.playlist.update({
            where: { id: playlistId },
            data: { version: { increment: 1 } },
        });
        await this.notifyAffectedDevices(playlistId);
        return this.findOne(playlistId);
    }
    async update(id, dto) {
        const playlist = await this.prisma.playlist.findUnique({ where: { id } });
        if (!playlist) {
            throw new common_1.NotFoundException('Playlist não encontrada');
        }
        const updated = await this.prisma.playlist.update({
            where: { id },
            data: {
                ...(dto.name ? { name: dto.name.trim() } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                version: { increment: 1 },
            },
            include: {
                items: {
                    include: { asset: true },
                    orderBy: { position: 'asc' },
                },
            },
        });
        await this.notifyAffectedDevices(id);
        return updated;
    }
    async delete(id) {
        const playlist = await this.prisma.playlist.findUnique({ where: { id } });
        if (!playlist) {
            throw new common_1.NotFoundException('Playlist não encontrada');
        }
        await this.prisma.device.updateMany({
            where: { fallbackPlaylistId: id },
            data: { fallbackPlaylistId: null },
        });
        await this.prisma.scheduleRule.deleteMany({
            where: { playlistId: id },
        });
        await this.prisma.playlistItem.deleteMany({
            where: { playlistId: id },
        });
        await this.prisma.playlist.delete({
            where: { id },
        });
        await this.notifyAffectedDevices(id);
        return { success: true };
    }
    async syncPlaylistSchedule(playlistId, orgId, rules) {
        if (!rules || !Array.isArray(rules.activeDays))
            return;
        try {
            let schedule = await this.prisma.schedule.findFirst({
                where: { organizationId: orgId },
            });
            if (!schedule) {
                schedule = await this.prisma.schedule.create({
                    data: {
                        organizationId: orgId,
                        name: 'Grade Semanal Automática',
                        timezone: 'America/Sao_Paulo',
                    },
                });
            }
            await this.prisma.device.updateMany({
                where: { organizationId: orgId, assignedScheduleId: null },
                data: { assignedScheduleId: schedule.id },
            });
            await this.prisma.scheduleRule.deleteMany({
                where: { scheduleId: schedule.id, playlistId },
            });
            const isAllDay = rules.allDay !== false;
            const startTime = isAllDay ? '00:00:00' : (rules.startTime ? (rules.startTime.length === 5 ? `${rules.startTime}:00` : rules.startTime) : '08:00:00');
            const endTime = isAllDay ? '23:59:59' : (rules.endTime ? (rules.endTime.length === 5 ? `${rules.endTime}:00` : rules.endTime) : '18:00:00');
            if (rules.activeDays.length > 0) {
                for (const day of rules.activeDays) {
                    await this.prisma.scheduleRule.create({
                        data: {
                            scheduleId: schedule.id,
                            playlistId,
                            dayOfWeek: day,
                            startTime,
                            endTime,
                            priority: 1,
                            isActive: true,
                        },
                    });
                }
            }
        }
        catch (err) {
            console.error('Erro ao sincronizar grade semanal automática:', err);
        }
    }
    async updateRules(playlistId, rawRules) {
        const existing = await this.prisma.playlist.findUnique({
            where: { id: playlistId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Playlist não encontrada');
        let parsed = rawRules;
        if (typeof parsed === 'string') {
            try {
                parsed = JSON.parse(parsed);
            }
            catch {
                parsed = {};
            }
        }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            parsed = {};
        }
        const cleanRules = {
            type: parsed.type || 'INTERVAL_BY_COUNT',
            youtubeFrequency: typeof parsed.youtubeFrequency === 'number' ? parsed.youtubeFrequency : 3,
            activeDays: Array.isArray(parsed.activeDays)
                ? parsed.activeDays.map(Number).filter((n) => !isNaN(n) && n >= 0 && n <= 6)
                : [1, 2, 3, 4, 5],
            allDay: parsed.allDay !== false,
            startTime: parsed.startTime || undefined,
            endTime: parsed.endTime || undefined,
            description: parsed.description || undefined,
        };
        const playlist = await this.prisma.playlist.update({
            where: { id: playlistId },
            data: {
                interleaveRules: JSON.stringify(cleanRules),
                version: { increment: 1 },
            },
            include: {
                items: {
                    include: { asset: true },
                    orderBy: { position: 'asc' },
                },
            },
        });
        await this.syncPlaylistSchedule(playlist.id, playlist.organizationId, cleanRules);
        await this.notifyAffectedDevices(playlistId);
        return {
            ...playlist,
            interleaveRules: cleanRules,
        };
    }
    async reorderPlaylists(orders) {
        if (!orders || !Array.isArray(orders))
            return { success: true };
        await Promise.all(orders.map(async (item) => {
            try {
                await this.prisma.playlist.update({
                    where: { id: item.id },
                    data: { order: item.order },
                });
            }
            catch {
            }
        }));
        return { success: true };
    }
};
exports.PlaylistsService = PlaylistsService;
exports.PlaylistsService = PlaylistsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, devices_gateway_1.DevicesGateway])
], PlaylistsService);
//# sourceMappingURL=playlists.service.js.map