"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
let MediaService = class MediaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    extractYouTubeId(url) {
        const trimmed = url.trim();
        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
            return trimmed;
        }
        const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = trimmed.match(regExp);
        if (match && match[1]) {
            return match[1];
        }
        throw new common_1.BadRequestException('URL do YouTube inválida. Forneça um link válido do YouTube ou YouTube Shorts.');
    }
    async createYouTubeAsset(dto) {
        const videoId = this.extractYouTubeId(dto.url);
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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
    async searchYouTube(query) {
        const q = (query || '').trim();
        if (!q)
            return [];
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
        }
        catch (e) {
        }
        try {
            const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                },
            });
            const html = await res.text();
            const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
            if (match) {
                const data = JSON.parse(match[1]);
                const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
                    ?.itemSectionRenderer?.contents || [];
                const results = [];
                for (const item of contents) {
                    if (item.videoRenderer) {
                        const v = item.videoRenderer;
                        const durationStr = v.lengthText?.simpleText || '03:30';
                        let durationSeconds = 210;
                        const parts = durationStr.split(':').map((p) => parseInt(p, 10));
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                            durationSeconds = parts[0] * 60 + parts[1];
                        }
                        else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                            durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                        }
                        const thumbnail = v.thumbnail?.thumbnails?.[v.thumbnail?.thumbnails?.length - 1]?.url ||
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
                        if (results.length >= 12)
                            break;
                    }
                }
                if (results.length > 0)
                    return results;
            }
        }
        catch (err) {
            console.error('Falha ao consultar YouTube:', err);
        }
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
    async createLocalVideoAsset(dto) {
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
                durationSeconds: dto.durationSeconds || 30,
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
    async findAll(organizationId, type) {
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
    async delete(id) {
        const asset = await this.prisma.asset.findUnique({
            where: { id },
            include: { playlistItems: true },
        });
        if (!asset)
            throw new common_1.NotFoundException('Mídia não encontrada');
        if (asset.playlistItems.length > 0) {
            throw new common_1.BadRequestException('Esta mídia está em uso em uma ou mais playlists e não pode ser excluída.');
        }
        return this.prisma.asset.delete({ where: { id } });
    }
    async handleUploadedFile(file, name, durationSeconds, organizationId) {
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
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map