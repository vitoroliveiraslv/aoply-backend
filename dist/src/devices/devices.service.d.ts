import { PrismaService } from '../prisma/prisma.service';
import { DevicesGateway } from './devices.gateway';
import { RequestPairingDto, ClaimPairingDto, TelemetryPingDto, TelemetryBatchDto } from './dto/devices.dto';
export declare class DevicesService {
    private readonly prisma;
    private readonly gateway;
    private readonly logger;
    constructor(prisma: PrismaService, gateway: DevicesGateway);
    private generateSixDigitCode;
    requestPairing(dto: RequestPairingDto, ip?: string): Promise<{
        deviceId: string;
        pairingCode: string;
        formattedCode: string;
        expiresAt: Date;
        expiresInSeconds: number;
    }>;
    claimPairing(dto: ClaimPairingDto): Promise<{
        success: boolean;
        device: {
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
        };
    }>;
    findAll(organizationId?: string): Promise<{
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
        lastPingAt: Date | null;
        currentAssetId: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        assignedSchedule: {
            id: string;
            organizationId: string;
            name: string;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
        };
        fallbackPlaylist: {
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
    }[]>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteDisconnected(): Promise<{
        success: boolean;
        count: number;
    }>;
    findOne(id: string): Promise<{
        assignedSchedule: {
            rules: ({
                playlist: {
                    items: ({
                        asset: {
                            id: string;
                            organizationId: string;
                            name: string;
                            type: string;
                            storageKey: string | null;
                            cdnUrl: string | null;
                            thumbnailUrl: string | null;
                            fileSizeBytes: bigint | null;
                            checksumSha256: string | null;
                            transcodeStatus: string;
                            externalId: string | null;
                            durationSeconds: number;
                            resolutionWidth: number | null;
                            resolutionHeight: number | null;
                            mimeType: string | null;
                            createdById: string | null;
                            createdAt: Date;
                            updatedAt: Date;
                        };
                    } & {
                        id: string;
                        playlistId: string;
                        assetId: string;
                        position: number;
                        category: string;
                        customDurationSeconds: number | null;
                        isMuted: boolean;
                        createdAt: Date;
                    })[];
                } & {
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
        };
        fallbackPlaylist: {
            items: ({
                asset: {
                    id: string;
                    organizationId: string;
                    name: string;
                    type: string;
                    storageKey: string | null;
                    cdnUrl: string | null;
                    thumbnailUrl: string | null;
                    fileSizeBytes: bigint | null;
                    checksumSha256: string | null;
                    transcodeStatus: string;
                    externalId: string | null;
                    durationSeconds: number;
                    resolutionWidth: number | null;
                    resolutionHeight: number | null;
                    mimeType: string | null;
                    createdById: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                playlistId: string;
                assetId: string;
                position: number;
                category: string;
                customDurationSeconds: number | null;
                isMuted: boolean;
                createdAt: Date;
            })[];
        } & {
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
    getDeviceManifest(deviceId: string): Promise<{
        deviceId: string;
        deviceName: string;
        timestamp: string;
        playlist: {
            id: any;
            name: any;
            version: any;
            interleaveRules: any;
            items: any;
        };
    }>;
    recordPing(dto: TelemetryPingDto): Promise<{
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
    recordPlaybackBatch(dto: TelemetryBatchDto): Promise<{
        count: number;
    }>;
    requestScreenshot(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getLatestScreenshot(id: string): {
        dataUrl: string;
        assetName?: string;
        timestamp: string;
    };
    sendRemoteCommand(id: string, command: string, payload?: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
