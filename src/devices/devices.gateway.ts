import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DevicesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(DevicesGateway.name);
  private readonly latestScreenshots = new Map<string, { dataUrl: string; assetName?: string; timestamp: string }>();
  private readonly connectedDevices = new Map<string, string>(); // deviceId -> socketId
  private readonly socketToDevice = new Map<string, string>(); // socketId -> deviceId

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client conectado ao WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const deviceId = this.socketToDevice.get(client.id);
    if (deviceId) {
      this.connectedDevices.delete(deviceId);
      this.socketToDevice.delete(client.id);
      this.logger.log(`Dispositivo [${deviceId}] desconectado do WebSocket`);
      // Notifica o painel administrativo imediatamente
      this.server.emit('admin:devices_updated');
    } else {
      this.logger.log(`Client desconectado do WebSocket: ${client.id}`);
    }
  }

  /**
   * Verifica se a Smart TV está com conexão WebSocket ativa em tempo real
   */
  isDeviceConnected(deviceId: string): boolean {
    return this.connectedDevices.has(deviceId);
  }

  /**
   * TV aguardando pareamento se conecta e entra na sala do seu código
   */
  @SubscribeMessage('pairing:join')
  handleJoinPairing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pairingCode?: string },
  ) {
    const rawCode = data?.pairingCode || '';
    const code = rawCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!code) {
      return { success: false, error: 'Código de pareamento inválido' };
    }
    const room = `pairing:${code}`;
    client.join(room);
    this.logger.log(`TV [${client.id}] entrou na sala de pareamento: ${room}`);
    return { success: true, room };
  }

  /**
   * Dispositivo já pareado se autentica e entra na sua sala exclusiva
   */
  @SubscribeMessage('device:register')
  handleRegisterDevice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceId?: string; token?: string },
  ) {
    if (!data?.deviceId) {
      return { success: false, error: 'ID do dispositivo ausente' };
    }
    const room = `device:${data.deviceId}`;
    client.join(room);
    this.connectedDevices.set(data.deviceId, client.id);
    this.socketToDevice.set(client.id, data.deviceId);
    this.logger.log(`Dispositivo [${data.deviceId}] registrado e ONLINE na sala ${room}`);
    
    // Notifica o CMS sobre a presença ativa do dispositivo
    this.server.emit('admin:devices_updated');
    return { success: true, room };
  }

  /**
   * Smart TV envia a captura de tela solicitada pelo painel administrativo
   */
  @SubscribeMessage('device:screenshot_captured')
  handleScreenshotCaptured(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deviceId: string; screenshotDataUrl: string; assetName?: string },
  ) {
    const timestamp = new Date().toISOString();
    this.latestScreenshots.set(data.deviceId, {
      dataUrl: data.screenshotDataUrl,
      assetName: data.assetName,
      timestamp,
    });
    this.logger.log(`Screenshot recebido do dispositivo ${data.deviceId} (${data.assetName || 'Sem título'})`);

    // Notifica administradores que estão com o modal de visualização aberto
    this.server.emit(`admin:screenshot:${data.deviceId}`, {
      deviceId: data.deviceId,
      screenshotDataUrl: data.screenshotDataUrl,
      assetName: data.assetName,
      timestamp,
    });

    return { success: true };
  }

  /**
   * Notifica a TV que o código foi reivindicado com sucesso pelo Painel Web
   */
  notifyDevicePaired(pairingCode: string, payload: { deviceId: string; deviceToken: string; organizationId?: string }) {
    const cleanCode = (pairingCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const room = `pairing:${cleanCode}`;
    this.logger.log(`Emitindo evento 'device:paired' na sala ${room}`);
    this.server.to(room).emit('device:paired', payload);
  }

  /**
   * Notifica um dispositivo específico para atualizar sua playlist/agendamento
   */
  notifyPlaylistUpdated(deviceId: string, playlistId?: string) {
    const room = `device:${deviceId}`;
    this.logger.log(`Notificando atualização de playlist [${playlistId || 'all'}] para ${room}`);
    this.server.to(room).emit('player:sync', {
      playlistId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Solicita captura de tela imediata da Smart TV
   */
  requestDeviceScreenshot(deviceId: string) {
    const room = `device:${deviceId}`;
    this.logger.log(`Enviando solicitação de screenshot para a sala ${room}`);
    this.server.to(room).emit('player:capture_screenshot', {
      deviceId,
      requestedAt: new Date().toISOString(),
    });
  }

  /**
   * Retorna o screenshot mais recente em memória
   */
  getLatestScreenshot(deviceId: string) {
    return this.latestScreenshots.get(deviceId) || null;
  }

  /**
   * Envia comando de ação remota (reboot, reload, volume, mensagem)
   */
  sendRemoteCommand(deviceId: string, command: string, payload?: any) {
    const room = `device:${deviceId}`;
    this.server.to(room).emit('player:command', { command, payload, timestamp: new Date().toISOString() });
  }
}
