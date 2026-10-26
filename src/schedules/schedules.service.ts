import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto, UpdateScheduleRulesDto } from './dto/schedules.dto';
import { DevicesGateway } from '../devices/devices.gateway';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: DevicesGateway,
  ) {}

  private async notifyAssignedDevices(scheduleId: string) {
    const devices = await this.prisma.device.findMany({
      where: { assignedScheduleId: scheduleId },
      select: { id: true },
    });

    for (const device of devices) {
      this.gateway.notifyPlaylistUpdated(device.id);
    }
  }

  /**
   * Cria um novo agendador semanal
   */
  async create(dto: CreateScheduleDto) {
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

    return this.prisma.schedule.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        timezone: dto.timezone || 'America/Sao_Paulo',
        rules: dto.rules && dto.rules.length > 0
          ? {
              create: dto.rules.map((rule) => ({
                playlistId: rule.playlistId,
                dayOfWeek: rule.dayOfWeek,
                startTime: rule.startTime.length === 5 ? `${rule.startTime}:00` : rule.startTime,
                endTime: rule.endTime.length === 5 ? `${rule.endTime}:00` : rule.endTime,
                priority: rule.priority || 1,
              })),
            }
          : undefined,
      },
      include: {
        rules: {
          include: { playlist: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });
  }

  /**
   * Lista todos os agendadores
   */
  async findAll(organizationId?: string) {
    return this.prisma.schedule.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        rules: {
          include: { playlist: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        _count: {
          select: { devices: true, rules: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Busca um agendador por ID
   */
  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        rules: {
          include: { playlist: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        devices: true,
      },
    });

    if (!schedule) throw new NotFoundException('Agendador não encontrado');
    return schedule;
  }

  /**
   * Atualiza as regras semanais da grade horária
   */
  async updateRules(scheduleId: string, dto: UpdateScheduleRulesDto) {
    await this.findOne(scheduleId);

    // Substitui as regras existentes atomicamente
    await this.prisma.$transaction([
      this.prisma.scheduleRule.deleteMany({
        where: { scheduleId },
      }),
      this.prisma.scheduleRule.createMany({
        data: dto.rules.map((rule) => ({
          scheduleId,
          playlistId: rule.playlistId,
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime.length === 5 ? `${rule.startTime}:00` : rule.startTime,
          endTime: rule.endTime.length === 5 ? `${rule.endTime}:00` : rule.endTime,
          priority: rule.priority || 1,
        })),
      }),
    ]);

    await this.notifyAssignedDevices(scheduleId);
    return this.findOne(scheduleId);
  }

  /**
   * Atribui um agendador a um dispositivo
   */
  async assignToDevice(scheduleId: string, deviceId: string) {
    await this.findOne(scheduleId);

    const device = await this.prisma.device.update({
      where: { id: deviceId },
      data: { assignedScheduleId: scheduleId },
    });

    this.gateway.notifyPlaylistUpdated(deviceId);
    return device;
  }
}
