export function renderPrivacyPolicyHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Política de Privacidade | Aoply Digital Signage</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #FF0027;
      --bg: #07070a;
      --card-bg: rgba(18, 19, 28, 0.78);
      --border: rgba(255, 255, 255, 0.08);
      --text: #e4e4e7;
      --text-muted: #94a3b8;
      --text-heading: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.7;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .container {
      width: 100%;
      maxWidth: 820px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 42px 48px;
      box-shadow: 0 32px 84px rgba(0,0,0,0.7);
      backdrop-filter: blur(24px);
    }
    @media (max-width: 640px) {
      body { padding: 16px 12px; }
      .container { padding: 24px 20px; border-radius: 14px; }
    }
    .header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 0, 39, 0.12);
      color: var(--primary);
      border: 1px solid rgba(255, 0, 39, 0.3);
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
      margin-bottom: 12px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    h1 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: var(--text-heading);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .meta {
      font-size: 13px;
      color: var(--text-muted);
    }
    h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-heading);
      margin-top: 28px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    p { margin-bottom: 14px; font-size: 14.5px; color: #d4d4d8; }
    ul { margin: 8px 0 16px 24px; }
    li { margin-bottom: 6px; font-size: 14px; color: #d4d4d8; }
    a { color: var(--primary); text-decoration: underline; }
    .alert-box {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 10px;
      padding: 14px 18px;
      margin: 20px 0;
      font-size: 13.5px;
      color: #6ee7b7;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      font-size: 12.5px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Google Play Store & LGPD Compliance</div>
      <h1>Política de Privacidade</h1>
      <div class="meta">
        <strong>Aplicativo:</strong> Aoply (Digital Signage & Smart TV Player) • <strong>Site Oficial:</strong> <a href="https://aoply.giroestudo.com.br" target="_blank">aoply.giroestudo.com.br</a> • <strong>Última atualização:</strong> Outubro de 2026
      </div>
    </div>

    <div class="alert-box">
      <strong>Declaração de Conformidade:</strong> Esta Política de Privacidade foi elaborada em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018), com o Marco Civil da Internet (Lei nº 12.965/2014) e com as Políticas para Desenvolvedores do Google Play Store.
    </div>

    <h2>1. Identificação do Controlador</h2>
    <p>
      O software e serviço <strong>Aoply</strong> é uma solução de sinalização digital, transmissão corporativa e gestão de painéis de exibição audiovisual para Smart TVs (Android TV, Google TV e web players).
    </p>

    <h2>2. Dados Coletados</h2>
    <p>Para o funcionamento seguro e sincronizado do serviço, coletamos estritamente:</p>
    <ul>
      <li><strong>Dados Cadastrais:</strong> Nome completo ou razão social, endereço de e-mail e senha com hash criptográfico irreversível (PBKDF2/bcrypt com salt).</li>
      <li><strong>Dados Técnicos do Player (Smart TV / Android TV):</strong> Endereço IP da rede local, resolução de tela (ex: 1920x1080), identificador de hardware gerado no pareamento e versão do sistema operacional para compatibilidade.</li>
      <li><strong>Telemetria Operacional:</strong> Frequência de conexão (heartbeat via WebSocket), status de execução de mídia e registros de sincronismo de playlists.</li>
    </ul>
    <p>
      <strong>Dados NÃO Coletados:</strong> O aplicativo Aoply <em>NÃO</em> acessa agenda de contatos, histórico de navegação pessoal, microfone, câmera, localização precisa por GPS ou arquivos pessoais do dispositivo.
    </p>

    <h2>3. Finalidade do Tratamento</h2>
    <p>Os dados coletados destinam-se exclusivamente a:</p>
    <ul>
      <li>Permitir o pareamento seguro entre a Smart TV e o Painel Administrativo do estabelecimento via código de 6 dígitos;</li>
      <li>Distribuir e sincronizar em tempo real programações, vídeos, imagens e informativos definidos pelo gestor;</li>
      <li>Garantir a reprodução resiliente offline em cache local na Smart TV em caso de oscilações de rede;</li>
      <li>Possibilitar autenticação e recuperação de credenciais esquecidas mediante código seguro por e-mail.</li>
    </ul>

    <h2>4. Não Compartilhamento e Não Comercialização</h2>
    <p>
      <strong>A Aoply não comercializa, não repassa e não divulga dados para corretoras de dados ou redes de publicidade direcionada de terceiros.</strong> As transmissões ocorrem exclusivamente entre a aplicação do usuário e nossos servidores em nuvem com criptografia de ponta a ponta (TLS 1.3 / HTTPS / WSS).
    </p>

    <h2>5. Integração com Terceiros (YouTube API)</h2>
    <p>
      O aplicativo permite a exibição de conteúdos via YouTube Player IFrame. O uso dessa funcionalidade está sujeito à{' '}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidade do Google</a> e aos{' '}
      <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">Termos de Serviço do YouTube</a>.
    </p>

    <h2>6. Direitos do Titular (LGPD, Art. 18) e Exclusão de Conta</h2>
    <p>
      O usuário titular dos dados possui o direito assegurado por lei de solicitar: confirmação do tratamento, acesso aos dados, retificação, bloqueio ou eliminação definitiva de sua conta e de todos os dados a ela vinculados.
    </p>
    <p>
      A solicitação de exclusão definitiva pode ser feita diretamente pelo Painel Administrativo ou enviando solicitação ao e-mail oficial do nosso Encarregado de Dados.
    </p>

    <h2>7. Contato do Encarregado de Proteção de Dados (DPO)</h2>
    <p>
      Para requisições, esclarecimentos ou exercício de direitos de privacidade, contate nosso Encarregado de Dados (DPO):<br>
      <strong>Canal Oficial:</strong> <a href="mailto:privacidade@aoply.com">privacidade@aoply.com</a>
    </p>

    <div class="footer">
      <span>&copy; 2026 Aoply - Todos os direitos reservados.</span>
      <span><a href="/terms">Consultar Termos de Uso</a></span>
    </div>
  </div>
</body>
</html>`;
}

export function renderTermsOfServiceHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Termos de Uso | Aoply Digital Signage</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #FF0027;
      --bg: #07070a;
      --card-bg: rgba(18, 19, 28, 0.78);
      --border: rgba(255, 255, 255, 0.08);
      --text: #e4e4e7;
      --text-muted: #94a3b8;
      --text-heading: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.7;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .container {
      width: 100%;
      maxWidth: 820px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 42px 48px;
      box-shadow: 0 32px 84px rgba(0,0,0,0.7);
      backdrop-filter: blur(24px);
    }
    @media (max-width: 640px) {
      body { padding: 16px 12px; }
      .container { padding: 24px 20px; border-radius: 14px; }
    }
    .header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 0, 39, 0.12);
      color: var(--primary);
      border: 1px solid rgba(255, 0, 39, 0.3);
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
      margin-bottom: 12px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    h1 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: var(--text-heading);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .meta {
      font-size: 13px;
      color: var(--text-muted);
    }
    h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-heading);
      margin-top: 28px;
      margin-bottom: 12px;
    }
    p { margin-bottom: 14px; font-size: 14.5px; color: #d4d4d8; }
    ul { margin: 8px 0 16px 24px; }
    li { margin-bottom: 6px; font-size: 14px; color: #d4d4d8; }
    a { color: var(--primary); text-decoration: underline; }
    .alert-box {
      background: rgba(255, 0, 39, 0.08);
      border: 1px solid rgba(255, 0, 39, 0.25);
      border-radius: 10px;
      padding: 14px 18px;
      margin: 20px 0;
      font-size: 13.5px;
      color: #fca5a5;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      font-size: 12.5px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Termos e Condições Contratuais</div>
      <h1>Termos de Uso do Aplicativo</h1>
      <div class="meta">
        <strong>Plataforma:</strong> Aoply (Web CMS & Android TV Player) • <strong>Site Oficial:</strong> <a href="https://aoply.giroestudo.com.br" target="_blank">aoply.giroestudo.com.br</a> • <strong>Última atualização:</strong> Outubro de 2026
      </div>
    </div>

    <div class="alert-box">
      <strong>Acordo Vinculante:</strong> Ao instalar, acessar ou utilizar o aplicativo Aoply em Smart TVs, TV Boxes ou gerenciar dispositivos através do Painel Administrativo, você concorda expressamente com todos os termos e diretrizes aqui estipulados.
    </div>

    <h2>1. Objeto e Licença de Uso</h2>
    <p>
      A plataforma <strong>Aoply</strong> provê uma solução tecnológica de software como serviço (SaaS) destinada à distribuição, gerenciamento e automação de exibição de mídias audiovisuais em telas e monitores corporativos (<em>Digital Signage</em>).
    </p>
    <p>
      É outorgada ao usuário uma licença de uso limitada, não exclusiva e intransferível do aplicativo Aoply para Android TV e do painel de controle correspondente.
    </p>

    <h2>2. Cadastro e Responsabilidade de Acesso</h2>
    <p>
      O usuário é o único guardião de suas credenciais de autenticação (e-mail e senha). Todas as alterações de grade de programação, inclusão de mídias ou comandos de pareamento disparados através de sua conta são de sua exclusiva responsabilidade.
    </p>

    <h2>3. Direitos Autorais e Execução Pública de Músicas (ECAD)</h2>
    <p>
      3.1. <strong>Responsabilidade do Estabelecimento:</strong> A Aoply oferece exclusivamente a tecnologia de transmissão e agendamento. Conforme a Lei Federal nº 9.610/1998 (Lei de Direitos Autorais), a eventual execução pública de obras musicais e audiovisuais em ambientes comerciais, recintos com frequência coletiva ou estabelecimentos comerciais é de inteira e exclusiva responsabilidade do titular do estabelecimento, cabendo a este o recolhimento das devidas taxas junto ao Escritório Central de Arrecadação e Distribuição (ECAD), quando aplicável.
    </p>
    <p>
      3.2. <strong>Uso da API do YouTube:</strong> A exibição de vídeos do YouTube através da plataforma utiliza os componentes oficiais da Google Inc. O usuário concorda em obedecer integralmente aos <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">Termos de Serviço do YouTube</a>.
    </p>

    <h2>4. Modo Quiosque (Kiosk Mode) e Telemetria Remota</h2>
    <p>
      O aplicativo Aoply foi projetado para execução contínua em Smart TVs. Para propósitos legítimos de monitoramento e auditoria da grade comercial pelo próprio contratante, o sistema dispõe de telemetria de conectividade e captura de tela (screenshot) remota sob demanda do administrador da conta.
    </p>

    <h2>5. Disponibilidade do Serviço e Cache Offline</h2>
    <p>
      A plataforma integra algoritmo de reprodução contínua em cache de memória local (IndexedDB / Local Storage) para preservar a exibição ininterrupta durante oscilações momentâneas de sinal de internet. A Aoply não se responsabiliza por queima de hardware de terceiros, quedas gerais de provedores de internet ou restrições de rede locais do cliente.
    </p>

    <h2>6. Rescisão e Exclusão</h2>
    <p>
      O usuário poderá cessar a utilização e solicitar a exclusão de sua conta a qualquer momento mediante o canal oficial de atendimento.
    </p>

    <h2>7. Legislação e Foro</h2>
    <p>
      Estes Termos são regidos pela legislação da República Federativa do Brasil. As partes elegem o foro da comarca da sede da empresa para resolução de eventuais litígios oriundos deste instrumento.
    </p>

    <div class="footer">
      <span>&copy; 2026 Aoply - Todos os direitos reservados.</span>
      <span><a href="/privacy">Consultar Política de Privacidade</a></span>
    </div>
  </div>
</body>
</html>`;
}
