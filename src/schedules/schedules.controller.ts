import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleRulesDto } from './dto/schedules.dto';

@Controller('api/v1/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Get()
  findAll(@Query('organizationId') organizationId?: string) {
    return this.schedulesService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Put(':id/rules')
  updateRules(@Param('id') id: string, @Body() dto: UpdateScheduleRulesDto) {
    return this.schedulesService.updateRules(id, dto);
  }

  @Post(':id/assign/:deviceId')
  assignToDevice(
    @Param('id') id: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.schedulesService.assignToDevice(id, deviceId);
  }
}
