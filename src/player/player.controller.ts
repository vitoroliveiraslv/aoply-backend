import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AOPLY_LOGO_WHITE, AOPLY_ICON, AOPLY_LOGO_RED } from './player-assets';

@Controller('tv')
export class PlayerController {
  @Get()
  getTvPlayer(@Res() res: Response) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>Smart TV Player | Aoply</title>
  <link rel="icon" type="image/png" href="${AOPLY_ICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
  <script src="https://www.youtube.com/iframe_api"></script>
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-user-select: none;
      user-select: none;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #000000;
    }

    body {
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
    }

    /* =========================================
       1. TELA DE PAREAMENTO (ESTILO YOUTUBE ON TV)
       ========================================= */
    #pairing-screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #07070a;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px;
      z-index: 100;
      transition: opacity 0.8s ease, transform 0.8s ease;
      overflow: hidden;
    }

    #pairing-screen.hidden {
      display: none !important;
      opacity: 0;
      pointer-events: none;
      transform: scale(1.05);
    }

    /* =========================================
       EFEITO LÍQUIDO / AMBIENT LIQUID GRADIENT BLOBS
       ========================================= */
    .liquid-glow-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
      z-index: 1;
    }

    .liquid-blob {
      position: absolute;
      border-radius: 50%;
      opacity: 0.62;
      will-change: transform;
    }

    /* Bola 1: tom carmesim vibrante no quadrante direito-superior */
    .blob-1 {
      width: 720px;
      height: 720px;
      right: 2%;
      top: 5%;
      background: radial-gradient(circle at 45% 45%, rgba(255, 0, 39, 0.45) 0%, rgba(255, 40, 75, 0.20) 35%, rgba(180, 0, 30, 0) 65%);
      animation: liquidDance1 22s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
    }

    /* Bola 2: tom rubi no quadrante esquerdo-inferior */
    .blob-2 {
      width: 780px;
      height: 780px;
      left: 5%;
      bottom: 0%;
      background: radial-gradient(circle at 50% 50%, rgba(255, 30, 70, 0.40) 0%, rgba(200, 0, 40, 0.18) 38%, rgba(0, 0, 0, 0) 68%);
      animation: liquidDance2 26s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
    }

    /* Bola 3: ponte central de mescla líquida que conecta as duas */
    .blob-3 {
      width: 560px;
      height: 560px;
      left: 42%;
      top: 25%;
      background: radial-gradient(circle at 50% 50%, rgba(255, 0, 45, 0.30) 0%, rgba(160, 0, 35, 0.10) 40%, rgba(0, 0, 0, 0) 65%);
      animation: liquidDance3 18s ease-in-out infinite alternate;
      opacity: 0.45;
    }

    @keyframes liquidDance1 {
      0% {
        transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
      }
      25% {
        transform: translate3d(-180px, 100px, 0) scale(1.15) rotate(40deg);
      }
      50% {
        transform: translate3d(-100px, 240px, 0) scale(0.92) rotate(80deg);
      }
      75% {
        transform: translate3d(-260px, 120px, 0) scale(1.12) rotate(130deg);
      }
      100% {
        transform: translate3d(-60px, -50px, 0) scale(1.05) rotate(180deg);
      }
    }

    @keyframes liquidDance2 {
      0% {
        transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
      }
      25% {
        transform: translate3d(200px, -120px, 0) scale(1.22) rotate(-45deg);
      }
      50% {
        transform: translate3d(280px, -60px, 0) scale(0.88) rotate(-90deg);
      }
      75% {
        transform: translate3d(140px, -200px, 0) scale(1.16) rotate(-140deg);
      }
      100% {
        transform: translate3d(40px, 40px, 0) scale(0.96) rotate(-180deg);
      }
    }

    @keyframes liquidDance3 {
      0% {
        transform: translate3d(0, 0, 0) scale(0.9) rotate(0deg);
      }
      50% {
        transform: translate3d(-120px, -90px, 0) scale(1.3) rotate(90deg);
      }
      100% {
        transform: translate3d(120px, 100px, 0) scale(1) rotate(180deg);
      }
    }

    .pairing-header {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo-img {
      height: 48px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 4px 16px rgba(255, 0, 39, 0.45));
    }

    .live-clock-badge {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #f4f4f5;
      background: rgba(255, 255, 255, 0.04);
      padding: 8px 18px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .live-clock-badge .clock-icon {
      width: 20px;
      height: 20px;
      stroke: #a1a1aa;
      flex-shrink: 0;
    }

    .pairing-body {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 60px;
      margin: 40px 0;
    }

    .pairing-instructions {
      max-width: 580px;
    }

    .pairing-title {
      font-size: 44px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 28px;
    }

    .pairing-title span {
      background: linear-gradient(135deg, #FF0027 0%, #ff4d66 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .instruction-steps {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 18px;
      min-height: 80px;
      box-sizing: border-box;
      background: rgba(22, 22, 28, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 16px 20px;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .step-num {
      width: 36px;
      height: 36px;
      min-width: 36px;
      background: rgba(255, 0, 39, 0.12);
      border: 1.5px solid rgba(255, 0, 39, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      color: #FF0027;
      flex-shrink: 0;
    }

    .step-text {
      font-size: 19px;
      color: #e4e4e7;
      line-height: 1.45;
      font-weight: 450;
    }

    .step-text strong {
      color: #ffffff;
      font-weight: 700;
    }

    .step-text .url-box {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", monospace;
      color: #ffffff;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .pairing-code-card {
      background: transparent;
      backdrop-filter: none;
      border: none;
      box-shadow: none;
      padding: 20px 30px;
      text-align: center;
      position: relative;
    }

    .code-label {
      font-size: 15px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #a1a1aa;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .big-code-display {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", "Inter", sans-serif;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
      font-size: 72px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #ffffff;
      background: linear-gradient(135deg, #ffffff 40%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
      margin-bottom: 20px;
    }

    .code-expiry {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #a1a1aa;
      background: rgba(0, 0, 0, 0.4);
      padding: 6px 16px;
      border-radius: 9999px;
    }

    .pairing-waiting-box {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }

    .pairing-waiting-text {
      font-size: 14px;
      font-weight: 500;
      color: #94a3b8;
      letter-spacing: -0.01em;
      text-align: center;
    }

    .pairing-footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 24px;
      font-size: 14px;
      color: #71717a;
    }

    .device-meta {
      display: flex;
      gap: 32px;
    }

    .device-meta span {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Master App Viewport Container com Compensação de Overscan para Smart TVs */
    #aoply-app-root {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden;
      background: #000;
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: center center;
      z-index: 5;
    }

    /* Modos de Compensação de Overscan (Anti-Corte para TVs com bordas cortadas) */
    #aoply-app-root.overscan-safe-1 {
      transform: scale(0.96);
    }

    #aoply-app-root.overscan-safe-2 {
      transform: scale(0.92);
    }

    #aoply-app-root.overscan-safe-3 {
      transform: scale(0.88);
    }

    /* =========================================
       2. MOTOR DUAL-DECK DO PLAYER DE VÍDEO
       ========================================= */
    #player-viewport {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100% !important;
      height: 100% !important;
      background: #000;
      z-index: 10;
      overflow: hidden;
    }

    /* Deck A: Local Video Player */
    #deck-local-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
      opacity: 0;
      transition: opacity 0.4s ease-in-out;
      z-index: 20;
    }

    /* Deck B: YouTube Player IFrame */
    #deck-youtube-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      opacity: 0;
      transition: opacity 0.4s ease-in-out;
      z-index: 15;
      pointer-events: none !important;
      background: #000;
    }

    #deck-youtube-container.deck-active {
      opacity: 1 !important;
      pointer-events: none !important;
    }

    #deck-youtube-container iframe,
    #yt-player-target {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      transform: none !important;
      pointer-events: none !important;
    }

    /* Deck C: Imagem Estática / Anúncio Gráfico */
    #deck-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      z-index: 18;
      pointer-events: none;
    }

    /* Cortina de Transição Limpa (Elimina flash ou congelamento de frame anterior) */
    #deck-transition-veil {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background: #000000;
      z-index: 28;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s ease-out;
    }

    #deck-transition-veil.active {
      opacity: 1 !important;
    }

    .deck-active {
      opacity: 1 !important;
    }

    /* =========================================
       3. OVERLAY MINIMALISTA (SMART SIGNAGE HUD)
       ========================================= */
    #player-hud {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 30;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 32px;
      box-sizing: border-box;
    }

    .hud-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .hud-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(15, 15, 18, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      color: #e4e4e7;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    }

    .hud-ad-pill {
      background: rgba(220, 38, 38, 0.45);
      border-color: rgba(239, 68, 68, 0.5);
      color: #fecaca;
    }

    .hud-clock {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
      font-size: 28px;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #ffffff;
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      padding: 0;
      border: none;
      box-shadow: none;
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.85);
    }

    /* Toast Minimalista: Aparece suavemente no canto nos primeiros segundos da nova música/vídeo */
    .hud-toast {
      position: absolute;
      bottom: 50px;
      left: 32px;
      background: rgba(10, 10, 14, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      padding: 7px 22px 7px 9px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(255, 0, 39, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      z-index: 50;
      opacity: 0;
      transform: translateY(14px) scale(0.96);
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }

    .hud-toast.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* CD Giratório Aoply (Efeito de disco rodando no canto na transição de música) */
    .toast-cd-spin-wrap {
      position: relative;
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-cd-disc {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      overflow: hidden;
      animation: spinCD 3.5s linear infinite;
      box-shadow: 0 4px 14px rgba(255, 0, 39, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.18);
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      will-change: transform;
    }

    .toast-cd-disc.paused,
    .hud-toast.paused .toast-cd-disc {
      animation-play-state: paused !important;
    }

    .hud-toast.paused .toast-equalizer span {
      animation-play-state: paused !important;
    }

    .toast-cd-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 50%;
      pointer-events: none;
    }

    /* Ranhuras sutis de CD de áudio / vinil */
    .toast-cd-grooves {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      background: radial-gradient(circle, transparent 28%, rgba(255, 255, 255, 0.08) 32%, transparent 36%, rgba(255, 255, 255, 0.06) 55%, transparent 60%, rgba(255, 255, 255, 0.08) 78%, transparent 82%);
      pointer-events: none;
    }

    /* Brilho radial holográfico de reflexo de luz */
    .toast-cd-sheen {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 45%, rgba(255, 255, 255, 0.22) 100%);
      pointer-events: none;
    }

    /* Furo central do disco */
    .toast-cd-center-hole {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #0e0e12;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.45);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.9);
      pointer-events: none;
    }

    @keyframes spinCD {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .toast-equalizer {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 18px;
      width: 18px;
      padding-bottom: 2px;
      flex-shrink: 0;
    }

    .toast-equalizer span {
      width: 3px;
      background: linear-gradient(180deg, #ff4d66 0%, #FF0027 100%);
      border-radius: 9999px;
      animation: soundwave 0.8s ease-in-out infinite alternate;
    }

    .toast-equalizer span:nth-child(1) { height: 40%; animation-delay: 0.15s; }
    .toast-equalizer span:nth-child(2) { height: 95%; animation-delay: 0.35s; }
    .toast-equalizer span:nth-child(3) { height: 60%; animation-delay: 0.05s; }
    .toast-equalizer span:nth-child(4) { height: 80%; animation-delay: 0.25s; }

    @keyframes soundwave {
      0% { height: 25%; }
      100% { height: 100%; }
    }

    .toast-content {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .toast-label {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #FF0027;
      text-transform: uppercase;
      margin-bottom: 1px;
    }

    .toast-title {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
      letter-spacing: -0.015em;
      max-width: 520px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Barra Minimalista de Rodapé (Now Playing) */
    .hud-bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 36px;
      background: rgba(10, 10, 14, 0.90);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      box-sizing: border-box;
      z-index: 35;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .bar-left {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
      max-width: 75%;
    }


    .bar-track-name {
      font-size: 13px;
      font-weight: 600;
      color: #f4f4f5;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-right {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #a1a1aa;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
      font-weight: 500;
      flex-shrink: 0;
    }

    .bar-time {
      color: #a1a1aa;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
    }

    /* Linha de Progresso Ultra-fina no Rodapé */
    .bar-progress-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2.5px;
      background: rgba(255, 255, 255, 0.08);
    }

    .bar-progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #FF0027, #ff4d66);
      transition: width 0.3s linear;
    }

    /* Ocultar Cursor e Toolbar em Tela Cheia / Inatividade */
    body.cursor-hidden {
      cursor: none !important;
    }

    /* =========================================
       4. BARRA DE CONTROLE DO SIMULADOR (APENAS MODO DEV / TESTES LOCAIS)
       Oculta por padrão para manter o app da Smart TV 100% limpo, comercial e cinematográfico.
       Só aparece em navegador desktop se acessado com ?dev=true ou ?simulator=true
       ========================================= */
    #simulator-toolbar {
      display: none !important;
    }

    body.dev-mode #simulator-toolbar {
      display: flex !important;
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(24, 24, 27, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      padding: 6px 16px;
      align-items: center;
      gap: 12px;
      z-index: 200;
      opacity: 0.25;
      transition: opacity 0.3s, transform 0.3s, box-shadow 0.3s, border-color 0.3s;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    }

    body.dev-mode.cursor-hidden #simulator-toolbar:not(.tv-active):not(:focus-within) {
      opacity: 0 !important;
      pointer-events: none !important;
    }

    body.dev-mode #simulator-toolbar:hover,
    body.dev-mode #simulator-toolbar:focus-within,
    body.dev-mode #simulator-toolbar.tv-active {
      opacity: 1 !important;
      pointer-events: auto !important;
      transform: translateX(-50%) scale(1.02);
      border-color: rgba(255, 0, 39, 0.5);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 0, 39, 0.25);
    }

    .sim-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e4e4e7;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, outline 0.15s ease;
      outline: none;
    }

    .sim-btn:hover {
      background: #FF0027;
      color: #fff;
      border-color: #ff3355;
    }

    /* NAVEGAÇÃO POR FOCO EM TELAS GRANDES (CONTROLE REMOTO ANDROID TV / SMART TV) */
    :focus-visible,
    .tv-focused {
      outline: 3px solid #FF0027 !important;
      outline-offset: 3px !important;
      transform: scale(1.08) !important;
      box-shadow: 0 0 22px rgba(255, 0, 39, 0.85), 0 0 45px rgba(255, 0, 39, 0.4) !important;
      transition: transform 0.15s ease, outline 0.15s ease, box-shadow 0.15s ease !important;
    }

    .sim-btn:focus,
    .sim-btn:focus-visible,
    .sim-btn.tv-focused {
      background: #FF0027 !important;
      color: #ffffff !important;
      border-color: #ffffff !important;
      outline: 3px solid #ffffff !important;
      outline-offset: 2px !important;
      transform: scale(1.08) !important;
      box-shadow: 0 0 25px rgba(255, 0, 39, 0.95), 0 0 50px rgba(255, 0, 39, 0.5) !important;
    }

    .sim-btn-danger:hover {
      background: #dc2626;
      border-color: #ef4444;
    }

    .sim-btn-danger:focus,
    .sim-btn-danger:focus-visible,
    .sim-btn-danger.tv-focused {
      background: #dc2626 !important;
      color: #ffffff !important;
      border-color: #ffffff !important;
      outline: 3px solid #ffffff !important;
      outline-offset: 2px !important;
      transform: scale(1.08) !important;
      box-shadow: 0 0 25px rgba(220, 38, 38, 0.95) !important;
    }

    /* =========================================
       TELA DE PLAYLIST SEM MÚSICA (STANDBY CLEAN)
       ========================================= */
    .empty-screen {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 42%, #1a0407 0%, #07080c 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 25;
      opacity: 1;
      visibility: visible;
      transition: opacity 0.4s ease, visibility 0.4s ease;
      overflow: hidden;
      padding: 32px;
      box-sizing: border-box;
    }

    .empty-screen.hidden {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    .empty-screen-glow {
      position: absolute;
      width: 680px;
      height: 680px;
      background: radial-gradient(circle, rgba(255, 0, 39, 0.18) 0%, rgba(255, 0, 39, 0.04) 40%, transparent 65%);
      pointer-events: none;
      animation: ambientFloat 8s ease-in-out infinite alternate;
    }

    @keyframes ambientFloat {
      0% { transform: scale(0.92) translate(-12px, -12px); opacity: 0.6; }
      100% { transform: scale(1.08) translate(12px, 12px); opacity: 0.95; }
    }

    .empty-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 640px;
      padding: 24px;
      background: transparent;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border: none;
      box-shadow: none;
      z-index: 2;
    }

    .empty-icon-wrap {
      width: auto;
      height: auto;
      background: transparent;
      border: none;
      box-shadow: none;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }

    .empty-music-icon {
      width: 96px;
      height: 96px;
      color: #FF0027;
      filter: drop-shadow(0 12px 36px rgba(255, 0, 39, 0.55));
    }

    .empty-title {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", sans-serif;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0 0 14px 0;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.7);
    }

    .empty-desc {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif;
      font-size: 15.5px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 28px 0;
      max-width: 500px;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
    }

    .empty-sync-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0;
      background: transparent;
      border: none;
      box-shadow: none;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #cbd5e1;
      letter-spacing: -0.01em;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
    }

    .empty-sync-spinner {
      width: 18px;
      height: 18px;
      color: #FF0027;
      animation: spinArrows 1.8s linear infinite;
      flex-shrink: 0;
      filter: drop-shadow(0 0 10px rgba(255, 0, 39, 0.8));
    }

    @keyframes spinArrows {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* =========================================
       OSD (ON-SCREEN DISPLAY) DO CONTROLE REMOTO
       ========================================= */
    .remote-osd {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 24px 38px;
      background: rgba(12, 14, 22, 0.94);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 26px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      z-index: 80;
      pointer-events: none;
      opacity: 1;
      visibility: visible;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .remote-osd.hidden {
      opacity: 0 !important;
      visibility: hidden !important;
      transform: translate(-50%, -50%) scale(0.9) !important;
    }

    .osd-icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.16);
      border: 1px solid rgba(99, 102, 241, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a5b4fc;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.25);
    }

    .osd-text {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
    }

    /* Alerta de Modo Offline */
    #offline-banner {
      display: none;
      position: absolute;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(220, 38, 38, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 20px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.02em;
      z-index: 50;
      box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
      animation: pulse 2s infinite;
    }
  </style>
