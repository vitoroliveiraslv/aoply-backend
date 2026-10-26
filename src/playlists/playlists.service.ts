import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto, ReorderPlaylistDto, PlaylistItemInputDto } from './dto/playlists.dto';
import { DevicesGateway } from '../devices/devices.gateway';

@Injectable()
export class PlaylistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: DevicesGateway,
  ) {}

  /**
   * Notifica todas as telas que usam esta playlist direta ou indiretamente via Schedule
   */
  private async notifyAffectedDevices(playlistId: string) {
    const directDevices = await this.prisma.device.findMany({
      where: { fallbackPlaylistId: playlistId },
      select: { id: true },
    });

    const scheduleRules = await this.prisma.scheduleRule.findMany({
      where: { playlistId },
      select: { scheduleId: true },
    });

    const scheduleIds = scheduleRules.map((r) => r.scheduleId);

    const scheduleDevices = await this.prisma.device.findMany({
      where: { assignedScheduleId: { in: scheduleIds } },
      select: { id: true },
    });

    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { organizationId: true },
    });

    const orgDevices = playlist?.organizationId
      ? await this.prisma.device.findMany({
          where: { organizationId: playlist.organizationId },
          select: { id: true },
        })
      : [];

    const uniqueDeviceIds = new Set([
      ...directDevices.map((d) => d.id),
      ...scheduleDevices.map((d) => d.id),
      ...orgDevices.map((d) => d.id),
    ]);

    for (const deviceId of uniqueDeviceIds) {
      this.gateway.notifyPlaylistUpdated(deviceId, playlistId);
    }
  }

  /**
   * Criação de playlist com itens iniciais e regras de alternância
   */
  async create(dto: CreatePlaylistDto) {
    let orgId = dto.organizationId;
    if (!orgId) {
      let org = await this.prisma.organization.findFirst();
      if (!org) {
        org = await this.prisma.organization.create({
          data: { name: 'Organização Principal', slug: 'org-principal' },
        });
      }
      orgId = org.id;
    }

    const defaultRules = {
      type: 'INTERVAL_BY_COUNT',
      youtubeFrequency: 3,
      activeDays: [1, 2, 3, 4, 5], // Seg a Sex por padrão
      allDay: true,
      startTime: '08:00',
      endTime: '18:00',
    };

    const rulesToUse = dto.interleaveRules || defaultRules;
    const interleaveRulesString = JSON.stringify(rulesToUse);

    const playlist = await this.prisma.playlist.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        description: dto.description,
        interleaveRules: interleaveRulesString,
        version: 1,
        items: dto.items && dto.items.length > 0
          ? {
              create: dto.items.map((item, index) => ({
                assetId: item.assetId,
                position: item.position ?? index,
                category: item.category || 'CONTENT',
                customDurationSeconds: item.customDurationSeconds,
                isMuted: item.isMuted ?? false,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: { asset: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    await this.syncPlaylistSchedule(playlist.id, playlist.organizationId, rulesToUse);
    let parsedRules = null;
    try {
      parsedRules = playlist.interleaveRules ? JSON.parse(playlist.interleaveRules) : null;
    } catch {
      parsedRules = null;
    }
    return {
      ...playlist,
      interleaveRules: parsedRules,
    };
  }

  /**
   * Lista playlists da organização
   */
  async findAll(organizationId?: string) {
    const playlists = await this.prisma.playlist.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        items: {
          include: { asset: true },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
    });

    return playlists.map((p) => {
      let parsedRules = null;
      if (p.interleaveRules) {
        try {
          parsedRules = typeof p.interleaveRules === 'string' ? JSON.parse(p.interleaveRules) : p.interleaveRules;
        } catch {
          parsedRules = null;
        }
      }
      return {
        ...p,
        interleaveRules: parsedRules,
      };
    });
  }

  /**
   * Busca playlist por ID
   */
  async findOne(id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        items: {
          include: { asset: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!playlist) throw new NotFoundException('Playlist não encontrada');

    let parsedRules = null;
    if (playlist.interleaveRules) {
      try {
        parsedRules = JSON.parse(playlist.interleaveRules);
      } catch (e) {
        parsedRules = null;
      }
    }

    return {
      ...playlist,
      interleaveRules: parsedRules,
    };
  }

  /**
   * Adiciona um item na playlist
   */
  async addItem(playlistId: string, itemDto: PlaylistItemInputDto) {
    const playlist = await this.findOne(playlistId);

    // Se a posição não for especificada, adiciona ao final
    const currentMax = playlist.items.length > 0
      ? Math.max(...playlist.items.map((i) => i.position))
      : -1;
    const position = itemDto.position !== undefined ? itemDto.position : currentMax + 1;

    const item = await this.prisma.playlistItem.create({
      data: {
        playlistId,
        assetId: itemDto.assetId,
        position,
        category: itemDto.category || 'CONTENT',
        customDurationSeconds: itemDto.customDurationSeconds,
        isMuted: itemDto.isMuted ?? false,
      },
      include: { asset: true },
    });

    // Incrementa versão da playlist
    await this.prisma.playlist.update({
      where: { id: playlistId },
      data: { version: { increment: 1 } },
    });

    await this.notifyAffectedDevices(playlistId);
    return item;
  }

  /**
   * Remove item da playlist
   */
  async removeItem(playlistId: string, itemId: string) {
    const item = await this.prisma.playlistItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.playlistId !== playlistId) {
      throw new NotFoundException('Item não encontrado nesta playlist');
    }

    await this.prisma.playlistItem.delete({ where: { id: itemId } });

    await this.prisma.playlist.update({
      where: { id: playlistId },
      data: { version: { increment: 1 } },
    });

    await this.notifyAffectedDevices(playlistId);
    return { success: true };
  }

  /**
   * Reordenação drag-and-drop de itens
   */
  async reorderItems(playlistId: string, dto: ReorderPlaylistDto) {
    await this.prisma.$transaction(
      dto.orders.map((order) =>
        this.prisma.playlistItem.update({
          where: { id: order.itemId },
          data: { position: order.newPosition },
        }),
      ),
    );

    await this.prisma.playlist.update({
      where: { id: playlistId },
      data: { version: { increment: 1 } },
    });

    await this.notifyAffectedDevices(playlistId);
    return this.findOne(playlistId);
  }

  /**
   * Atualiza dados da playlist (ex: renomear)
   */
  async update(id: string, dto: { name?: string; description?: string }) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) {
      throw new NotFoundException('Playlist não encontrada');
    }

    const updated = await this.prisma.playlist.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        version: { increment: 1 },
      },
      include: {
        items: {
          include: { asset: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    await this.notifyAffectedDevices(id);
    return updated;
  }

  /**
   * Exclui uma playlist e desvincula de telas e schedules
   */
  async delete(id: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) {
      throw new NotFoundException('Playlist não encontrada');
    }

    // 1. Desvincula de telas onde era fallback
    await this.prisma.device.updateMany({
      where: { fallbackPlaylistId: id },
      data: { fallbackPlaylistId: null },
    });

    // 2. Remove regras de schedule associadas
    await this.prisma.scheduleRule.deleteMany({
      where: { playlistId: id },
    });

    // 3. Remove os itens da playlist
    await this.prisma.playlistItem.deleteMany({
      where: { playlistId: id },
    });

    // 4. Exclui a playlist
    await this.prisma.playlist.delete({
      where: { id },
    });

    await this.notifyAffectedDevices(id);
    return { success: true };
  }

  /**
   * Sincroniza automaticamente a grade horária (Schedule) da organização quando a playlist define dias da semana
   */
  private async syncPlaylistSchedule(playlistId: string, orgId: string, rules: any) {
    if (!rules || !Array.isArray(rules.activeDays)) return;

    try {
      // 1. Localiza ou cria a grade horária padrão da organização
      let schedule = await this.prisma.schedule.findFirst({
        where: { organizationId: orgId },
      });

      if (!schedule) {
        schedule = await this.prisma.schedule.create({
          data: {
            organizationId: orgId,
            name: 'Grade Semanal Automática',
            timezone: 'America/Sao_Paulo',
          },
        });
      }

      // 2. Garante que todos os dispositivos da organização usem essa grade
      await this.prisma.device.updateMany({
        where: { organizationId: orgId, assignedScheduleId: null },
        data: { assignedScheduleId: schedule.id },
      });

      // 3. Remove regras antigas desta playlist nesta grade
      await this.prisma.scheduleRule.deleteMany({
        where: { scheduleId: schedule.id, playlistId },
      });

      // 4. Cria regras ativas para cada dia selecionado
      const isAllDay = rules.allDay !== false;
      const startTime = isAllDay ? '00:00:00' : (rules.startTime ? (rules.startTime.length === 5 ? `${rules.startTime}:00` : rules.startTime) : '08:00:00');
      const endTime = isAllDay ? '23:59:59' : (rules.endTime ? (rules.endTime.length === 5 ? `${rules.endTime}:00` : rules.endTime) : '18:00:00');

      if (rules.activeDays.length > 0) {
        for (const day of rules.activeDays) {
          await this.prisma.scheduleRule.create({
            data: {
              scheduleId: schedule.id,
              playlistId,
              dayOfWeek: day,
              startTime,
              endTime,
              priority: 1,
              isActive: true,
            },
          });
        }
      }
    } catch (err) {
      console.error('Erro ao sincronizar grade semanal automática:', err);
    }
  }

  /**
   * Atualiza as regras de alternância e agendamento da playlist
   */
  async updateRules(playlistId: string, rawRules: any) {
    const existing = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!existing) throw new NotFoundException('Playlist não encontrada');

    let parsed = rawRules;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { parsed = {}; }
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      parsed = {};
    }

    const cleanRules = {
      type: parsed.type || 'INTERVAL_BY_COUNT',
      youtubeFrequency: typeof parsed.youtubeFrequency === 'number' ? parsed.youtubeFrequency : 3,
      activeDays: Array.isArray(parsed.activeDays)
        ? parsed.activeDays.map(Number).filter((n: number) => !isNaN(n) && n >= 0 && n <= 6)
        : [1, 2, 3, 4, 5],
      allDay: parsed.allDay !== false,
      startTime: parsed.startTime || undefined,
      endTime: parsed.endTime || undefined,
      description: parsed.description || undefined,
    };

    const playlist = await this.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        interleaveRules: JSON.stringify(cleanRules),
        version: { increment: 1 },
      },
      include: {
        items: {
          include: { asset: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    // Sincroniza grade semanal automaticamente
    await this.syncPlaylistSchedule(playlist.id, playlist.organizationId, cleanRules);

    await this.notifyAffectedDevices(playlistId);

    return {
      ...playlist,
      interleaveRules: cleanRules,
    };
  }

  /**
   * Reordenação da ordem de exibição das playlists
   */
  async reorderPlaylists(orders: { id: string; order: number }[]) {
    if (!orders || !Array.isArray(orders)) return { success: true };
    await Promise.all(
      orders.map(async (item) => {
        try {
          await this.prisma.playlist.update({
            where: { id: item.id },
            data: { order: item.order },
          });
        } catch {
          // Ignora se registro foi deletado concorrentemente
        }
      }),
    );
    return { success: true };
  }
}
