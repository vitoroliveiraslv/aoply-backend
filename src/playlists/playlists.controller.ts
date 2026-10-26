import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto, ReorderPlaylistDto, PlaylistItemInputDto } from './dto/playlists.dto';

@Controller('api/v1/playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  create(@Body() dto: CreatePlaylistDto) {
    return this.playlistsService.create(dto);
  }

  @Get()
  findAll(@Query('organizationId') organizationId?: string) {
    return this.playlistsService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistsService.findOne(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() itemDto: PlaylistItemInputDto) {
    return this.playlistsService.addItem(id, itemDto);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.playlistsService.removeItem(id, itemId);
  }

  @Put(':id/reorder')
  reorder(@Param('id') id: string, @Body() dto: ReorderPlaylistDto) {
    return this.playlistsService.reorderItems(id, dto);
  }

  @Put('reorder/all')
  reorderPlaylists(@Body() dto: { orders: { id: string; order: number }[] }) {
    return this.playlistsService.reorderPlaylists(dto.orders);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: { name?: string; description?: string }) {
    return this.playlistsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.playlistsService.delete(id);
  }

  @Put(':id/rules')
  updateRules(@Param('id') id: string, @Body() rules: any) {
    return this.playlistsService.updateRules(id, rules);
  }
}
