import { Font } from '@react-pdf/renderer';

const ROBOTO_CDN = 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest';

function roboto(fontWeight: 400 | 700, fontStyle: 'normal' | 'italic') {
  return { src: `${ROBOTO_CDN}/latin-${fontWeight}-${fontStyle}.ttf`, fontWeight, fontStyle };
}

let fontsRegistered = false;

export function registerFonts() {
  if (fontsRegistered) return;

  Font.register({
    family: 'Roboto',
    fonts: [
      roboto(400, 'normal'),
      roboto(700, 'normal'),
      roboto(400, 'italic'),
      roboto(700, 'italic'),
    ],
  });

  // Disable hyphenation
  Font.registerHyphenationCallback((word) => [word]);

  // Enable emoji rendering via Twemoji images
  Font.registerEmojiSource({
    format: 'png',
    url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/',
  });

  fontsRegistered = true;
}
