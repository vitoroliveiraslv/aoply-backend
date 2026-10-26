import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from './prisma/prisma.service';
import { renderPrivacyPolicyHtml, renderTermsOfServiceHtml } from './legal/legal-pages';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('privacy')
  getPrivacyPolicy(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderPrivacyPolicyHtml());
  }

  @Get('terms')
  getTermsOfService(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderTermsOfServiceHtml());
  }

  @Get()
  async getRoot(@Req() req: Request, @Res() res: Response) {
    const isHtmlRequested = req.headers.accept && req.headers.accept.includes('text/html');
    const host = req.get('host') || '';
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const baseUrl = isLocal ? `http://${host}` : 'https://aoply.giroestudo.com.br';
    const webUrl = isLocal ? 'http://localhost:3000' : 'https://aoply.giroestudo.com.br';

    // Se o usuário acessar o backend raiz pelo navegador, redireciona para o Painel Web (CMS)
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
}

