import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DevicesModule } from './devices/devices.module';
import { MediaModule } from './media/media.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AuthModule } from './auth/auth.module';

import { AppController } from './app.controller';
import { PlayerController } from './player/player.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DevicesModule,
    MediaModule,
    PlaylistsModule,
    SchedulesModule,
  ],
  controllers: [AppController, PlayerController],
})
export class AppModule {}
