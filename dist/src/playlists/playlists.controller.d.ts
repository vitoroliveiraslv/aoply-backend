import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto, ReorderPlaylistDto, PlaylistItemInputDto } from './dto/playlists.dto';
export declare class PlaylistsController {
    private readonly playlistsService;
    constructor(playlistsService: PlaylistsService);
    create(dto: CreatePlaylistDto): Promise<{
        id: string;
        organizationId: string;
        name: string;
        description: string | null;
        version: number;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        interleaveRules: any;
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
    }>;
    findAll(organizationId?: string): Promise<{
        id: string;
        organizationId: string;
        name: string;
        description: string | null;
        version: number;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        interleaveRules: any;
        _count: {
            items: number;
        };
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
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        organizationId: string;
        name: string;
        description: string | null;
        version: number;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        interleaveRules: any;
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
    }>;
    addItem(id: string, itemDto: PlaylistItemInputDto): Promise<{
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
    }>;
    removeItem(id: string, itemId: string): Promise<{
        success: boolean;
    }>;
    reorder(id: string, dto: ReorderPlaylistDto): Promise<{
        id: string;
        organizationId: string;
        name: string;
        description: string | null;
        version: number;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        interleaveRules: any;
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
    }>;
    reorderPlaylists(dto: {
        orders: {
            id: string;
            order: number;
        }[];
    }): Promise<{
        success: boolean;
    }>;
    update(id: string, dto: {
        name?: string;
        description?: string;
    }): Promise<{
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
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    updateRules(id: string, rules: any): Promise<{
        id: string;
        organizationId: string;
        name: string;
        description: string | null;
        version: number;
        order: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        interleaveRules: {
            type: any;
            youtubeFrequency: any;
            activeDays: any;
            allDay: boolean;
            startTime: any;
            endTime: any;
            description: any;
        };
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
    }>;
}
