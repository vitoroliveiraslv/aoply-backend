import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DevicesGateway } from './devices.gateway';
import { RequestPairingDto, ClaimPairingDto, TelemetryPingDto, TelemetryBatchDto } from './dto/devices.dto';
import * as crypto from 'crypto';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: DevicesGateway,
  ) {}

  /**
   * Gera um código legível de 6 dígitos para a tela (ex: 739418)
   */
  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * TV inicializa pela primeira vez e solicita um código de pareamento
   */
  async requestPairing(dto: RequestPairingDto, ip?: string) {
    // Limpa pareamentos expirados ou solicitações pendentes antigas para evitar registros órfãos
    try {
      await this.prisma.device.deleteMany({
        where: {
          status: 'PENDING_PAIRING',
          OR: [
            { pairingCodeExpiresAt: { lt: new Date() } },
            ...(ip ? [{ ipAddress: ip }] : []),
          ],
        },
      });
    } catch (e: any) {
      this.logger.warn(`Falha na limpeza de pareamentos pendentes antigos: ${e?.message}`);
    }

    const pairingCode = this.generateSixDigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Válido por 10 minutos

    const device = await this.prisma.device.create({
      data: {
        pairingCode,
        pairingCodeExpiresAt: expiresAt,
        status: 'PENDING_PAIRING',
        ipAddress: ip,
        macAddress: dto.macAddress,
        osName: dto.osName || 'Android TV',
        osVersion: dto.osVersion,
        appVersion: dto.appVersion,
        resolution: dto.resolution || '1920x1080',
      },
    });

    const formattedCode = `${pairingCode.slice(0, 3)}-${pairingCode.slice(3)}`;

    this.logger.log(`Novo código de pareamento gerado: ${formattedCode} para o dispositivo ${device.id}`);

    return {
      deviceId: device.id,
      pairingCode,
      formattedCode,
      expiresAt,
      expiresInSeconds: 600,
    };
  }

  /**
   * Administrador digita o código de 6 dígitos no painel Web para vincular a tela à sua conta
   */
  async claimPairing(dto: ClaimPairingDto) {
    const cleanCode = dto.pairingCode.replace(/[^0-9]/g, '');

    const device = await this.prisma.device.findFirst({
      where: {
        pairingCode: cleanCode,
        pairingCodeExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!device) {
      throw new BadRequestException('Código de pareamento inválido ou expirado. Verifique a tela da TV.');
    }

    // Se nenhuma organizationId foi fornecida, busca ou cria uma organização padrão
    let orgId = dto.organizationId;
    if (!orgId) {
      let defaultOrg = await this.prisma.organization.findFirst();
      if (!defaultOrg) {
        defaultOrg = await this.prisma.organization.create({
          data: {
            name: 'Organização Principal',
            slug: 'org-principal',
          },
        });
      }
      orgId = defaultOrg.id;
    }

    // Gera token permanente de autenticação para a TV
    const deviceToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(deviceToken).digest('hex');

    // Valida se assignedScheduleId e fallbackPlaylistId realmente existem
    let validScheduleId: string | null = null;
    if (dto.assignedScheduleId && dto.assignedScheduleId.trim().length > 0) {
      const sched = await this.prisma.schedule.findUnique({ where: { id: dto.assignedScheduleId } });
      if (sched) validScheduleId = sched.id;
    }

    let validPlaylistId: string | null = null;
    if (dto.fallbackPlaylistId && dto.fallbackPlaylistId.trim().length > 0) {
      const pl = await this.prisma.playlist.findUnique({ where: { id: dto.fallbackPlaylistId } });
      if (pl) validPlaylistId = pl.id;
    }

    const updatedDevice = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        name: dto.name,
        location: dto.location,
        organizationId: orgId,
        assignedScheduleId: validScheduleId,
        fallbackPlaylistId: validPlaylistId,
        deviceTokenHash: tokenHash,
        pairingCode: null, // Invalida o código temporário
        pairingCodeExpiresAt: null,
        status: 'ONLINE',
        lastPingAt: new Date(),
      },
    });

    // Notifica instantaneamente a TV via WebSocket para sair da tela de pareamento e começar a tocar
    this.gateway.notifyDevicePaired(cleanCode, {
      deviceId: updatedDevice.id,
      deviceToken,
      organizationId: orgId,
    });

    this.logger.log(`Dispositivo [${updatedDevice.id} - ${dto.name}] pareado com sucesso!`);

    return {
      success: true,
      device: updatedDevice,
    };
  }

  /**
   * Lista dispositivos cadastrados com verificação de status offline
   */
  async findAll(organizationId?: string) {
    const devices = await this.prisma.device.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        deviceTokenHash: { not: null },
        status: { not: 'PENDING_PAIRING' },
      },
      include: {
        assignedSchedule: true,
        fallbackPlaylist: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    return devices.map((d) => {
      // Se a tela possui conexão WebSocket ativa ou enviou ping recente (últimos 120s), está ONLINE
      const isWsConnected = this.gateway.isDeviceConnected(d.id);
      const isPingRecent = d.lastPingAt && (now - new Date(d.lastPingAt).getTime()) < 120000;
      const isOnline = isWsConnected || isPingRecent;
      const effectiveStatus = isOnline ? 'ONLINE' : 'OFFLINE';
      return {
        ...d,
        status: effectiveStatus,
      };
    });
  }

  /**
   * Exclui um dispositivo específico por ID
   */
  async delete(id: string) {
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) throw new NotFoundException('Dispositivo não encontrado');
    try {
      this.gateway.sendRemoteCommand(id, 'player:unpair');
    } catch (e: any) {
      this.logger.warn(`Não foi possível enviar comando unpair para ${id}: ${e?.message}`);
    }
    await this.prisma.device.delete({ where: { id } });
    this.logger.log(`Dispositivo [${id} - ${device.name || 'Sem nome'}] excluído com sucesso.`);
    return { success: true, message: `Dispositivo excluído com sucesso.` };
  }

  /**
   * Exclui todos os dispositivos desconectados / pendentes / offline
   */
  async deleteDisconnected() {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const result = await this.prisma.device.deleteMany({
      where: {
        OR: [
          { status: 'OFFLINE' },
          { status: 'PENDING_PAIRING' },
          { lastPingAt: null },
          { lastPingAt: { lt: twoMinutesAgo } },
        ],
      },
    });
    this.logger.log(`${result.count} dispositivo(s) desconectado(s) excluído(s).`);
    return { success: true, count: result.count };
  }

  /**
   * Busca dispositivo por ID
   */
  async findOne(id: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: {
        assignedSchedule: {
          include: {
            rules: {
              include: { playlist: { include: { items: { include: { asset: true } } } } },
            },
          },
        },
        fallbackPlaylist: {
          include: { items: { include: { asset: true } } },
        },
      },
    });

    if (!device) throw new NotFoundException('Dispositivo não encontrado');
    return device;
  }

  /**
   * TV faz download do seu manifesto operacional (quais vídeos baixar, regras e lista de execução)
   */
  async getDeviceManifest(deviceId: string) {
    const device = await this.findOne(deviceId);

    // Identifica o dia da semana atual (0 = Domingo ... 6 = Sábado)
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const currentTimeStr = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

    let activePlaylist: any = null;

    // 1. Tenta resolver pela grade horária (Schedule)
    if (device.assignedSchedule && device.assignedSchedule.rules?.length > 0) {
      const activeRule = device.assignedSchedule.rules.find((rule) => {
        return (
          rule.isActive &&
          rule.dayOfWeek === currentDayOfWeek &&
          currentTimeStr >= rule.startTime &&
          currentTimeStr <= rule.endTime
        );
      });

      if (activeRule && activeRule.playlist) {
        activePlaylist = activeRule.playlist;
      }
    }

    // 2. Se não houver regra ativa pela grade, verifica fallback ou busca playlist ativa para o dia de hoje
    if (!activePlaylist) {
      if (device.fallbackPlaylist) {
        let parsedRules = null;
        try {
          parsedRules = device.fallbackPlaylist.interleaveRules ? JSON.parse(device.fallbackPlaylist.interleaveRules) : null;
        } catch {}
        if (!parsedRules?.activeDays || parsedRules.activeDays.includes(currentDayOfWeek)) {
          activePlaylist = device.fallbackPlaylist;
        }
      }

      // Se ainda não encontrou, busca entre as playlists da organização qual está ativa hoje
      if (!activePlaylist && device.organizationId) {
        const orgPlaylists = await this.prisma.playlist.findMany({
          where: { organizationId: device.organizationId, isActive: true },
          include: {
            items: {
              include: { asset: true },
              orderBy: { position: 'asc' },
            },
          },
        });

        for (const pl of orgPlaylists) {
          try {
            const r = pl.interleaveRules ? JSON.parse(pl.interleaveRules) : null;
            if (r?.activeDays && r.activeDays.includes(currentDayOfWeek)) {
              activePlaylist = pl;
              break;
            }
          } catch {}
        }

        if (!activePlaylist && orgPlaylists.length > 0) {
          activePlaylist = orgPlaylists[0];
        }
      }
    }

    // Formata o manifesto com a lista de itens e regras de intercalação
    const items = (activePlaylist?.items || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((item: any) => ({
        id: item.id,
        position: item.position,
        category: item.category,
        customDurationSeconds: item.customDurationSeconds || item.asset.durationSeconds,
        isMuted: item.isMuted,
        asset: {
          id: item.asset.id,
          name: item.asset.name,
          type: item.asset.type, // 'VIDEO' ou 'YOUTUBE'
          cdnUrl: item.asset.cdnUrl,
          checksumSha256: item.asset.checksumSha256,
          fileSizeBytes: item.asset.fileSizeBytes ? item.asset.fileSizeBytes.toString() : null,
          externalId: item.asset.externalId, // ID do YouTube
          durationSeconds: item.asset.durationSeconds,
        },
      }));

    let parsedInterleaveRules = null;
    if (activePlaylist?.interleaveRules) {
      try {
        parsedInterleaveRules = JSON.parse(activePlaylist.interleaveRules);
      } catch (e) {
        parsedInterleaveRules = null;
      }
    }

    return {
      deviceId: device.id,
      deviceName: device.name,
      timestamp: now.toISOString(),
      playlist: activePlaylist
        ? {
            id: activePlaylist.id,
            name: activePlaylist.name,
            version: activePlaylist.version,
            interleaveRules: parsedInterleaveRules || {
              type: 'INTERVAL_BY_COUNT',
              youtubeFrequency: 3, // A cada 3 vídeos do YouTube, 1 anúncio
            },
            items,
          }
        : null,
    };
  }

  /**
   * TV envia heartbeat de status (ping)
   */
  async recordPing(dto: TelemetryPingDto) {
    return this.prisma.device.update({
      where: { id: dto.deviceId },
      data: {
        lastPingAt: new Date(),
        status: dto.status || 'ONLINE',
        storageFreeMb: dto.storageFreeMb,
        currentAssetId: dto.currentAssetId,
      },
    });
  }

  /**
   * TV envia relatório em lote de reprodução (Proof-of-Play)
   */
  async recordPlaybackBatch(dto: TelemetryBatchDto) {
    if (!dto.entries || dto.entries.length === 0) return { count: 0 };

    const records = dto.entries.map((entry) => ({
      deviceId: dto.deviceId,
      assetId: entry.assetId,
      playlistId: entry.playlistId,
      startedAt: new Date(entry.startedAt),
      endedAt: new Date(entry.endedAt),
      durationPlayedSeconds: entry.durationPlayedSeconds,
      completedWithoutInterruption: entry.completedWithoutInterruption ?? true,
      errorMessage: entry.errorMessage,
    }));

    await this.prisma.playbackLog.createMany({
      data: records,
    });

    return { count: records.length };
  }

  /**
   * Solicita captura de tela imediata da TV
   */
  async requestScreenshot(id: string) {
    const device = await this.findOne(id);
    this.gateway.requestDeviceScreenshot(device.id);
    return { success: true, message: 'Solicitação de captura enviada para a TV' };
  }

  /**
   * Obtém o screenshot mais recente enviado pela TV
   */
  getLatestScreenshot(id: string) {
    return this.gateway.getLatestScreenshot(id);
  }

  /**
   * Envia comando remoto para a tela
   */
  async sendRemoteCommand(id: string, command: string, payload?: any) {
    const device = await this.findOne(id);
    this.gateway.sendRemoteCommand(device.id, command, payload);
    return { success: true, message: `Comando ${command} enviado para a tela ${device.name}` };
  }
}
