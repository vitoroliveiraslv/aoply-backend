export declare enum AssetType {
    VIDEO = "VIDEO",
    YOUTUBE = "YOUTUBE",
    IMAGE = "IMAGE"
}
export declare class CreateYouTubeAssetDto {
    url: string;
    name?: string;
    durationSeconds?: number;
    mimeType?: string;
    organizationId?: string;
}
export declare class CreateLocalVideoAssetDto {
    name: string;
    cdnUrl: string;
    storageKey?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    fileSizeBytes?: number;
    checksumSha256?: string;
    organizationId?: string;
}