</head>
<body>

  <!-- BARRA DE CONTROLE DO SIMULADOR (Hover no topo da tela ou Seta Cima no Controle Remoto) -->
  <div id="simulator-toolbar" role="toolbar" aria-label="Controles da Smart TV">
    <span style="font-size: 11px; font-weight: 800; color: #FF0027; letter-spacing: 0.05em;">SMART TV KIOSK</span>
    <button class="sim-btn tv-navigable" tabindex="0" onclick="toggleFullscreen()" title="Controle Remoto: F / Tela Cheia">Tela Cheia</button>
    <button class="sim-btn tv-navigable" tabindex="0" onclick="skipToPrevious()" title="Controle Remoto: Seta Esquerda / Voltar">Retroceder</button>
    <button class="sim-btn tv-navigable" tabindex="0" id="btn-play-pause" onclick="togglePlayPause()" title="Controle Remoto: Espaço / OK / PlayPause">Pausar</button>
    <button class="sim-btn tv-navigable" tabindex="0" onclick="skipToNext()" title="Controle Remoto: Seta Direita / Avançar">Passar</button>
    <button class="sim-btn tv-navigable" tabindex="0" id="btn-toggle-offline" onclick="toggleOfflineMode()">Simular Queda de Rede</button>
    <button class="sim-btn sim-btn-danger tv-navigable" tabindex="0" onclick="resetToPairing()">Reiniciar Pareamento</button>
  </div>

  <div id="offline-banner">MODO OFFLINE ATIVADO - REPRODUZINDO VÍDEOS EM CACHE LOCAL</div>

  <!-- MASTER APP CONTAINER (Compensação Global de Overscan / Anti-Corte para Smart TV) -->
  <div id="aoply-app-root">
    <!-- 1. TELA DE PAREAMENTO (Estilo YouTube on TV) -->
    <div id="pairing-screen">
    <!-- Efeito Líquido: Bolas degradê dançando suavemente -->
    <div class="liquid-glow-bg" aria-hidden="true">
      <div class="liquid-blob blob-1"></div>
      <div class="liquid-blob blob-2"></div>
      <div class="liquid-blob blob-3"></div>
    </div>

    <div class="pairing-header">
      <div class="brand-logo">
        <img src="${AOPLY_LOGO_WHITE}" alt="Aoply" class="brand-logo-img" />
      </div>
      <div class="live-clock-badge">
        <svg class="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span id="pairing-clock">00:00:00</span>
      </div>
    </div>

    <div class="pairing-body">
      <div class="pairing-instructions">
        <h2 class="pairing-title">Conecte esta tela ao seu <span>Painel Administrativo</span></h2>
        
        <div class="instruction-steps">
          <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-text">Abra o navegador no seu computador ou celular em <span class="url-box" id="admin-panel-url-display">aoply.giroestudo.com.br</span> (Painel Administrativo)</div>
          </div>
          <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-text">Acesse a aba <strong>Telas</strong> e clique no botão <strong>Adicionar Tela</strong></div>
          </div>
          <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-text">Digite o código de 6 dígitos exibido ao lado para autorizar e conectar esta tela</div>
          </div>
        </div>
      </div>

      <div class="pairing-code-card">
        <div class="code-label">Código de Conexão</div>
        <div class="big-code-display" id="display-pairing-code">--- · ---</div>
        <div class="code-expiry">
          Expira em <span id="countdown-timer">10:00</span>
        </div>
        <div class="pairing-waiting-box">
          <div class="pairing-waiting-text">Aguardando autorização no painel administrativo</div>
        </div>
      </div>
    </div>

    <div class="pairing-footer">
      <div class="device-meta">
        <span><strong>Resolução:</strong> 1920x1080 (1080p 60Hz)</span>
        <span><strong>IP:</strong> <span id="device-ip-display">192.168.1.8</span></span>
        <span><strong>Sistema:</strong> Android TV 12 (Kiosk Mode)</span>
      </div>
      <div style="font-size: 13px; color: #52525b; text-align: right;">
        Termos de Uso e Política de Privacidade Aoply • LGPD & Google Play
      </div>
    </div>
  </div>

  <!-- 2. MOTOR DE REPRODUÇÃO MULTI-DECK -->
  <div id="player-viewport">
    <!-- Deck A: Local Video Player -->
    <video id="deck-local-video" playsinline muted></video>

    <!-- Deck B: YouTube Player IFrame Container -->
    <div id="deck-youtube-container">
      <div id="yt-player-target"></div>
    </div>

    <!-- Deck C: Imagem Estática / Anúncio Gráfico -->
    <img id="deck-image" alt="Publicidade" style="display: none;" />

    <!-- Cortina de Transição Limpa (Elimina flash ou congelamento de frame anterior) -->
    <div id="deck-transition-veil"></div>
  </div>

  <!-- TELA DE PLAYLIST SEM MÚSICA / STANDBY -->
  <div id="empty-playlist-screen" class="empty-screen hidden">
    <!-- Efeito Líquido: Bolas degradê dançando suavemente -->
    <div class="liquid-glow-bg" aria-hidden="true">
      <div class="liquid-blob blob-1"></div>
      <div class="liquid-blob blob-2"></div>
      <div class="liquid-blob blob-3"></div>
    </div>
    <div class="empty-screen-glow"></div>
    <div class="empty-card">
      <img src="${AOPLY_LOGO_WHITE}" alt="Aoply" style="height: 38px; width: auto; object-fit: contain; margin-bottom: 24px; filter: drop-shadow(0 4px 14px rgba(255, 0, 39, 0.4));" />
      <div class="empty-icon-wrap">
        <svg class="empty-music-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
          <line x1="3" y1="3" x2="21" y2="21" stroke="#FF0027" stroke-width="2.2"></line>
        </svg>
      </div>
      <h1 class="empty-title">Playlist sem música</h1>
      <p class="empty-desc">Esta playlist não possui músicas cadastradas no momento.<br>Adicione músicas no painel administrativo para iniciar a programação da TV em tempo real.</p>
      <div class="empty-sync-badge">
        <svg class="empty-sync-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        <span>Aguardando programação em tempo real</span>
      </div>
    </div>
  </div>

  <!-- 3. OVERLAY MINIMALISTA (Badge Topo, Toast de Notificação e Barra de Rodapé) -->
  <div id="player-hud">
    <div class="hud-top">
      <div class="hud-badge" id="hud-badge-type" style="display: none;">
        <span id="hud-badge-dot" style="width: 7px; height: 7px; border-radius: 50%; background: #FF0027;"></span>
        <span id="hud-badge-text"></span>
      </div>
      <div class="hud-clock" id="hud-clock">19:42</div>
    </div>
  </div>

  <!-- Toast Minimalista de "Tocando Agora" com Disco CD Giratório da Aoply -->
  <div id="hud-nowplaying-toast" class="hud-toast">
    <div class="toast-cd-spin-wrap" id="toast-cd-wrap">
      <div class="toast-cd-disc" id="toast-cd-disc">
        <img src="${AOPLY_ICON}" class="toast-cd-img" alt="CD" />
        <div class="toast-cd-grooves"></div>
        <div class="toast-cd-sheen"></div>
        <div class="toast-cd-center-hole"></div>
      </div>
    </div>
    <div class="toast-equalizer">
      <span></span><span></span><span></span><span></span>
    </div>
    <div class="toast-content">
      <div class="toast-label" id="toast-label">TOCANDO AGORA</div>
      <div class="toast-title" id="toast-title">Carregando programação...</div>
    </div>
  </div>

  <!-- Barra Minimalista no Rodapé com o Nome da Música / Mídia -->
  <div class="hud-bottom-bar" id="hud-bottom-bar">
    <div class="bar-left">
      <img src="${AOPLY_ICON}" alt="Aoply" style="width: 18px; height: 18px; border-radius: 50%; object-fit: contain; flex-shrink: 0;" />
      <span class="bar-track-name" id="hud-media-title">Carregando programação...</span>
    </div>
    <div class="bar-right">
      <span id="bar-time-info" class="bar-time">--:-- / --:--</span>
      <span id="hud-clock-bottom">19:42</span>
    </div>
    <div class="bar-progress-line">
      <div class="bar-progress-fill" id="hud-progress-fill"></div>
    </div>
  </div>
  </div> <!-- FECHA #aoply-app-root -->

  <!-- OSD (On-Screen Display) para Comandos do Controle Remoto da TV (Centro Absoluto) -->
  <div id="remote-osd" class="remote-osd hidden">
    <div class="osd-icon-wrap" id="osd-icon-wrap">
      <svg id="osd-icon-svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
        <rect x="6" y="4" width="4" height="16" rx="1.5"></rect>
        <rect x="14" y="4" width="4" height="16" rx="1.5"></rect>
      </svg>
    </div>
    <div class="osd-text" id="osd-text">PAUSADO</div>
  </div>

  <!-- =========================================
       4. SCRIPTS DE CONTROLE DO SMART TV PLAYER
       ========================================= -->
  <script>
    // Ativa barra do simulador SOMENTE se explicitamente requisitada em ambiente de testes (?dev=true, ?simulator=true ou #dev)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('dev') === 'true' || urlParams.get('simulator') === 'true' || window.location.hash === '#dev') {
        document.body.classList.add('dev-mode');
      }
    } catch(e) {}

    // Estado do Player
    let currentDeviceId = localStorage.getItem('tv_device_id') || null;
    let currentDeviceToken = localStorage.getItem('tv_device_token') || null;
    let activePlaylist = null;
    let playlistItems = [];
    let currentQueue = [];
    let currentItemIndex = 0;
    let ytPlayer = null;
    let isYouTubeApiReady = false;
    let isOfflineMode = false;
    let isPaused = false;
    let userExplicitlyPaused = false;
    let elapsedSeconds = 0;
    let osdTimeout = null;
    let playbackInterval = null;
    let itemDurationRemaining = 0;
    let itemTotalDuration = 0;
    let youtubeCount = 0;
    const YOUTUBE_AD_FREQUENCY = 3; // A cada 3 YouTube, rodar 1 anúncio

    // Elementos DOM
    const pairingScreen = document.getElementById('pairing-screen');
    const displayPairingCode = document.getElementById('display-pairing-code');
    const countdownTimer = document.getElementById('countdown-timer');
    const deckVideo = document.getElementById('deck-local-video');
    const deckYouTube = document.getElementById('deck-youtube-container');
    const deckImage = document.getElementById('deck-image');
    const transitionVeil = document.getElementById('deck-transition-veil');
    const hudBadgeType = document.getElementById('hud-badge-type');
    const hudBadgeText = document.getElementById('hud-badge-text');
    const hudBadgeDot = document.getElementById('hud-badge-dot');
    const hudMediaTitle = document.getElementById('hud-media-title');
    const hudProgressFill = document.getElementById('hud-progress-fill');
    const offlineBanner = document.getElementById('offline-banner');
    const emptyPlaylistScreen = document.getElementById('empty-playlist-screen');

    // Controle da Cortina de Transição (Garante transição 100% limpa sem congelamento de frame anterior)
    let veilSafetyTimeout = null;
    function showTransitionVeil() {
      if (transitionVeil) transitionVeil.classList.add('active');
      if (veilSafetyTimeout) clearTimeout(veilSafetyTimeout);
      veilSafetyTimeout = setTimeout(() => {
        hideTransitionVeil();
      }, 3500);
    }

    function hideTransitionVeil() {
      if (veilSafetyTimeout) clearTimeout(veilSafetyTimeout);
      if (transitionVeil) transitionVeil.classList.remove('active');
    }

    let isAudioUnlocked = false;
    function unlockAudio() {
      if (isAudioUnlocked) return;
      isAudioUnlocked = true;
      if (ytPlayer && typeof ytPlayer.unMute === 'function') {
        try {
          ytPlayer.unMute();
          ytPlayer.setVolume(100);
        } catch (e) {}
      }
      if (deckVideo) {
        deckVideo.muted = false;
      }
    }

    // Elementos Minimalistas (Toast e Barra Inferior)
    const hudNowplayingToast = document.getElementById('hud-nowplaying-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastLabel = document.getElementById('toast-label');
    const barTimeInfo = document.getElementById('bar-time-info');
    const hudClockBottom = document.getElementById('hud-clock-bottom');
    let toastTimeout = null;

    // =========================================
    // MODO TELA CHEIA E CONTROLE DE KIOSK TV
    // =========================================
    function enterFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }

    // Tenta entrar em tela cheia automaticamente ao carregar
    window.addEventListener('load', () => {
      enterFullscreen();
    });

    // Em navegadores modernos com bloqueio de fullscreen ou áudio automático,
    // o primeiro clique, toque na tela ou tecla do controle remoto ativa tela cheia e libera som
    window.addEventListener('click', () => {
      unlockAudio();
      enterFullscreen();
    });
    window.addEventListener('touchstart', () => {
      unlockAudio();
      enterFullscreen();
    });
    window.addEventListener('keydown', (e) => {
      unlockAudio();
      handleTvRemoteKey(e);
    });

    // Oculta o cursor do mouse e a barra do simulador após 2.5s de inatividade
    let cursorTimer = null;
    document.addEventListener('mousemove', () => {
      document.body.classList.remove('cursor-hidden');
      clearTimeout(cursorTimer);
      cursorTimer = setTimeout(() => {
        document.body.classList.add('cursor-hidden');
      }, 2500);
    });

    // Inicialização do WebSocket (Socket.io)
    const socket = io(window.location.origin);

    socket.on('connect', () => {
      const statusEl = document.getElementById('socket-status');
      if (statusEl) {
        statusEl.innerHTML = '● WebSocket Conectado';
        statusEl.style.color = '#34d399';
      }
      if (currentDeviceId && currentDeviceToken) {
        socket.emit('device:register', { deviceId: currentDeviceId, token: currentDeviceToken });
        startHeartbeatLoop();
      }
    });

    socket.on('disconnect', () => {
      const statusEl = document.getElementById('socket-status');
      if (statusEl) {
        statusEl.innerHTML = '○ Desconectado';
        statusEl.style.color = '#ef4444';
      }
    });

    // Evento disparado pelo Backend quando a TV é pareada pelo painel
    socket.on('device:paired', (data) => {
      console.log('Evento device:paired recebido!', data);
      currentDeviceId = data.deviceId;
      currentDeviceToken = data.deviceToken;
      localStorage.setItem('tv_device_id', currentDeviceId);
      localStorage.setItem('tv_device_token', currentDeviceToken);
      socket.emit('device:register', { deviceId: currentDeviceId, token: currentDeviceToken });
      userExplicitlyPaused = false;
      isPaused = false;
      unlockAudio();
      startHeartbeatLoop();
      transitionToPlayback();
    });

    // Evento disparado pelo Backend quando a playlist é atualizada remotamente
    socket.on('player:sync', (data) => {
      console.log('Evento player:sync recebido do CMS:', data);
      handleRemoteSync(data);
    });

    // Evento para capturar screenshot em tempo real solicitado pelo painel
    socket.on('player:capture_screenshot', () => {
      console.log('Comando de screenshot recebido do painel!');
      captureScreenAndSend();
    });

    // Comandos remotos recebidos do CMS (reload, unpair, etc.)
    socket.on('player:command', (data) => {
      console.log('Comando remoto recebido do CMS:', data);
      if (data?.command === 'player:reload') {
        location.reload();
      } else if (data?.command === 'player:unpair') {
        userExplicitlyPaused = true;
        isPaused = true;
        if (playbackInterval) clearInterval(playbackInterval);
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        currentQueue = [];
        if (deckVideo) { deckVideo.pause(); deckVideo.removeAttribute('src'); }
        if (ytPlayer) { try { ytPlayer.mute(); ytPlayer.stopVideo(); } catch(e){} }
        localStorage.removeItem('tv_device_id');
        localStorage.removeItem('tv_device_token');
        currentDeviceId = null;
        currentDeviceToken = null;
        location.reload();
      }
    });

    // Relógio em tempo real
    function updateClock() {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const hoursMins = timeStr.slice(0, 5);
      const pairingClock = document.getElementById('pairing-clock');
      const hudClock = document.getElementById('hud-clock');
      if (pairingClock) pairingClock.innerText = timeStr;
      if (hudClock) hudClock.innerText = hoursMins;
      if (hudClockBottom) hudClockBottom.innerText = hoursMins;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Heartbeat contínuo de status para manter a TV sempre com status "Ao Vivo" no CMS
    let heartbeatTimer = null;
    function startHeartbeatLoop() {
      if (heartbeatTimer) clearInterval(heartbeatTimer);

      async function sendHeartbeat() {
        if (!currentDeviceId) return;

        const currentItem = currentQueue && currentQueue.length > 0
          ? currentQueue[currentItemIndex % currentQueue.length]
          : null;
        const currentAssetId = currentItem?.asset?.id || null;

        // 1. Notifica via WebSocket para manter presença em tempo real
        if (socket && socket.connected) {
          socket.emit('device:register', { deviceId: currentDeviceId, token: currentDeviceToken });
        }

        // 2. Envia ping HTTP para atualizar lastPingAt no banco
        try {
          await fetch('/api/v1/devices/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: currentDeviceId,
              status: isPaused ? 'PAUSED' : 'ONLINE',
              currentAssetId: currentAssetId
            })
          });
        } catch (e) {}
      }

      sendHeartbeat();
      heartbeatTimer = setInterval(sendHeartbeat, 15000);
    }

    // 1. Ciclo de Pareamento
    async function initPairing() {
      // Se não estiver pareado, garante que nenhum áudio ou vídeo residual continue tocando
      if (!currentDeviceId || !currentDeviceToken) {
        userExplicitlyPaused = true;
        isPaused = true;
        if (playbackInterval) { clearInterval(playbackInterval); playbackInterval = null; }
        if (deckVideo) { deckVideo.pause(); deckVideo.removeAttribute('src'); deckVideo.load(); deckVideo.classList.remove('deck-active'); }
        if (ytPlayer) {
          try {
            if (typeof ytPlayer.mute === 'function') ytPlayer.mute();
            if (typeof ytPlayer.stopVideo === 'function') ytPlayer.stopVideo();
            if (typeof ytPlayer.clearVideo === 'function') ytPlayer.clearVideo();
          } catch(e) {}
        }
        if (deckYouTube) deckYouTube.classList.remove('deck-active');
        currentQueue = [];
        activePlaylist = null;
        playlistItems = [];
      }

      if (currentDeviceId && currentDeviceToken) {
        // Dispositivo já pareado anteriormente, carrega programação direto
        startHeartbeatLoop();
        transitionToPlayback();
        return;
      }

      pairingScreen.classList.remove('hidden');
      try {
        const res = await fetch('/api/v1/devices/request-pairing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            osName: 'Android TV (Smart Player)',
            osVersion: '12.0',
            appVersion: '1.0.0',
            resolution: '1920x1080'
          })
        });
        const data = await res.json();
        currentDeviceId = data.deviceId;
        displayPairingCode.innerText = data.formattedCode;

        // Entra na sala do WebSocket para esperar o evento device:paired e comandos remotos
        socket.emit('pairing:join', { pairingCode: data.pairingCode });
        socket.emit('device:register', { deviceId: currentDeviceId });

        // Contador regressivo de 10 min
        let timeLeft = data.expiresInSeconds || 600;
        const timer = setInterval(() => {
          timeLeft--;
          if (timeLeft <= 0) {
            clearInterval(timer);
            initPairing(); // Renova o código
            return;
          }
          const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
          const secs = (timeLeft % 60).toString().padStart(2, '0');
          countdownTimer.innerText = mins + ':' + secs;
        }, 1000);
      } catch (err) {
        displayPairingCode.innerText = 'ERRO REDE';
        console.error('Falha ao solicitar pareamento:', err);
      }

      // Atualiza URL do painel e IP na tela da TV com base no host de rede
      try {
        const host = window.location.hostname;
        const adminUrlEl = document.getElementById('admin-panel-url-display');
        const deviceIpEl = document.getElementById('device-ip-display');
        if (adminUrlEl) {
          if (!host || host === 'localhost' || host === '127.0.0.1' || host.includes('giroestudo.com.br')) {
            adminUrlEl.textContent = 'aoply.giroestudo.com.br';
          } else {
            adminUrlEl.textContent = 'http://' + host + ':3000';
          }
        }
        if (deviceIpEl && host && host !== 'localhost' && host !== '127.0.0.1') {
          deviceIpEl.textContent = host;
        }
      } catch (e) {}
    }

    // Transição suave da tela de código para a reprodução
    function transitionToPlayback() {
      userExplicitlyPaused = false;
      isPaused = false;
      pairingScreen.classList.add('hidden');
      loadManifestAndStart();
    }

    // Controle do Estado de Standby / Playlist Vazia
    function showEmptyState(titleText) {
      if (emptyPlaylistScreen) {
        emptyPlaylistScreen.classList.remove('hidden');
      }
      if (hudNowplayingToast) {
        hudNowplayingToast.classList.remove('visible');
      }
      if (hudBadgeType) {
        hudBadgeType.style.display = 'none';
      }
      if (hudMediaTitle) hudMediaTitle.innerText = (titleText || 'Playlist sem música') + ' • Aguardando programação';
      if (barTimeInfo) barTimeInfo.innerText = '--:-- / --:--';
      if (hudProgressFill) hudProgressFill.style.width = '0%';
    }

    function hideEmptyState() {
      if (emptyPlaylistScreen) {
        emptyPlaylistScreen.classList.add('hidden');
      }
    }

    function stopPlaybackAndShowEmptyState(reason) {
      console.log('Interrompendo reprodução e exibindo tela de standby:', reason);

      // 1. Limpa contadores e temporizadores de reprodução
      if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
      }
      if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
      }

      // 2. Interrompe e limpa Deck A (Vídeo Local)
      if (deckVideo) {
        deckVideo.pause();
        deckVideo.removeAttribute('src');
        deckVideo.load();
        deckVideo.classList.remove('deck-active');
      }

      // 3. Interrompe Deck B (YouTube)
      if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
        try {
          ytPlayer.stopVideo();
        } catch (e) {}
      }
      if (deckYouTube) {
        deckYouTube.classList.remove('deck-active');
      }

      // 4. Limpa a fila ativa e estados de pausa
      currentQueue = [];
      currentItemIndex = 0;
      isPaused = false;
      elapsedSeconds = 0;
      hidePlaybackOsd();
      updatePlayPauseButton();

      // 5. Exibe a tela de Playlist sem música
      showEmptyState(reason || 'Playlist sem música');
    }

    // 2. Download do Manifesto e Inicialização da Fila
    async function loadManifestAndStart() {
      try {
        const res = await fetch('/api/v1/devices/' + currentDeviceId + '/manifest');
        if (!res.ok) {
          console.warn('Dispositivo não encontrado ou excluído do servidor. Retornando para tela de pareamento.');
          localStorage.removeItem('tv_device_id');
          localStorage.removeItem('tv_device_token');
          currentDeviceId = null;
          currentDeviceToken = null;
          if (deckVideo) { deckVideo.pause(); deckVideo.removeAttribute('src'); }
          if (ytPlayer && typeof ytPlayer.stopVideo === 'function') { try { ytPlayer.stopVideo(); } catch(e){} }
          hideEmptyState();
          initPairing();
          return;
        }
        const data = await res.json();
        
        // Se a playlist não existir ou a lista de itens for vazia
        if (!data.playlist || !data.playlist.items || data.playlist.items.length === 0) {
          stopPlaybackAndShowEmptyState('Playlist sem música');
          return;
        }

        activePlaylist = data.playlist;
        playlistItems = data.playlist.items;

        const musics = playlistItems.filter(i => i.category !== 'COMMERCIAL_AD');
        
        // Se todas as músicas foram excluídas da playlist em tempo real
        if (musics.length === 0) {
          stopPlaybackAndShowEmptyState('Playlist sem música');
          return;
        }

        buildPlaybackQueue();

        if (currentQueue.length === 0) {
          stopPlaybackAndShowEmptyState('Playlist sem música');
          return;
        }

        // Playlist possui músicas: oculta tela de standby e inicia a reprodução
        hideEmptyState();
        playCurrentItem();
      } catch (err) {
        console.error('Erro ao carregar manifesto:', err);
      }
    }

    // 2.1 Sincronização Inteligente em Segundo Plano (Zero Interrupção)
    async function handleRemoteSync(data) {
      if (!currentDeviceId) return;

      const incomingPlaylistId = data && data.playlistId;

      // Se a atualização foi disparada por uma playlist diferente da que está tocando nesta TV:
      // Ignora completamente e mantém a reprodução atual fluindo sem nenhum impacto!
      if (incomingPlaylistId && activePlaylist && activePlaylist.id && incomingPlaylistId !== activePlaylist.id) {
        console.log('[Sync] Atualizacao ignorada: refere-se a playlist [' + incomingPlaylistId + '], mas a TV esta reproduzindo [' + activePlaylist.id + ' - ' + (activePlaylist.name || '') + ']. A musica continua sem interrupcao.');
        return;
      }

      // Se a TV estiver na tela de Standby ("Playlist sem música") ou sem fila ativa iniciada:
      const isStandby = emptyPlaylistScreen && !emptyPlaylistScreen.classList.contains('hidden');
      if (isStandby || !activePlaylist || !currentQueue || currentQueue.length === 0) {
        console.log('[Sync] Dispositivo em standby ou inicializando. Carregando manifesto e iniciando reprodução...');
        await loadManifestAndStart();
        return;
      }

      // Sincronização Seamless (A música continua tocando sem interrupção!)
      try {
        console.log('[Sync] Sincronizando playlist em segundo plano...');
        const res = await fetch('/api/v1/devices/' + currentDeviceId + '/manifest');
        if (!res.ok) {
          console.warn('[Sync] Falha ao consultar manifesto atualizado:', res.status);
          return;
        }

        const manifestData = await res.json();

        // Se a playlist ativa foi excluída ou não contém itens
        if (!manifestData.playlist || !manifestData.playlist.items || manifestData.playlist.items.length === 0) {
          console.log('[Sync] Playlist ativa esvaziada no CMS. Entrando em modo standby.');
          stopPlaybackAndShowEmptyState('Playlist sem música');
          return;
        }

        const musics = manifestData.playlist.items.filter(i => i.category !== 'COMMERCIAL_AD');
        if (musics.length === 0) {
          console.log('[Sync] Todas as músicas foram removidas da playlist. Entrando em modo standby.');
          stopPlaybackAndShowEmptyState('Playlist sem música');
          return;
        }

        // Identifica a mídia que está tocando exatamente neste momento
        const currentItem = (currentQueue && currentQueue.length > 0)
          ? currentQueue[currentItemIndex % currentQueue.length]
          : null;
        const currentAssetId = currentItem?.asset?.id;
        const currentItemId = currentItem?.id;
        const currentExternalId = currentItem?.asset?.externalId;

        // Atualiza a playlist ativa e lista de itens em memória
        activePlaylist = manifestData.playlist;
        playlistItems = manifestData.playlist.items;

        // Reconstrói a fila com a nova lista/ordem
        buildPlaybackQueue();

        if (currentQueue.length === 0) {
          stopPlaybackAndShowEmptyState('Playlist sem música');
          return;
        }

        // Verifica se a mídia que estava tocando ainda existe na nova fila
        let foundIndex = currentQueue.findIndex(item =>
          (currentItemId && item.id === currentItemId) ||
          (currentAssetId && item.asset && item.asset.id === currentAssetId) ||
          (currentExternalId && item.asset && item.asset.externalId === currentExternalId)
        );

        if (foundIndex !== -1) {
          // A mídia atual continua na playlist: atualiza o índice da fila SEM REINICIAR a reprodução!
          currentItemIndex = foundIndex;
          console.log('[Sync] Fila atualizada em segundo plano com sucesso! A musica atual continua tocando no indice ' + currentItemIndex + ' sem interrupcao.');

          // Atualiza dados na barra caso nome/duração tenham sido editados
          const updatedItem = currentQueue[foundIndex];
          if (updatedItem && updatedItem.asset) {
            if (hudMediaTitle) hudMediaTitle.innerText = updatedItem.asset.name;
            if (toastTitle) toastTitle.innerText = updatedItem.asset.name;
            itemTotalDuration = updatedItem.customDurationSeconds || updatedItem.asset.durationSeconds || itemTotalDuration;
          }
        } else {
          // A música que estava tocando foi explicitamente excluída no CMS
          console.log('[Sync] A mídia atual foi excluída da playlist no CMS. Avançando suavemente para a próxima...');
          currentItemIndex = Math.min(currentItemIndex, currentQueue.length - 1);
          playCurrentItem();
        }
      } catch (err) {
        console.error('[Sync] Erro na sincronização seamless:', err);
      }
    }

    // Algoritmo Real de Intercalação (Músicas x Rotação de Anúncios)
    function buildPlaybackQueue() {
      const musics = playlistItems.filter(i => i.category !== 'COMMERCIAL_AD');
      const ads = playlistItems.filter(i => i.category === 'COMMERCIAL_AD');

      // Se não houver músicas, a fila fica vazia (standby: Playlist sem música)
      if (musics.length === 0) {
        currentQueue = [];
        return;
      }

      // Se estiver em modo offline, toca APENAS os anúncios/vídeos locais em cache
      if (isOfflineMode) {
        currentQueue = ads.length > 0 ? ads : playlistItems.filter(i => i.asset.type === 'VIDEO');
        return;
      }

      // Se não houver anúncios configurados, toca apenas a fila de músicas
      if (ads.length === 0) {
        currentQueue = [...musics];
        return;
      }

      // Frequência configurada na playlist (ex: a cada 3 músicas, injetar 1 anúncio)
      let freq = 3;
      if (activePlaylist && activePlaylist.interleaveRules) {
        let rules = activePlaylist.interleaveRules;
        if (typeof rules === 'string') {
          try { rules = JSON.parse(rules); } catch (e) {}
        }
        freq = rules?.youtubeFrequency || 3;
      }

      const interleaved = [];
      let adIndex = 0;

      for (let i = 0; i < musics.length; i++) {
        interleaved.push(musics[i]);

        // A cada 'freq' músicas, injeta o próximo anúncio da rotação
        if ((i + 1) % freq === 0) {
          interleaved.push(ads[adIndex % ads.length]);
          adIndex++;
        }
      }

      currentQueue = interleaved;
      console.log('Fila de reprodução intercalada construída com sucesso:', currentQueue.length, 'itens.');
    }

    // Função para desligar legendas / close captions automaticamente
    function disableCaptions() {
      try {
        if (ytPlayer) {
          if (typeof ytPlayer.unloadModule === 'function') {
            ytPlayer.unloadModule('captions');
            ytPlayer.unloadModule('cc');
          }
          if (typeof ytPlayer.setOption === 'function') {
            ytPlayer.setOption('captions', 'track', {});
            ytPlayer.setOption('cc', 'track', {});
            ytPlayer.setOption('captions', 'reload', 0);
            ytPlayer.setOption('captions', 'fontSize', 0);
          }
        }
      } catch (e) {}
    }

    let hasEnforcedQualityForCurrentVideo = false;
    function enforceMaxQuality() {
      try {
        if (!ytPlayer || typeof ytPlayer.getPlaybackQuality !== 'function') return;
        const current = ytPlayer.getPlaybackQuality();
        if (current === 'hd1080') return; // Já está na resolução Full HD perfeita, não reinicia o buffer

        if (typeof ytPlayer.getAvailableQualityLevels === 'function') {
          const levels = ytPlayer.getAvailableQualityLevels();
          if (Array.isArray(levels) && levels.length > 0) {
            // Prioriza hd1080 (Full HD), se não disponível tenta hd720 ou o maior disponível (evita 4k/highres para não sobrecarregar GPU da TV)
            const target = levels.includes('hd1080') ? 'hd1080' : (levels.includes('hd720') ? 'hd720' : (levels.find(l => l !== 'highres') || levels[0]));
            if (current && current !== 'unknown' && current !== target && typeof ytPlayer.setPlaybackQuality === 'function') {
              console.log('Ajustando qualidade YouTube para:', target, '(anterior:', current, ')');
              ytPlayer.setPlaybackQuality(target);
            }
          }
        }
      } catch (e) {
        console.warn('Erro ao ajustar qualidade do YouTube:', e);
      }
    }

    // Inicialização do YouTube IFrame API
    window.onYouTubeIframeAPIReady = function() {
      isYouTubeApiReady = true;
      ytPlayer = new YT.Player('yt-player-target', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          cc_lang_pref: 'none',
          playsinline: 1,
          enablejsapi: 1,
          vq: 'hd1080',
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            console.log('YouTube Player IFrame pronto!');
            disableCaptions();
            try {
              ytPlayer.unMute();
              ytPlayer.setVolume(100);
            } catch (e) {}
          },
          onStateChange: (event) => {
            console.log('YouTube State Change:', event.data);

            // Se a tela de pareamento estiver visível ou o aparelho não estiver pareado, força silêncio e parada imediata
            const isPairingVisible = pairingScreen && !pairingScreen.classList.contains('hidden');
            if (isPairingVisible || !currentDeviceId) {
              try {
                if (typeof ytPlayer.mute === 'function') ytPlayer.mute();
                if (typeof ytPlayer.stopVideo === 'function') ytPlayer.stopVideo();
              } catch(e) {}
              return;
            }

            if (event.data === YT.PlayerState.PLAYING) {
              disableCaptions();
              hideTransitionVeil(); // Transição suave para o novo vídeo, eliminando qualquer frame congelado anterior
              if (!hasEnforcedQualityForCurrentVideo) {
                hasEnforcedQualityForCurrentVideo = true;
                setTimeout(() => {
                  enforceMaxQuality();
                }, 1200);
              }
              if (!userExplicitlyPaused) {
                isPaused = false;
                updatePlayPauseButton();
                try {
                  if (ytPlayer.isMuted()) {
                    ytPlayer.unMute();
                    ytPlayer.setVolume(100);
                  }
                } catch (e) {}
              }
            } else if (event.data === YT.PlayerState.PAUSED) {
              // Se foi uma pausa automática (ex: política de autoplay do navegador) e o usuário não pausou intencionalmente:
              if (!userExplicitlyPaused) {
                console.warn('Pausa automática do YouTube detectada (Autoplay Policy). Retomando reprodução...');
                try {
                  ytPlayer.playVideo();
                } catch (e) {
                  try {
                    ytPlayer.mute();
                    ytPlayer.playVideo();
                  } catch (err) {}
                }
              } else {
                isPaused = true;
                updatePlayPauseButton();
              }
            } else if (event.data === YT.PlayerState.CUED) {
              // Vídeo pronto: dá play imediatamente se não pausado pelo usuário
              if (!userExplicitlyPaused && typeof ytPlayer.playVideo === 'function') {
                try {
                  ytPlayer.playVideo();
                } catch (e) {}
              }
            } else if (event.data === YT.PlayerState.ENDED) {
              if (!userExplicitlyPaused) {
                skipToNext();
              }
            }
          },
          onError: (event) => {
            console.warn('YouTube Error Code:', event.data, '- Saltando para a próxima mídia!');
            skipToNext();
          }
        }
      });
    };

    // Função de Captura de Screenshot em Tempo Real
    function captureScreenAndSend() {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      const currentItem = currentQueue && currentQueue.length > 0
        ? currentQueue[currentItemIndex % currentQueue.length]
        : null;
      const currentAsset = currentItem ? currentItem.asset : null;

      const finishAndSend = () => {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        socket.emit('device:screenshot_captured', {
          deviceId: currentDeviceId,
          screenshotDataUrl: dataUrl,
          assetName: currentAsset ? currentAsset.name : 'Tela de Pareamento'
        });
        console.log('Screenshot transmitido com sucesso!');
      };

      // Se a tela ainda estiver em modo de pareamento
      if (pairingScreen && !pairingScreen.classList.contains('hidden')) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 1280, 720);

        // Gradiente de destaque
        const grad = ctx.createLinearGradient(0, 0, 1280, 720);
        grad.addColorStop(0, '#260208');
        grad.addColorStop(1, '#090d16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1280, 720);

        ctx.fillStyle = '#FF0027';
        ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('AGUARDANDO ATIVAÇÃO NO CMS', 640, 260);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 76px -apple-system, "Plus Jakarta Sans", "Inter", sans-serif';
        ctx.fillText(displayPairingCode.innerText || '------', 640, 370);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Insira este código de 6 dígitos no painel administrativo', 640, 430);

        ctx.textAlign = 'left';
        finishAndSend();
        return;
      }

      // Se a tela estiver em modo de playlist sem música (Standby)
      if (emptyPlaylistScreen && !emptyPlaylistScreen.classList.contains('hidden')) {
        ctx.fillStyle = '#07080c';
        ctx.fillRect(0, 0, 1280, 720);

        // Gradiente radial ambiente no centro
        const rad = ctx.createRadialGradient(640, 320, 20, 640, 320, 420);
        rad.addColorStop(0, 'rgba(255, 0, 39, 0.22)');
        rad.addColorStop(1, 'rgba(7, 8, 12, 0)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, 1280, 720);

        // Ícone ampliado de nota musical cortada (vermelho Aoply)
        ctx.strokeStyle = '#FF0027';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Haste e travessão
        ctx.moveTo(630, 245);
        ctx.lineTo(630, 205);
        ctx.lineTo(655, 200);
        ctx.lineTo(655, 240);
        ctx.stroke();
        // Círculos das notas
        ctx.beginPath();
        ctx.arc(622, 245, 8, 0, Math.PI * 2);
        ctx.arc(647, 240, 8, 0, Math.PI * 2);
        ctx.stroke();
        // Traço diagonal cortando
        ctx.beginPath();
        ctx.moveTo(612, 200);
        ctx.lineTo(668, 255);
        ctx.stroke();

        // Título
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Playlist sem música', 640, 315);

        // Descrição
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 16px "Inter", sans-serif';
        ctx.fillText('Esta playlist não possui músicas cadastradas no momento.', 640, 355);
        ctx.fillText('Adicione músicas no painel administrativo para iniciar a programação.', 640, 380);

        // Ícone de duas setas rodando (Sincronização em tempo real)
        ctx.strokeStyle = '#FF0027';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(520, 428, 8, 0.2 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(520, 428, 8, 1.2 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 14px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Aguardando programação em tempo real', 536, 433);

        // Relógio flutuante topo direito
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 24px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(new Date().toLocaleTimeString('pt-BR').slice(0, 5), 1248, 50);

        // Rodapé
        drawHudOnCanvas(ctx, { name: 'Playlist sem música • Aguardando programação' });

        ctx.textAlign = 'left';
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        socket.emit('device:screenshot_captured', {
          deviceId: currentDeviceId,
          screenshotDataUrl: dataUrl,
          assetName: 'Playlist sem música'
        });
        console.log('Screenshot transmitido com sucesso (modo Playlist sem música)!');
        return;
      }

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 1280, 720);

      if (deckVideo.classList.contains('deck-active') && deckVideo.readyState >= 2) {
        try {
          ctx.drawImage(deckVideo, 0, 0, 1280, 720);
          drawHudOnCanvas(ctx, currentAsset);
          finishAndSend();
        } catch(e) {
          drawFallbackCanvas(ctx, currentAsset, () => {
            drawHudOnCanvas(ctx, currentAsset);
            finishAndSend();
          });
        }
      } else {
        drawFallbackCanvas(ctx, currentAsset, () => {
          drawHudOnCanvas(ctx, currentAsset);
          finishAndSend();
        });
      }
    }

    function drawFallbackCanvas(ctx, currentAsset, onComplete) {
      if (currentAsset && currentAsset.thumbnailUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            ctx.drawImage(img, 0, 0, 1280, 720);
          } catch(e) {
            ctx.fillStyle = '#18181b';
            ctx.fillRect(0, 0, 1280, 720);
          }
          if (onComplete) onComplete();
        };
        img.onerror = () => {
          ctx.fillStyle = '#18181b';
          ctx.fillRect(0, 0, 1280, 720);
          if (onComplete) onComplete();
        };
        img.src = currentAsset.thumbnailUrl;
      } else {
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, 1280, 720);
        if (onComplete) onComplete();
      }
    }

    function drawHudOnCanvas(ctx, currentAsset) {
      // Barra minimalista no rodapé (38px de altura em 720p)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 682, 1280, 38);

      // Linha de acento sutil
      ctx.fillStyle = '#FF0027';
      ctx.fillRect(0, 680, 1280, 2);

      // Indicador ao vivo
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(28, 701, 5, 0, Math.PI * 2);
      ctx.fill();

      // Nome da Música / Mídia
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      const title = currentAsset ? currentAsset.name : 'Digital Signage TV';
      ctx.fillText(title, 42, 706);

      // Relógio no canto direito
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '500 13px -apple-system, "Inter", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(new Date().toLocaleTimeString('pt-BR').slice(0, 5), 1250, 706);
      ctx.textAlign = 'left';
    }

    // 3. Execução da Mídia Atual com Transição Seamless
    function playCurrentItem() {
      if (!currentQueue || currentQueue.length === 0) {
        stopPlaybackAndShowEmptyState('Playlist sem música');
        return;
      }

      // Ativa imediatamente a cortina preta de transição para cobrir frames congelados do vídeo anterior
      showTransitionVeil();

      isPaused = false;
      elapsedSeconds = 0;
      updatePlayPauseButton();
      hidePlaybackOsd();

      const item = currentQueue[currentItemIndex % currentQueue.length];
      const asset = item.asset;
      itemTotalDuration = item.customDurationSeconds || asset.durationSeconds || 30;
      itemDurationRemaining = itemTotalDuration;

      // Sanitiza URLs de CDN (substitui localhost caso venha de ambiente de desenvolvimento ou seed)
      let mediaUrl = asset.cdnUrl || '';
      if (mediaUrl.includes('localhost:3001') || mediaUrl.includes('127.0.0.1:3001')) {
        mediaUrl = mediaUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1):3001/, window.location.origin);
      }

      // Atualiza o nome da música / mídia no rodapé e no toast
      hudMediaTitle.innerText = asset.name;
      if (toastTitle) toastTitle.innerText = asset.name;
      hudProgressFill.style.width = '0%';

      // Dispara o toast minimalista que surge suavemente e recolhe após 6s
      if (hudNowplayingToast) {
        hudNowplayingToast.classList.remove('paused');
        const toastCdDisc = document.getElementById('toast-cd-disc');
        if (toastCdDisc) toastCdDisc.classList.remove('paused');

        hudNowplayingToast.classList.add('visible');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
          hudNowplayingToast.classList.remove('visible');
        }, 6000);
      }

      const isAd = item.category === 'COMMERCIAL_AD';

      // Configuração visual limpa: oculta badge para músicas e mostra apenas em comerciais
      if (hudBadgeType) {
        if (isAd) {
          hudBadgeType.style.display = 'inline-flex';
          hudBadgeText.innerText = 'Comercial';
          hudBadgeDot.style.background = '#ef4444';
          hudBadgeType.className = 'hud-badge hud-ad-pill';
        } else {
          hudBadgeType.style.display = 'none';
        }
      }
      if (toastLabel) toastLabel.innerText = isAd ? 'COMERCIAL' : 'TOCANDO AGORA';

      if (asset.type === 'YOUTUBE' && !isOfflineMode) {
        // Toca no Deck B (YouTube)
        if (deckImage) deckImage.style.display = 'none';
        deckVideo.classList.remove('deck-active');
        deckVideo.pause();
        deckVideo.removeAttribute('src'); // Limpa a GPU do vídeo/comercial anterior
        deckVideo.load();

        if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
          userExplicitlyPaused = false;
          isPaused = false;
          updatePlayPauseButton();

          try {
            ytPlayer.unMute();
            ytPlayer.setVolume(100);
          } catch (e) {}

          hasEnforcedQualityForCurrentVideo = false;
          ytPlayer.loadVideoById({
            videoId: asset.externalId,
            suggestedQuality: 'hd1080'
          });

          disableCaptions();
          deckYouTube.classList.add('deck-active');
        } else {
          setTimeout(playCurrentItem, 300);
          return;
        }

      } else if (asset.type === 'IMAGE') {
        // Toca no Deck C (Imagem Estática / Anúncio Gráfico)
        deckYouTube.classList.remove('deck-active');
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
          try { ytPlayer.stopVideo(); } catch(e) {}
        }
        deckVideo.classList.remove('deck-active');
        deckVideo.pause();
        deckVideo.removeAttribute('src');
        deckVideo.load();

        if (deckImage) {
          deckImage.style.display = 'block';
          deckImage.src = mediaUrl;
          deckImage.onload = () => {
            hideTransitionVeil();
          };
          deckImage.onerror = () => {
            console.warn('Erro ao carregar imagem de anúncio, pulando...');
            hideTransitionVeil();
            skipToNext();
          };
        } else {
          hideTransitionVeil();
        }

      } else {
        // Toca no Deck A (Vídeo Local MP4 / Comercial em Vídeo)
        if (deckImage) deckImage.style.display = 'none';
        deckYouTube.classList.remove('deck-active');
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
          try { ytPlayer.stopVideo(); } catch(e) {}
        }

        const fallbackUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        const targetSrc = mediaUrl || fallbackUrl;

        deckVideo.src = targetSrc;
        deckVideo.currentTime = 0;
        deckVideo.muted = false;

        deckVideo.onplaying = () => {
          hideTransitionVeil();
        };

        deckVideo.onerror = (e) => {
          console.warn('Erro ao reproduzir vídeo local/anúncio:', targetSrc, e);
          hideTransitionVeil();
          setTimeout(skipToNext, 1200);
        };

        deckVideo.play().catch(e => {
          console.warn('Autoplay com áudio aguardando interação, iniciando mutado:', e);
          deckVideo.muted = true;
          deckVideo.play().catch(err => {
            console.error('Falha crítica ao dar play no vídeo local:', err);
            hideTransitionVeil();
            setTimeout(skipToNext, 1200);
          });
        });
        deckVideo.classList.add('deck-active');

        deckVideo.onended = () => {
          skipToNext();
        };
      }

      // Envia telemetria (Proof-of-Play)
      sendProofOfPlay(asset.id, activePlaylist ? activePlaylist.id : null);

      // Inicia barra de progresso e contador de tempo com suporte a pausa e tempo real
      if (playbackInterval) clearInterval(playbackInterval);
      const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return m + ':' + s;
      };

      playbackInterval = setInterval(() => {
        if (isPaused) return;

        if (deckVideo && deckVideo.classList.contains('deck-active') && !deckVideo.paused) {
          elapsedSeconds = deckVideo.currentTime;
          if (deckVideo.duration && !isNaN(deckVideo.duration) && deckVideo.duration > 0) {
            itemTotalDuration = deckVideo.duration;
          }
        } else if (ytPlayer && deckYouTube.classList.contains('deck-active') && typeof ytPlayer.getCurrentTime === 'function') {
          try {
            const ytTime = ytPlayer.getCurrentTime();
            if (typeof ytTime === 'number' && !isNaN(ytTime) && ytTime > 0) {
              elapsedSeconds = ytTime;
              const ytDur = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
              if (ytDur && ytDur > 0) {
                itemTotalDuration = ytDur;
              }
            } else {
              elapsedSeconds += 0.5;
            }
          } catch (e) {
            elapsedSeconds += 0.5;
          }
        } else {
          elapsedSeconds += 0.5;
        }

        const pct = Math.min((elapsedSeconds / itemTotalDuration) * 100, 100);
        hudProgressFill.style.width = pct + '%';
        if (barTimeInfo) {
          barTimeInfo.innerText = formatTime(elapsedSeconds) + ' / ' + formatTime(itemTotalDuration);
        }

        // Se for imagem ou anúncio com tempo fixo, avança quando atingir a duração definida
        if (asset.type === 'IMAGE' || (isAd && item.customDurationSeconds)) {
          if (elapsedSeconds >= itemTotalDuration) {
            clearInterval(playbackInterval);
            skipToNext();
          }
        }
      }, 500);
    }

    // Passar para a próxima mídia (Controle Remoto: Seta Direita / MediaNext / Avançar)
    function skipToNext() {
      if (playbackInterval) clearInterval(playbackInterval);
      if (!currentQueue || currentQueue.length === 0) {
        stopPlaybackAndShowEmptyState('Playlist sem música');
        return;
      }
      currentItemIndex++;
      userExplicitlyPaused = false;
      isPaused = false;
      showPlaybackOsd('PRÓXIMA', 'next', false);
      playCurrentItem();
    }

    // Retroceder / Voltar mídia (Controle Remoto: Seta Esquerda / MediaPrev / Retroceder)
    function skipToPrevious() {
      if (playbackInterval) clearInterval(playbackInterval);
      if (!currentQueue || currentQueue.length === 0) {
        stopPlaybackAndShowEmptyState('Playlist sem música');
        return;
      }

      // Se já tocou mais de 4 segundos, volta para o início da música atual
      if (elapsedSeconds > 4) {
        elapsedSeconds = 0;
        userExplicitlyPaused = false;
        isPaused = false;
        if (deckVideo && deckVideo.classList.contains('deck-active')) {
          deckVideo.currentTime = 0;
          deckVideo.play().catch(() => {});
        }
        if (ytPlayer && deckYouTube.classList.contains('deck-active') && typeof ytPlayer.seekTo === 'function') {
          try {
            ytPlayer.seekTo(0, true);
            if (typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo();
          } catch (e) {}
        }
        hudProgressFill.style.width = '0%';
        showPlaybackOsd('REINICIAR', 'rewind', false);
        return;
      }

      // Se está no início (<= 4s), retrocede para a faixa anterior
      currentItemIndex = (currentItemIndex - 1 + currentQueue.length) % currentQueue.length;
      userExplicitlyPaused = false;
      isPaused = false;
      showPlaybackOsd('ANTERIOR', 'previous', false);
      playCurrentItem();
    }

    // Pausar / Reproduzir (Controle Remoto: Espaço / OK / PlayPause / P / K)
    function togglePlayPause() {
      if (!currentQueue || currentQueue.length === 0) return;
      if (isPaused) {
        resumePlayback();
      } else {
        pausePlayback();
      }
    }

    function pausePlayback() {
      if (!currentQueue || currentQueue.length === 0) return;
      userExplicitlyPaused = true;
      isPaused = true;

      if (deckVideo && deckVideo.classList.contains('deck-active')) {
        deckVideo.pause();
      }
      if (ytPlayer && deckYouTube.classList.contains('deck-active') && typeof ytPlayer.pauseVideo === 'function') {
        try { ytPlayer.pauseVideo(); } catch (e) {}
      }

      showPlaybackOsd('PAUSADO', 'pause', true);
      updatePlayPauseButton();

      const toastCdDisc = document.getElementById('toast-cd-disc');
      if (toastCdDisc) toastCdDisc.classList.add('paused');
      const toastWrap = document.getElementById('hud-nowplaying-toast');
      if (toastWrap) toastWrap.classList.add('paused');
    }

    function resumePlayback() {
      if (!currentQueue || currentQueue.length === 0) return;
      userExplicitlyPaused = false;
      isPaused = false;

      unlockAudio();

      if (deckVideo && deckVideo.classList.contains('deck-active')) {
        deckVideo.play().catch(() => {});
      }
      if (ytPlayer && deckYouTube.classList.contains('deck-active') && typeof ytPlayer.playVideo === 'function') {
        try {
          ytPlayer.unMute();
          ytPlayer.setVolume(100);
          ytPlayer.playVideo();
        } catch (e) {}
      }

      showPlaybackOsd('REPRODUZINDO', 'play', false);
      updatePlayPauseButton();

      const toastCdDisc = document.getElementById('toast-cd-disc');
      if (toastCdDisc) toastCdDisc.classList.remove('paused');
      const toastWrap = document.getElementById('hud-nowplaying-toast');
      if (toastWrap) toastWrap.classList.remove('paused');
    }

    function updatePlayPauseButton() {
      const btn = document.getElementById('btn-play-pause');
      if (btn) {
        btn.innerText = isPaused ? 'Reproduzir' : 'Pausar';
      }
    }

    // Controle de Encaixe de Tela (Anti-Corte / Overscan)
    let currentFitMode = localStorage.getItem('aoply_fit_mode') !== null
      ? parseInt(localStorage.getItem('aoply_fit_mode'), 10)
      : 1; // Padrão inteligente: 1 (96% Anti-Corte Seguro)

    function applyScreenFit(mode) {
      currentFitMode = mode % 4;
      localStorage.setItem('aoply_fit_mode', currentFitMode);
      const appRoot = document.getElementById('aoply-app-root') || document.getElementById('player-viewport');
      if (!appRoot) return;
      appRoot.classList.remove('overscan-safe-1', 'overscan-safe-2', 'overscan-safe-3');
      if (currentFitMode === 1) {
        appRoot.classList.add('overscan-safe-1');
        showPlaybackOsd('ENCAIXE TV: 96% (ANTI-CORTE RECOMENDADO)', 'fit', false);
      } else if (currentFitMode === 2) {
        appRoot.classList.add('overscan-safe-2');
        showPlaybackOsd('ENCAIXE TV: 92% (BORDA AMPLA)', 'fit', false);
      } else if (currentFitMode === 3) {
        appRoot.classList.add('overscan-safe-3');
        showPlaybackOsd('ENCAIXE TV: 88% (MÁXIMO RECUO)', 'fit', false);
      } else {
        showPlaybackOsd('ENCAIXE TV: 100% (TELA CHEIA 1:1)', 'fit', false);
      }
    }

    function cycleScreenFit() {
      applyScreenFit(currentFitMode + 1);
    }

    window.addEventListener('DOMContentLoaded', () => {
      applyScreenFit(currentFitMode);
    });

    // Ponte de Controle Remoto Nativo (Latência Zero para Android TV)
    window.AoplyPlayer = {
      togglePlayPause: function() { togglePlayPause(); },
      pause: function() { pausePlayback(); },
      resume: function() { resumePlayback(); },
      next: function() { skipToNext(); },
      previous: function() { skipToPrevious(); },
      cycleScreenFit: function() { cycleScreenFit(); }
    };
    window.togglePlayPause = togglePlayPause;
    window.pausePlayback = pausePlayback;
    window.resumePlayback = resumePlayback;
    window.skipToNext = skipToNext;
    window.skipToPrevious = skipToPrevious;

    // Controle do OSD (On-Screen Display)
    function showPlaybackOsd(text, type, keepVisible = false) {
      const osd = document.getElementById('remote-osd');
      const osdText = document.getElementById('osd-text');
      const osdIconWrap = document.getElementById('osd-icon-wrap');
      if (!osd || !osdText || !osdIconWrap) return;

      if (osdTimeout) clearTimeout(osdTimeout);

      osdText.innerText = text;

      let iconSvg = '';
      if (type === 'pause') {
        iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><rect x="6" y="4" width="4" height="16" rx="1.5"></rect><rect x="14" y="4" width="4" height="16" rx="1.5"></rect></svg>';
      } else if (type === 'play') {
        iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style="margin-left: 3px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
      } else if (type === 'next') {
        iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></line></svg>';
      } else if (type === 'previous' || type === 'rewind') {
        iconSvg = '<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></line></svg>';
      } else if (type === 'fit') {
        iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="28" height="28"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>';
      }

      osdIconWrap.innerHTML = iconSvg;
      osd.classList.remove('hidden');

      if (!keepVisible) {
        osdTimeout = setTimeout(() => {
          osd.classList.add('hidden');
        }, 1300);
      }
    }

    function hidePlaybackOsd() {
      const osd = document.getElementById('remote-osd');
      if (osd) osd.classList.add('hidden');
      if (osdTimeout) clearTimeout(osdTimeout);
    }

    // Gerenciamento de Foco e Controle Remoto para Telas Grandes (Android TV, Tizen, webOS, Fire TV)
    let tvToolbarHideTimeout = null;

    function showTvToolbar() {
      if (!document.body.classList.contains('dev-mode')) return;
      const tb = document.getElementById('simulator-toolbar');
      if (!tb) return;
      tb.classList.add('tv-active');
      document.body.classList.remove('cursor-hidden');
      if (tvToolbarHideTimeout) clearTimeout(tvToolbarHideTimeout);
      tvToolbarHideTimeout = setTimeout(() => {
        if (!document.activeElement || !tb.contains(document.activeElement)) {
          tb.classList.remove('tv-active');
        }
      }, 5000);
    }

    function hideTvToolbar() {
      const tb = document.getElementById('simulator-toolbar');
      if (tb) tb.classList.remove('tv-active');
      if (document.activeElement && tb && tb.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    }

    function getNavigableElements() {
      if (!document.body.classList.contains('dev-mode')) return [];
      const items = Array.from(document.querySelectorAll('.tv-navigable, button:not([disabled]), [tabindex="0"]'));
      return items.filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      });
    }

    function moveTvFocus(step) {
      if (!document.body.classList.contains('dev-mode')) return false;
      const items = getNavigableElements();
      if (!items.length) return false;
      showTvToolbar();

      const currentIndex = items.indexOf(document.activeElement);
      let nextIndex = 0;
      if (currentIndex === -1) {
        // Se nenhum botão estiver com foco, foca no botão play/pause ou no primeiro elemento
        const playBtn = document.getElementById('btn-play-pause');
        nextIndex = playBtn && items.indexOf(playBtn) !== -1 ? items.indexOf(playBtn) : 0;
      } else {
        nextIndex = currentIndex + step;
        if (nextIndex < 0) nextIndex = items.length - 1;
        if (nextIndex >= items.length) nextIndex = 0;
      }
      items[nextIndex].focus();
      return true;
    }

    // Processamento de Teclas do Controle Remoto da TV (D-Pad Setas, OK/Center, Mídia)
    function handleTvRemoteKey(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      enterFullscreen();

      const key = e.key;
      const code = e.code;
      const keyCode = e.keyCode || e.which;

      const tb = document.getElementById('simulator-toolbar');
      const isToolbarFocused = tb && document.activeElement && tb.contains(document.activeElement);

      // 1. D-Pad CIMA (KeyUp / 19 / 38 / 'O'): Alterna o Encaixe de Tela Anti-Corte TV
      if (key === 'ArrowUp' || code === 'ArrowUp' || keyCode === 38 || keyCode === 19 || key === 'o' || key === 'O') {
        e.preventDefault();
        cycleScreenFit();
        return;
      }

      // 2. D-Pad BAIXO (KeyDown / KEYCODE_DPAD_DOWN / 20 / 40): Oculta barra e foca vídeo limpo
      if (key === 'ArrowDown' || code === 'ArrowDown' || keyCode === 40 || keyCode === 20) {
        if (isToolbarFocused) {
          e.preventDefault();
          hideTvToolbar();
          return;
        }
      }

      // 3. D-Pad DIREITA (KeyRight / KEYCODE_DPAD_RIGHT / 22 / 39)
      if (key === 'ArrowRight' || code === 'ArrowRight' || keyCode === 39 || keyCode === 22) {
        if (isToolbarFocused) {
          e.preventDefault();
          moveTvFocus(1);
          return;
        } else {
          // Se em reprodução contínua sem barra focada, passa mídia
          e.preventDefault();
          skipToNext();
          return;
        }
      }

      // 4. D-Pad ESQUERDA (KeyLeft / KEYCODE_DPAD_LEFT / 21 / 37)
      if (key === 'ArrowLeft' || code === 'ArrowLeft' || keyCode === 37 || keyCode === 21) {
        if (isToolbarFocused) {
          e.preventDefault();
          moveTvFocus(-1);
          return;
        } else {
          // Se em reprodução contínua sem barra focada, volta mídia
          e.preventDefault();
          skipToPrevious();
          return;
        }
      }

      // 5. Botão OK / Center / Enter (KEYCODE_DPAD_CENTER / 23 / 13 / 66)
      const isEnterKey = (key === 'Enter' || code === 'Enter' || keyCode === 13 || keyCode === 23 || keyCode === 66);
      if (isEnterKey) {
        if (document.activeElement && document.activeElement !== document.body && typeof document.activeElement.click === 'function') {
          // Aciona o botão atualmente focado pelo controle remoto da Smart TV
          e.preventDefault();
          document.activeElement.click();
          showTvToolbar();
          return;
        } else if (pairingScreen && pairingScreen.classList.contains('hidden')) {
          e.preventDefault();
          togglePlayPause();
          return;
        }
      }

      // 6. Teclas Dedicadas de Pausa / Reprodução (MediaPlayPause, MediaPlay, MediaPause, Space, K, P)
      const isPlayPauseKey = 
        key === 'MediaPlayPause' ||
        key === 'MediaPlay' ||
        key === 'MediaPause' ||
        key === ' ' ||
        code === 'Space' ||
        key === 'k' || key === 'K' ||
        key === 'p' || key === 'P' ||
        keyCode === 179 || // MediaPlayPause
        keyCode === 415 || // MediaPlay (Tizen/webOS)
        keyCode === 19  || // MediaPause (Tizen/webOS)
        keyCode === 85  || // MediaPlayPause (Android TV)
        keyCode === 126 || // MediaPlay (Android TV)
        keyCode === 127 || // MediaPause (Android TV)
        keyCode === 10252; // Tizen MediaPlayPause

      if (isPlayPauseKey) {
        e.preventDefault();
        togglePlayPause();
        return;
      }

      // 7. Teclas Dedicadas de Avanço (MediaTrackNext, MediaFastForward, ChannelUp, N)
      const isNextKey = 
        key === 'MediaTrackNext' ||
        key === 'MediaFastForward' ||
        key === 'n' || key === 'N' ||
        key === 'ChannelUp' ||
        keyCode === 176 || // MediaTrackNext
        keyCode === 417 || // MediaFastForward
        keyCode === 425 || // MediaTrackNext (webOS)
        keyCode === 87  || // MediaTrackNext (Android TV)
        keyCode === 90  || // MediaFastForward (Android TV)
        keyCode === 10233; // Tizen MediaTrackNext

      if (isNextKey) {
        e.preventDefault();
        skipToNext();
        return;
      }

      // 8. Teclas Dedicadas de Retrocesso (MediaTrackPrevious, MediaRewind, ChannelDown, B)
      const isPrevKey = 
        key === 'MediaTrackPrevious' ||
        key === 'MediaRewind' ||
        key === 'b' || key === 'B' ||
        key === 'ChannelDown' ||
        keyCode === 177 || // MediaTrackPrevious
        keyCode === 412 || // MediaRewind
        keyCode === 424 || // MediaTrackPrevious (webOS)
        keyCode === 88  || // MediaTrackPrevious (Android TV)
        keyCode === 89  || // MediaRewind (Android TV)
        keyCode === 10232; // Tizen MediaTrackPrevious

      if (isPrevKey) {
        e.preventDefault();
        skipToPrevious();
        return;
      }

      // 9. Tela Cheia (F)
      if (key === 'f' || key === 'F' || keyCode === 70) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // 10. Botão Voltar / Esc / Back do Controle Remoto
      if (key === 'Escape' || keyCode === 27 || keyCode === 4 || keyCode === 10009) {
        if (isToolbarFocused) {
          e.preventDefault();
          hideTvToolbar();
          return;
        }
      }
    }

    // Simulação de Queda de Rede / Modo Offline
    function toggleOfflineMode() {
      isOfflineMode = !isOfflineMode;
      const btn = document.getElementById('btn-toggle-offline');
      if (isOfflineMode) {
        btn.innerText = 'Restaurar Conexão';
        btn.style.background = '#dc2626';
        offlineBanner.style.display = 'block';
      } else {
        btn.innerText = 'Simular Queda de Rede';
        btn.style.background = '';
        offlineBanner.style.display = 'none';
      }
      buildPlaybackQueue();
      currentItemIndex = 0;
      playCurrentItem();
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    function resetToPairing() {
      // 1. Marca pausa explicita para bloquear qualquer retracao automatica do YouTube
      userExplicitlyPaused = true;
      isPaused = true;

      // 2. Interrompe timers e loops
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
      }

      // 3. Esvazia filas e referencias de playlists
      currentQueue = [];
      currentItemIndex = 0;
      activePlaylist = null;
      playlistItems = [];
      elapsedSeconds = 0;

      // 4. Silencia e encerra imediatamente Deck A (HTML5) e Deck B (YouTube)
      if (deckVideo) {
        deckVideo.pause();
        deckVideo.removeAttribute('src');
        deckVideo.load();
        deckVideo.classList.remove('deck-active');
      }
      if (ytPlayer) {
        try {
          if (typeof ytPlayer.mute === 'function') ytPlayer.mute();
          if (typeof ytPlayer.stopVideo === 'function') ytPlayer.stopVideo();
          if (typeof ytPlayer.clearVideo === 'function') ytPlayer.clearVideo();
        } catch (e) {}
      }
      if (deckYouTube) {
        deckYouTube.classList.remove('deck-active');
      }

      // 5. Limpa credenciais locais
      localStorage.removeItem('tv_device_id');
      localStorage.removeItem('tv_device_token');
      currentDeviceId = null;
      currentDeviceToken = null;

      hideEmptyState();
      hidePlaybackOsd();
      updatePlayPauseButton();

      // 6. Recarrega a pagina para reiniciar com contexto limpo e codigo novo de pareamento
      location.reload();
    }

    function sendProofOfPlay(assetId, playlistId) {
      if (!currentDeviceId) return;
      fetch('/api/v1/devices/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: currentDeviceId,
          entries: [{
            assetId,
            playlistId,
            startedAt: new Date().toISOString(),
            endedAt: new Date(Date.now() + 30000).toISOString(),
            durationPlayedSeconds: 30,
            completedWithoutInterruption: true
          }]
        })
      }).catch(() => {});
    }

    // Início da aplicação
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('preview') === 'empty') {
        if (pairingScreen) pairingScreen.classList.add('hidden');
        showEmptyState('Playlist sem música');
      } else {
        initPairing();
      }
    } catch (e) {
      initPairing();
    }
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }
}
