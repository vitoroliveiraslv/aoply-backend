import { Controller, Post, Get, Delete, Body, Param, Ip, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { RequestPairingDto, ClaimPairingDto, TelemetryPingDto, TelemetryBatchDto } from './dto/devices.dto';

@Controller('api/v1/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  /**
   * Endpoint chamado pela Smart TV ao iniciar sem credenciais persistidas.
   * Retorna o código de 6 dígitos para exibição em tela cheia.
   */
  @Post('request-pairing')
  requestPairing(@Body() dto: RequestPairingDto, @Ip() ip: string) {
    return this.devicesService.requestPairing(dto, ip);
  }

  /**
   * Endpoint chamado pelo Dashboard Web para vincular a tela via código de 6 dígitos.
   */
  @Post('claim-pairing')
  claimPairing(@Body() dto: ClaimPairingDto) {
    return this.devicesService.claimPairing(dto);
  }

  /**
   * Lista todos os dispositivos registrados da organização
   */
  @Get()
  findAll(@Query('organizationId') organizationId?: string) {
    return this.devicesService.findAll(organizationId);
  }

  /**
   * Retorna os detalhes de um dispositivo
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  /**
   * Endpoint consumido pela Smart TV para obter a grade horária,
   * URLs dos vídeos locais a baixar e lista de IDs do YouTube.
   */
  @Get(':id/manifest')
  getManifest(@Param('id') id: string) {
    return this.devicesService.getDeviceManifest(id);
  }

  /**
   * Heartbeat periódico da Smart TV (a cada 15 a 30s)
   */
  @Post('ping')
  recordPing(@Body() dto: TelemetryPingDto) {
    return this.devicesService.recordPing(dto);
  }

  /**
   * Envio em lote dos registros de exibição de mídias (Proof of Play)
   */
  @Post('telemetry')
  recordTelemetry(@Body() dto: TelemetryBatchDto) {
    return this.devicesService.recordPlaybackBatch(dto);
  }

  /**
   * Envia comando remoto para a tela (ex: player:reload, player:message)
   */
  @Post(':id/command')
  sendCommand(
    @Param('id') id: string,
    @Body() body: { command: string; payload?: any },
  ) {
    return this.devicesService.sendRemoteCommand(id, body.command, body.payload);
  }

  /**
   * Solicita snapshot em tempo real do que a TV está transmitindo
   */
  @Post(':id/screenshot/request')
  requestScreenshot(@Param('id') id: string) {
    return this.devicesService.requestScreenshot(id);
  }

  /**
   * Retorna o snapshot capturado mais recente da TV
   */
  /**
   * Retorna o snapshot capturado mais recente da TV
   */
  @Get(':id/screenshot')
  getScreenshot(@Param('id') id: string) {
    return {
      deviceId: id,
      screenshot: this.devicesService.getLatestScreenshot(id),
    };
  }

  /**
   * Exclui todas as TVs desconectadas / pendentes / offline
   */
  @Delete('cleanup/disconnected')
  deleteDisconnected() {
    return this.devicesService.deleteDisconnected();
  }

  /**
   * Exclui uma TV específica
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.devicesService.delete(id);
  }
}
