"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma/prisma.service");
const legal_pages_1 = require("./legal/legal-pages");
let AppController = class AppController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getPrivacyPolicy(res) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send((0, legal_pages_1.renderPrivacyPolicyHtml)());
    }
    getTermsOfService(res) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send((0, legal_pages_1.renderTermsOfServiceHtml)());
    }
    async getRoot(req, res) {
        const isHtmlRequested = req.headers.accept && req.headers.accept.includes('text/html');
        const host = req.get('host') || '';
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
        const baseUrl = isLocal ? `http://${host}` : 'https://aoply.giroestudo.com.br';
        const webUrl = isLocal ? 'http://localhost:3000' : 'https://aoply.giroestudo.com.br';
        if (isHtmlRequested) {
            return res.redirect(webUrl);
        }
        const [devicesCount, assetsCount, playlistsCount, schedulesCount] = await Promise.all([
            this.prisma.device.count(),
            this.prisma.asset.count(),
            this.prisma.playlist.count(),
            this.prisma.schedule.count(),
        ]);
        return res.json({
            name: 'Aoply Digital Signage API Core',
            version: '1.0.0',
            status: 'ONLINE',
            officialSite: 'https://aoply.giroestudo.com.br',
            adminPanelUrl: webUrl,
            tvPlayerUrl: `${baseUrl}/tv`,
            privacyPolicyUrl: 'https://aoply.giroestudo.com.br/privacy',
            termsOfServiceUrl: 'https://aoply.giroestudo.com.br/terms',
            stats: {
                devices: devicesCount,
                assets: assetsCount,
                playlists: playlistsCount,
                schedules: schedulesCount,
            },
            endpoints: {
                devices: '/api/v1/devices',
                media: '/api/v1/media',
                playlists: '/api/v1/playlists',
                schedules: '/api/v1/schedules',
                websocket: 'ws://localhost:3001',
            },
        });
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)('privacy'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getPrivacyPolicy", null);
__decorate([
    (0, common_1.Get)('terms'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getTermsOfService", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getRoot", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppController);
//# sourceMappingURL=app.controller.js.map