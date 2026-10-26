export declare class InterleaveRulesDto {
    type: string;
    youtubeFrequency?: number;
    timeMinutesInterval?: number;
    adGroupId?: string;
}
export declare class PlaylistItemInputDto {
    assetId: string;
    position: number;
    category?: string;
    customDurationSeconds?: number;
    isMuted?: boolean;
}
export declare class CreatePlaylistDto {
    name: string;
    description?: string;
    organizationId?: string;
    interleaveRules?: InterleaveRulesDto;
    items?: PlaylistItemInputDto[];
}
export declare class ReorderItemDto {
    itemId: string;
    newPosition: number;
}
export declare class ReorderPlaylistDto {
    orders: ReorderItemDto[];
}
