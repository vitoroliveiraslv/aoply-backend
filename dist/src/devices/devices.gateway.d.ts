import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class DevicesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger;
    private readonly latestScreenshots;
    private readonly connectedDevices;
    private readonly socketToDevice;
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    isDeviceConnected(deviceId: string): boolean;
    handleJoinPairing(client: Socket, data: {
        pairingCode?: string;
    }): {
        success: boolean;
        error: string;
        room?: undefined;
    } | {
        error?: undefined;
        success: boolean;
        room: string;
    };
    handleRegisterDevice(client: Socket, data: {
        deviceId?: string;
        token?: string;
    }): {
        room?: undefined;
        success: boolean;
        error: string;
    } | {
        error?: undefined;
        success: boolean;
        room: string;
    };
    handleScreenshotCaptured(client: Socket, data: {
        deviceId: string;
        screenshotDataUrl: string;
        assetName?: string;
    }): {
        success: boolean;
    };
    notifyDevicePaired(pairingCode: string, payload: {
        deviceId: string;
        deviceToken: string;
        organizationId?: string;
    }): void;
    notifyPlaylistUpdated(deviceId: string, playlistId?: string): void;
    requestDeviceScreenshot(deviceId: string): void;
    getLatestScreenshot(deviceId: string): {
        dataUrl: string;
        assetName?: string;
        timestamp: string;
    };
    sendRemoteCommand(deviceId: string, command: string, payload?: any): void;
}
