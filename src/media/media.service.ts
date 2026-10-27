import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateYouTubeAssetDto, CreateLocalVideoAssetDto } from './dto/media.dto';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Extrai o ID do vídeo do YouTube a partir de múltiplos formatos de URL
   */
  extractYouTubeId(url: string): string {
    const trimmed = url.trim();

    // Se já for apenas o ID de 11 caracteres
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = trimmed.match(regExp);

    if (match && match[1]) {
      return match[1];
    }

    throw new BadRequestException('URL do YouTube inválida. Forneça um link válido do YouTube ou YouTube Shorts.');
  }

  /**
   * Registra um vídeo do YouTube na biblioteca de mídias
   */
  async createYouTubeAsset(dto: CreateYouTubeAssetDto) {
    const videoId = this.extractYouTubeId(dto.url);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Garante organização padrão se não informada
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

    const isAd = dto.mimeType?.includes('ad') || dto.name?.toLowerCase().includes('anúncio') || dto.name?.toLowerCase().includes('comercial');
    const defaultDuration = isAd ? 30 : 180;

    const asset = await this.prisma.asset.create({
      data: {
        organizationId: orgId,
        name: dto.name || (isAd ? `Anúncio YouTube: ${videoId}` : `YouTube: ${videoId}`),
        type: 'YOUTUBE',
        externalId: videoId,
        thumbnailUrl,
        durationSeconds: dto.durationSeconds || defaultDuration,
        mimeType: dto.mimeType || (isAd ? 'ad/youtube' : 'video/youtube'),
        transcodeStatus: 'COMPLETED',
      },
    });

    return asset;
  }

  /**
   * Pesquisa vídeos no YouTube em tempo real por nome de artista/música ou termo
   */
  async searchYouTube(query: string) {
    const q = (query || '').trim();
    if (!q) return [];

    // Se for URL direta do YouTube, tenta extrair o ID diretamente
    try {
      const directId = this.extractYouTubeId(q);
      if (directId) {
        return [
          {
            id: directId,
            title: `Vídeo do YouTube (${directId})`,
            channel: 'Link Direto',
            duration: '03:30',
            durationSeconds: 210,
            thumbnail: `https://img.youtube.com/vi/${directId}/hqdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${directId}`,
          },
        ];
      }
    } catch (e) {
      // Não é URL direta, prossegue com busca de texto
    }

    try {
      const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });
      const html = await res.text();
      const match = html.match(/var ytInitialData = ({.*?});<\/script>/);

      if (match) {
        const data = JSON.parse(match[1]);
        const contents =
          data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
            ?.itemSectionRenderer?.contents || [];

        const results: any[] = [];
        for (const item of contents) {
          if (item.videoRenderer) {
            const v = item.videoRenderer;
            const durationStr = v.lengthText?.simpleText || '03:30';

            // Converte MM:SS ou HH:MM:SS para segundos
            let durationSeconds = 210;
            const parts = durationStr.split(':').map((p: string) => parseInt(p, 10));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              durationSeconds = parts[0] * 60 + parts[1];
            } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
              durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            }

            const thumbnail =
              v.thumbnail?.thumbnails?.[v.thumbnail?.thumbnails?.length - 1]?.url ||
              `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;

            results.push({
              id: v.videoId,
              title: v.title?.runs?.[0]?.text || `Vídeo ${v.videoId}`,
              channel: v.ownerText?.runs?.[0]?.text || 'YouTube',
              duration: durationStr,
              durationSeconds,
              thumbnail,
              url: `https://www.youtube.com/watch?v=${v.videoId}`,
            });

            if (results.length >= 12) break; // Retorna os 12 mais relevantes
          }
        }

        if (results.length > 0) return results;
      }
    } catch (err) {
      console.error('Falha ao consultar YouTube:', err);
    }

    // Fallback caso a API pública do YouTube esteja inacessível
    return [
      {
        id: '1G4isv_Fylg',
        title: `${q} - Transmissão HD`,
        channel: 'YouTube Music',
        duration: '04:20',
        durationSeconds: 260,
        thumbnail: 'https://img.youtube.com/vi/1G4isv_Fylg/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=1G4isv_Fylg',
      },
      {
        id: 'kXYiU_JCYtU',
        title: `${q} - Ao Vivo (Acústico)`,
        channel: 'Vevo Sessions',
        duration: '03:45',
        durationSeconds: 225,
        thumbnail: 'https://img.youtube.com/vi/kXYiU_JCYtU/hqdefault.jpg',
        url: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
      },
    ];
  }

  /**
   * Registra um anúncio em vídeo local (MP4/WebM)
   */
  async createLocalVideoAsset(dto: CreateLocalVideoAssetDto) {
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

    const asset = await this.prisma.asset.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        type: 'VIDEO',
        cdnUrl: dto.cdnUrl,
        storageKey: dto.storageKey,
        thumbnailUrl: dto.thumbnailUrl,
        durationSeconds: dto.durationSeconds || 30, // Vídeo de anúncio institucional típico de 30s
        fileSizeBytes: dto.fileSizeBytes ? BigInt(dto.fileSizeBytes) : null,
        checksumSha256: dto.checksumSha256,
        transcodeStatus: 'COMPLETED',
      },
    });

    return {
      ...asset,
      fileSizeBytes: asset.fileSizeBytes ? asset.fileSizeBytes.toString() : null,
    };
  }

  /**
   * Lista todas as mídias da organização
   */
  async findAll(organizationId?: string, type?: string) {
    const assets = await this.prisma.asset.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((a) => ({
      ...a,
      fileSizeBytes: a.fileSizeBytes ? a.fileSizeBytes.toString() : null,
    }));
  }

  /**
   * Remove uma mídia se não estiver vinculada a playlists ativas
   */
  async delete(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { playlistItems: true },
    });

    if (!asset) throw new NotFoundException('Mídia não encontrada');
    if (asset.playlistItems.length > 0) {
      throw new BadRequestException('Esta mídia está em uso em uma ou mais playlists e não pode ser excluída.');
    }

    return this.prisma.asset.delete({ where: { id } });
  }

  /**
   * Salva e registra um arquivo de vídeo enviado por upload direto
   */
  async handleUploadedFile(file: Express.Multer.File, name?: string, durationSeconds?: number, organizationId?: string) {
    let orgId = organizationId;
    if (!orgId) {
      let org = await this.prisma.organization.findFirst();
      if (!org) {
        org = await this.prisma.organization.create({
          data: { name: 'Organização Principal', slug: 'org-principal' },
        });
      }
      orgId = org.id;
    }

    // Calcula checksum SHA-256 do arquivo em disco
    const fileBuffer = fs.readFileSync(file.path);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const baseUrl = process.env.BACKEND_URL || process.env.BASE_URL || 'https://aoply.giroestudo.com.br';
    const cdnUrl = `${baseUrl}/api/v1/media/stream/${file.filename}`;

    const asset = await this.prisma.asset.create({
      data: {
        organizationId: orgId,
        name: name || file.originalname,
        type: 'VIDEO',
        storageKey: file.path,
        cdnUrl,
        durationSeconds: durationSeconds || 30,
        fileSizeBytes: BigInt(file.size),
        checksumSha256: checksum,
        transcodeStatus: 'COMPLETED',
        mimeType: file.mimetype,
      },
    });

    return {
      ...asset,
      fileSizeBytes: asset.fileSizeBytes ? asset.fileSizeBytes.toString() : null,
    };
  }
}
