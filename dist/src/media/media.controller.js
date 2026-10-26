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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const media_service_1 = require("./media.service");
const media_dto_1 = require("./dto/media.dto");
const uploadsDir = path.resolve(process.cwd(), 'uploads/videos');
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    createYouTube(dto) {
        return this.mediaService.createYouTubeAsset(dto);
    }
    searchYouTube(query) {
        return this.mediaService.searchYouTube(query);
    }
    createLocalVideo(dto) {
        return this.mediaService.createLocalVideoAsset(dto);
    }
    uploadVideo(file, name, durationSeconds, organizationId) {
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo de vídeo foi enviado.');
        }
        const duration = durationSeconds ? parseInt(durationSeconds, 10) : 30;
        return this.mediaService.handleUploadedFile(file, name, duration, organizationId);
    }
    streamVideo(filename, range, res) {
        const videoPath = path.join(uploadsDir, filename);
        if (!fs.existsSync(videoPath)) {
            throw new common_1.NotFoundException('Arquivo de vídeo não encontrado.');
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
        }
        else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    }
    findAll(organizationId, type) {
        return this.mediaService.findAll(organizationId, type);
    }
    delete(id) {
        return this.mediaService.delete(id);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('youtube'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.CreateYouTubeAssetDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "createYouTube", null);
__decorate([
    (0, common_1.Get)('search-youtube'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "searchYouTube", null);
__decorate([
    (0, common_1.Post)('local-video'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.CreateLocalVideoAssetDto]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "createLocalVideo", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: uploadsDir,
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
                cb(null, `signage-${uniqueSuffix}${ext}`);
            },
        }),
        limits: {
            fileSize: 200 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(mp4|webm|quicktime|x-matroska)$/)) {
                return cb(new common_1.BadRequestException('Apenas arquivos de vídeo (MP4, WebM, MOV) são permitidos!'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('durationSeconds')),
    __param(3, (0, common_1.Body)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "uploadVideo", null);
__decorate([
    (0, common_1.Get)('stream/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Headers)('range')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "streamVideo", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('organizationId')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MediaController.prototype, "delete", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('api/v1/media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map