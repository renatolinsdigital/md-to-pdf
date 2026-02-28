import { Font } from '@react-pdf/renderer';

let fontsRegistered = false;

export function registerFonts() {
  if (fontsRegistered) return;

  Font.register({
    family: 'Roboto',
    fonts: [
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-normal.ttf',
        fontWeight: 400,
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-700-normal.ttf',
        fontWeight: 700,
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-italic.ttf',
        fontWeight: 400,
        fontStyle: 'italic',
      },
      {
        src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-700-italic.ttf',
        fontWeight: 700,
        fontStyle: 'italic',
      },
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
