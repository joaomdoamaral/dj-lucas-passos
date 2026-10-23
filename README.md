# DJ Lucas Passos — landing page

Landing page estática (HTML + CSS + JS), sem build, focada em levar o visitante para o WhatsApp. GSAP + ScrollTrigger e Lenis vêm por CDN.

## Rodar localmente

```bash
npx -y http-server . -p 5173 -c-1
```

Abra http://localhost:5173.

## O que editar

- **`config.js`**: número do WhatsApp, usuário do Instagram e os itens da galeria "Sente o clima".
- **Galeria**: cada item do array `galeria` em `config.js` é uma foto ou um vídeo. No carrossel roda um trecho curto e mudo (`src`); ao ampliar, abre a versão completa com som (`completo`), a partir do segundo `inicio`. Fotos ficam em `assets/galeria/`, vídeos e capas em `videos/`. Os arquivos originais baixados do Instagram estão em `videos/originais/`.

Para cortar e comprimir um vídeo novo (com ffmpeg):

```bash
ffmpeg -ss 10 -t 12 -i videos/originais/video.mp4 -an -vf "scale=540:-2" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart videos/trecho.mp4
```
- **Mensagens do WhatsApp**: qualquer link com `data-wa="..."` em `index.html` vira um link de WhatsApp com aquele texto já preenchido. Cada card de evento tem a sua mensagem.
- **Números da seção "Sobre"** (anos de pista, eventos): atributo `data-to` de cada `.js-counter` em `index.html`.
- **Foto**: `assets/lucas.webp`.

## Conversão

- Header fixo com botão de orçamento sempre visível.
- Botão flutuante do WhatsApp (barra fixa no rodapé no celular), que aparece depois do topo e some quando o formulário está na tela.
- CTA no hero, em cada tipo de evento, em "Como funciona" e no formulário.
- Cliques no WhatsApp disparam o evento `whatsapp_click` (com a origem) para Google Tag Manager / GA4 e `Contact` para o Meta Pixel, se estiverem instalados na página.
