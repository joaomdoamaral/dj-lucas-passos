/*
 * Configuração do site — edite aqui sem mexer no resto do código.
 */
window.SITE_CONFIG = {
  // Somente números, com DDI + DDD. Ex: "5511999999999"
  whatsapp: "554791847386",

  // Usuário do Instagram, sem @
  instagram: "djlucaspassos",

  email: "djlucaspassos@gmail.com",

  // Vídeo de fundo do topo (sem som, em loop). Uma versão horizontal e uma vertical.
  heroVideo: {
    desktop: { src: "videos/hero-desktop.mp4", poster: "videos/hero-desktop.jpg" },
    mobile: { src: "videos/hero-mobile.mp4", poster: "videos/hero-mobile.jpg" },
  },

  // Trecho de áudio que toca no botão "Ouvir o clima"
  audioClima: "assets/audio/clima.m4a",

  /*
   * Galeria da seção "Sente o clima" (carrossel + galeria em tela cheia).
   * A ordem aqui é a ordem no site. Dois tipos de item:
   *
   *   Foto:  { tipo: "foto", src: "assets/galeria/arquivo.jpg", titulo, legenda }
   *
   *   Vídeo: { tipo: "video", src, poster, completo, inicio, titulo, legenda }
   *     src      → trecho curto e leve (5–15s, sem som) que fica rodando no carrossel
   *     poster   → imagem de capa do vídeo
   *     completo → (opcional) versão completa, com som, que abre na galeria
   *     inicio   → (opcional) segundo em que a versão completa começa ao abrir
   *
   * Formato vertical (9:16) fica melhor. Vídeos em .mp4 (H.264).
   */
  galeria: [
    {
      tipo: "video",
      src: "videos/rodeio-pista.mp4",
      poster: "videos/rodeio-pista.jpg",
      completo: "videos/rodeio-completo.mp4",
      inicio: 39,
      titulo: "Pista cheia",
      legenda: "Casamento · Rodeio-SC",
    },
    {
      tipo: "video",
      src: "videos/15anos-pista.mp4",
      poster: "videos/15anos-pista.jpg",
      completo: "videos/15anos-completo.mp4",
      inicio: 19,
      titulo: "Pista de LED",
      legenda: "Festa de 15 anos",
    },
    {
      tipo: "video",
      src: "videos/empresa-stand.mp4",
      poster: "videos/empresa-stand.jpg",
      completo: "videos/empresa-completo.mp4",
      inicio: 0,
      titulo: "Música para negócios",
      legenda: "Evento corporativo · Fenacom SC 2025",
    },
    {
      tipo: "foto",
      src: "assets/galeria/debutante-na-cabine.jpg",
      titulo: "A debutante na cabine",
      legenda: "Festa de 15 anos",
    },
    {
      tipo: "video",
      src: "videos/rodeio-noivos.mp4",
      poster: "videos/rodeio-noivos.jpg",
      completo: "videos/rodeio-completo.mp4",
      inicio: 0,
      titulo: "Dança dos noivos",
      legenda: "Casamento · Rodeio-SC",
    },
    {
      tipo: "foto",
      src: "assets/galeria/setup-no-stand.jpg",
      titulo: "Setup no stand",
      legenda: "Evento corporativo · Fenacom SC 2025",
    },
    {
      tipo: "foto",
      src: "assets/galeria/visao-da-cabine.jpg",
      titulo: "Visão da cabine",
      legenda: "Casamento · Rodeio-SC",
    },
    {
      tipo: "video",
      src: "videos/rodeio-dj.mp4",
      poster: "videos/rodeio-dj.jpg",
      completo: "videos/rodeio-completo.mp4",
      inicio: 27,
      titulo: "No comando",
      legenda: "Casamento · Rodeio-SC",
    },
    {
      tipo: "foto",
      src: "assets/galeria/equipamento.jpg",
      titulo: "Equipamento próprio",
      legenda: "Evento corporativo · Fenacom SC 2025",
    },
    {
      tipo: "video",
      src: "videos/lucas-jessica.mp4",
      poster: "videos/lucas-jessica.jpg",
      completo: "videos/lucas-jessica-completo.mp4",
      inicio: 0,
      titulo: "A festa dos noivos",
      legenda: "Casamento · 2024",
    },
    {
      tipo: "foto",
      src: "assets/galeria/pista-cheia.jpg",
      titulo: "Todo mundo junto",
      legenda: "Casamento · Rodeio-SC",
    },
    {
      tipo: "foto",
      src: "assets/lucas.webp",
      titulo: "DJ Lucas Passos",
      legenda: "Em ação",
    },
    {
      tipo: "foto",
      src: "assets/galeria/lucas-sorrindo.jpg",
      titulo: "Clima de festa",
      legenda: "Casamento · Rodeio-SC",
    },
  ],
};
