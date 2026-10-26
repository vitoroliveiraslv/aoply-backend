import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto, UpdateScheduleRulesDto } from './dto/schedules.dto';
import { DevicesGateway } from '../devices/devices.gateway';
export declare class SchedulesService {
    private readonly prisma;
    private readonly gateway;
    constructor(prisma: PrismaService, gateway: DevicesGateway);
    private notifyAssignedDevices;
    create(dto: CreateScheduleDto): Promise<{
        rules: ({
            playlist: {
                id: string;
                organizationId: string;
                name: string;
                description: string | null;
                interleaveRules: string | null;
                version: number;
                order: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            scheduleId: string;
            playlistId: string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            priority: number;
            isActive: boolean;
        })[];
    } & {
        id: string;
        organizationId: string;
        name: string;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(organizationId?: string): Promise<({
        _count: {
            devices: number;
            rules: number;
        };
        rules: ({
            playlist: {
                id: string;
                organizationId: string;
                name: string;
                description: string | null;
                interleaveRules: string | null;
                version: number;
                order: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            scheduleId: string;
            playlistId: string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            priority: number;
            isActive: boolean;
        })[];
    } & {
        id: string;
        organizationId: string;
        name: string;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        devices: {
            id: string;
            organizationId: string | null;
            name: string | null;
            location: string | null;
            pairingCode: string | null;
            pairingCodeExpiresAt: Date | null;
            deviceTokenHash: string | null;
            assignedScheduleId: string | null;
            fallbackPlaylistId: string | null;
            ipAddress: string | null;
            macAddress: string | null;
            appVersion: string | null;
            osName: string | null;
            osVersion: string | null;
            resolution: string | null;
            storageFreeMb: number | null;
            status: string;
            lastPingAt: Date | null;
            currentAssetId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        rules: ({
            playlist: {
                id: string;
                organizationId: string;
                name: string;
                description: string | null;
                interleaveRules: string | null;
                version: number;
                order: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            scheduleId: string;
            playlistId: string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            priority: number;
            isActive: boolean;
        })[];
    } & {
        id: string;
        organizationId: string;
        name: string;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRules(scheduleId: string, dto: UpdateScheduleRulesDto): Promise<{
        devices: {
            id: string;
            organizationId: string | null;
            name: string | null;
            location: string | null;
            pairingCode: string | null;
            pairingCodeExpiresAt: Date | null;
            deviceTokenHash: string | null;
            assignedScheduleId: string | null;
            fallbackPlaylistId: string | null;
            ipAddress: string | null;
            macAddress: string | null;
            appVersion: string | null;
            osName: string | null;
            osVersion: string | null;
            resolution: string | null;
            storageFreeMb: number | null;
            status: string;
            lastPingAt: Date | null;
            currentAssetId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        rules: ({
            playlist: {
                id: string;
                organizationId: string;
                name: string;
                description: string | null;
                interleaveRules: string | null;
                version: number;
                order: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            scheduleId: string;
            playlistId: string;
            dayOfWeek: number;
            startTime: string;
            endTime: string;
            priority: number;
            isActive: boolean;
        })[];
    } & {
        id: string;
        organizationId: string;
        name: string;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignToDevice(scheduleId: string, deviceId: string): Promise<{
        id: string;
        organizationId: string | null;
        name: string | null;
        location: string | null;
        pairingCode: string | null;
        pairingCodeExpiresAt: Date | null;
        deviceTokenHash: string | null;
        assignedScheduleId: string | null;
        fallbackPlaylistId: string | null;
        ipAddress: string | null;
        macAddress: string | null;
        appVersion: string | null;
        osName: string | null;
        osVersion: string | null;
        resolution: string | null;
        storageFreeMb: number | null;
        status: string;
        lastPingAt: Date | null;
        currentAssetId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
