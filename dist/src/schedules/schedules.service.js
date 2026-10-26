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
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const devices_gateway_1 = require("../devices/devices.gateway");
let SchedulesService = class SchedulesService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async notifyAssignedDevices(scheduleId) {
        const devices = await this.prisma.device.findMany({
            where: { assignedScheduleId: scheduleId },
            select: { id: true },
        });
        for (const device of devices) {
            this.gateway.notifyPlaylistUpdated(device.id);
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
        return this.prisma.schedule.create({
            data: {
                organizationId: orgId,
                name: dto.name,
                timezone: dto.timezone || 'America/Sao_Paulo',
                rules: dto.rules && dto.rules.length > 0
                    ? {
                        create: dto.rules.map((rule) => ({
                            playlistId: rule.playlistId,
                            dayOfWeek: rule.dayOfWeek,
                            startTime: rule.startTime.length === 5 ? `${rule.startTime}:00` : rule.startTime,
                            endTime: rule.endTime.length === 5 ? `${rule.endTime}:00` : rule.endTime,
                            priority: rule.priority || 1,
                        })),
                    }
                    : undefined,
            },
            include: {
                rules: {
                    include: { playlist: true },
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                },
            },
        });
    }
    async findAll(organizationId) {
        return this.prisma.schedule.findMany({
            where: organizationId ? { organizationId } : {},
            include: {
                rules: {
                    include: { playlist: true },
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                },
                _count: {
                    select: { devices: true, rules: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(id) {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id },
            include: {
                rules: {
                    include: { playlist: true },
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                },
                devices: true,
            },
        });
        if (!schedule)
            throw new common_1.NotFoundException('Agendador não encontrado');
        return schedule;
    }
    async updateRules(scheduleId, dto) {
        await this.findOne(scheduleId);
        await this.prisma.$transaction([
            this.prisma.scheduleRule.deleteMany({
                where: { scheduleId },
            }),
            this.prisma.scheduleRule.createMany({
                data: dto.rules.map((rule) => ({
                    scheduleId,
                    playlistId: rule.playlistId,
                    dayOfWeek: rule.dayOfWeek,
                    startTime: rule.startTime.length === 5 ? `${rule.startTime}:00` : rule.startTime,
                    endTime: rule.endTime.length === 5 ? `${rule.endTime}:00` : rule.endTime,
                    priority: rule.priority || 1,
                })),
            }),
        ]);
        await this.notifyAssignedDevices(scheduleId);
        return this.findOne(scheduleId);
    }
    async assignToDevice(scheduleId, deviceId) {
        await this.findOne(scheduleId);
        const device = await this.prisma.device.update({
            where: { id: deviceId },
            data: { assignedScheduleId: scheduleId },
        });
        this.gateway.notifyPlaylistUpdated(deviceId);
        return device;
    }
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, devices_gateway_1.DevicesGateway])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map