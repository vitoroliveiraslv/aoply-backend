export declare class RequestPairingDto {
    macAddress?: string;
    osName?: string;
    osVersion?: string;
    appVersion?: string;
    resolution?: string;
}
export declare class ClaimPairingDto {
    pairingCode: string;
    name: string;
    location?: string;
    organizationId?: string;
    assignedScheduleId?: string;
    fallbackPlaylistId?: string;
}
export declare class TelemetryPingDto {
    deviceId: string;
    storageFreeMb?: number;
    currentAssetId?: string;
    status?: string;
}
export declare class PlaybackLogEntryDto {
    assetId: string;
    playlistId?: string;
    startedAt: string;
    endedAt: string;
    durationPlayedSeconds: number;
    completedWithoutInterruption?: boolean;
    errorMessage?: string;
}
export declare class TelemetryBatchDto {
    deviceId: string;
    entries: PlaybackLogEntryDto[];
}
