# Digital Signage - Backend Core API & Realtime Gateway

Backend robusto construído com **NestJS**, **Prisma**, **SQLite / PostgreSQL** e **WebSockets (Socket.io)** para gerenciamento de redes de Digital Signage (Mídia Indoor / Painéis Corporativos).

---

## 🚀 Funcionalidades Implementadas e Testadas

1. **Pareamento de Telas Estilo YouTube on TV**:
   - `POST /api/v1/devices/request-pairing`: A TV liga sem credenciais, obtém um código amigável de 6 dígitos (ex: `237-179`) válido por 10 minutos e entra na sala WebSocket `pairing:237179`.
   - `POST /api/v1/devices/claim-pairing`: O administrador digita o código no painel web. O backend valida, gera um token permanente seguro e emite o evento `device:paired` em tempo real para a TV sair da tela de espera e começar a tocar.
2. **Biblioteca de Mídias (Assets)**:
   - Suporte a anúncios locais em vídeo (MP4/WebM) com URLs de CDN, checksum SHA-256 e tamanho de arquivo para cache.
   - Suporte a vídeos do YouTube com extração e validação automática de ID de URL (`youtu.be`, `watch?v=`, `shorts`) e resolução de thumbnail de alta qualidade.
3. **Playlists Mistas & Motor de Intercalação**:
   - Suporte a regras de intercalação dinâmica (`interleaveRules`): *ex: a cada 3 vídeos de conteúdo/YouTube, reproduzir 1 anúncio institucional em vídeo*.
   - Reordenação *drag-and-drop* com atualização em lote via `PUT /api/v1/playlists/:id/reorder`.
   - Notificação automática em tempo real via WebSocket (`player:sync`) para todas as TVs conectadas quando a playlist ou agendamento for alterado.
4. **Agendador Semanal (Scheduler)**:
   - Grade horária flexível configurável por dia da semana (Domingo a Sábado, 0 a 6).
   - Resolução de grade por horário com fallback automático para playlist padrão se estiver fora da janela.
5. **Telemetria & Proof-of-Play**:
   - Heartbeat da Smart TV (`POST /api/v1/devices/ping`) com armazenamento livre em disco e status.
   - Envio em lote de logs de reprodução (`POST /api/v1/devices/telemetry`) para auditoria de anúncios.

---

## 🛠️ Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Sincronizar banco de dados e popular dados de exemplo
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Compilar e Iniciar o Servidor
```bash
npm run build
npm run start
```
O servidor estará rodando em: `http://localhost:3001`

---

## 📡 Endpoints Principais

### Dispositivos / Telas
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/v1/devices/request-pairing` | Chamado pela Smart TV no primeiro boot para gerar código de 6 dígitos |
| `POST` | `/api/v1/devices/claim-pairing` | Chamado pelo painel Web para vincular a tela via código |
| `GET` | `/api/v1/devices` | Lista telas cadastradas e seus status |
| `GET` | `/api/v1/devices/:id/manifest` | Download do manifesto da TV (grade, links de vídeos e IDs YouTube) |
| `POST` | `/api/v1/devices/ping` | Heartbeat periódico da Smart TV |
| `POST` | `/api/v1/devices/telemetry` | Envio em lote de comprovantes de exibição (*Proof of Play*) |
| `POST` | `/api/v1/devices/:id/command` | Envio de comandos remotos (reload, mensagem, etc.) |

### Mídias
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/v1/media/youtube` | Adiciona vídeo do YouTube com validação de link e thumbnail |
| `POST` | `/api/v1/media/local-video` | Registra vídeo local com CDN e hash SHA-256 |
| `GET` | `/api/v1/media` | Lista mídias da biblioteca |

### Playlists
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/v1/playlists` | Cria playlist com itens e regras de alternância |
| `GET` | `/api/v1/playlists` | Lista playlists |
| `PUT` | `/api/v1/playlists/:id/reorder` | Reordena itens após drag-and-drop |
| `PUT` | `/api/v1/playlists/:id/rules` | Atualiza regras de intercalação |

### Agendamentos
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/v1/schedules` | Cria agendador semanal |
| `PUT` | `/api/v1/schedules/:id/rules` | Atualiza faixas de horário (Segunda a Domingo) |
| `POST` | `/api/v1/schedules/:id/assign/:deviceId` | Atribui a grade horária a uma TV |
