import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  publicDir: './estaticos',
  compressHTML: true,
  outDir: './publico',
  srcDir: './fuente',
  site: 'https://dddrawings.com',
  base: '/',
  build: {
    assets: 'estaticos',
  },
  vite: {
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.vs': 'text',
          '.fs': 'text',
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
  integrations: [mdx()],
});
