import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  Headers,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { MediaService } from './media.service';
import { CreateYouTubeAssetDto, CreateLocalVideoAssetDto } from './dto/media.dto';

const uploadsDir = path.resolve(process.cwd(), 'uploads/videos');

@Controller('api/v1/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('youtube')
  createYouTube(@Body() dto: CreateYouTubeAssetDto) {
    return this.mediaService.createYouTubeAsset(dto);
  }

  /**
   * Pesquisa músicas e vídeos no YouTube em tempo real
   */
  @Get('search-youtube')
  searchYouTube(@Query('q') query: string) {
    return this.mediaService.searchYouTube(query);
  }

  @Post('local-video')
  createLocalVideo(@Body() dto: CreateLocalVideoAssetDto) {
    return this.mediaService.createLocalVideoAsset(dto);
  }

  /**
   * Upload direto de arquivo de vídeo (MP4/WebM) com drag-and-drop
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
          cb(null, `signage-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 200 * 1024 * 1024, // Limite de 200MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(mp4|webm|quicktime|x-matroska)$/)) {
          return cb(new BadRequestException('Apenas arquivos de vídeo (MP4, WebM, MOV) são permitidos!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
    @Body('durationSeconds') durationSeconds?: string,
    @Body('organizationId') organizationId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo de vídeo foi enviado.');
    }
    const duration = durationSeconds ? parseInt(durationSeconds, 10) : 30;
    return this.mediaService.handleUploadedFile(file, name, duration, organizationId);
  }

  /**
   * Streaming de vídeo com suporte a HTTP 206 Partial Content (Range Requests)
   * Essencial para Seek e reprodução ultra-suave no player da Smart TV
   */
  @Get('stream/:filename')
  streamVideo(
    @Param('filename') filename: string,
    @Headers('range') range: string,
    @Res() res: Response,
  ) {
    const videoPath = path.join(uploadsDir, filename);

    if (!fs.existsSync(videoPath)) {
      throw new NotFoundException('Arquivo de vídeo não encontrado.');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  }

  @Get()
  findAll(
    @Query('organizationId') organizationId?: string,
    @Query('type') type?: string,
  ) {
    return this.mediaService.findAll(organizationId, type);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}
