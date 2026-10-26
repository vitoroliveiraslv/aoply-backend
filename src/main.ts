import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

import { json, urlencoded } from 'express';

// Serialização segura de BigInt para JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Aumenta o limite de payload para 50mb (suporta base64, telemetria em lote, etc.)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Habilita CORS para conexão com o Painel Web e Smart TVs
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validação global de payloads DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Digital Signage Backend Core rodando em: http://localhost:${port}`);
  logger.log(`📡 WebSocket Gateway de Pareamento e Sincronização ativo na porta ${port}`);
  logger.log(`📺 Endpoint de Pareamento para Smart TVs: POST http://localhost:${port}/api/v1/devices/request-pairing`);
}

bootstrap();
