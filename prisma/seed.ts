import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as path from 'path';

const dbPath = path.resolve(process.cwd(), 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Iniciando seed do Digital Signage...');

  // 1. Organização Principal
  const org = await prisma.organization.upsert({
    where: { slug: 'matriz-corporativa' },
    update: {},
    create: {
      name: 'Rede Corporativa Matriz',
      slug: 'matriz-corporativa',
    },
  });

  // 2. Mídias (Vídeos de Anúncios Locais e Conteúdo do YouTube)
  const adVideo1 = await prisma.asset.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      organizationId: org.id,
      name: 'Anúncio Institucional - Novo Produto 2026',
      type: 'VIDEO',
      cdnUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
      durationSeconds: 30,
      checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fileSizeBytes: BigInt(15420000),
      transcodeStatus: 'COMPLETED',
    },
  });

  const adVideo2 = await prisma.asset.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      organizationId: org.id,
      name: 'Campanha de Segurança do Trabalho',
      type: 'VIDEO',
      cdnUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
      durationSeconds: 25,
      checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      fileSizeBytes: BigInt(12500000),
      transcodeStatus: 'COMPLETED',
    },
  });

  // Mídias do YouTube
  const ytVideo1 = await prisma.asset.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      organizationId: org.id,
      name: 'Inovação e Tendências em Tecnologia 2026',
      type: 'YOUTUBE',
      externalId: 'dQw4w9WgXcQ',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      durationSeconds: 212,
      transcodeStatus: 'COMPLETED',
    },
  });

  const ytVideo2 = await prisma.asset.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      organizationId: org.id,
      name: 'Resumo de Notícias do Mercado Financeiro',
      type: 'YOUTUBE',
      externalId: 'L_LUpnjgPso',
      thumbnailUrl: 'https://img.youtube.com/vi/L_LUpnjgPso/hqdefault.jpg',
      durationSeconds: 180,
      transcodeStatus: 'COMPLETED',
    },
  });

  const ytVideo3 = await prisma.asset.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      organizationId: org.id,
      name: 'Natureza 4K Relaxante para Recepção',
      type: 'YOUTUBE',
      externalId: 'LXb3EKWsInQ',
      thumbnailUrl: 'https://img.youtube.com/vi/LXb3EKWsInQ/hqdefault.jpg',
      durationSeconds: 300,
      transcodeStatus: 'COMPLETED',
    },
  });

  // 3. Playlist Mista com Regra de Intercalação
  const playlist = await prisma.playlist.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      organizationId: org.id,
      name: 'Playlist Recepção Principal (Intercalada)',
      description: 'Regra: A cada 3 vídeos do YouTube, reproduz 1 anúncio local em cache.',
      interleaveRules: JSON.stringify({
        type: 'INTERVAL_BY_COUNT',
        youtubeFrequency: 3,
        description: 'A cada 3 vídeos de conteúdo/YouTube, injetar 1 anúncio institucional',
      }),
      version: 1,
      items: {
        create: [
          { assetId: ytVideo1.id, position: 0, category: 'CONTENT' },
          { assetId: ytVideo2.id, position: 1, category: 'CONTENT' },
          { assetId: ytVideo3.id, position: 2, category: 'CONTENT' },
          { assetId: adVideo1.id, position: 3, category: 'COMMERCIAL_AD' },
          { assetId: adVideo2.id, position: 4, category: 'COMMERCIAL_AD' },
        ],
      },
    },
  });

  // 4. Agendamento Semanal (Segunda a Sexta, 08h às 19h)
  const schedule = await prisma.schedule.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      organizationId: org.id,
      name: 'Seg. a Dom.',
      timezone: 'America/Sao_Paulo',
      rules: {
        create: [
          // Segunda a Sexta (1 a 5): 08:00 às 20:00
          { dayOfWeek: 1, startTime: '08:00:00', endTime: '20:00:00', playlistId: playlist.id },
          { dayOfWeek: 2, startTime: '08:00:00', endTime: '20:00:00', playlistId: playlist.id },
          { dayOfWeek: 3, startTime: '08:00:00', endTime: '20:00:00', playlistId: playlist.id },
          { dayOfWeek: 4, startTime: '08:00:00', endTime: '20:00:00', playlistId: playlist.id },
          { dayOfWeek: 5, startTime: '08:00:00', endTime: '20:00:00', playlistId: playlist.id },
          // Sábado (6) e Domingo (0): 09:00 às 15:00
          { dayOfWeek: 6, startTime: '09:00:00', endTime: '15:00:00', playlistId: playlist.id },
          { dayOfWeek: 0, startTime: '09:00:00', endTime: '15:00:00', playlistId: playlist.id },
        ],
      },
    },
  });

  console.log('Seed concluído com sucesso!');
  console.log(`Organização: ${org.name} (${org.id})`);
  console.log(`Playlist: ${playlist.name} (${playlist.id})`);
  console.log(`Agendador Semanal: ${schedule.name} (${schedule.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
