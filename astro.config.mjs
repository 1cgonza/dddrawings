import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import glslLoader from 'rollup-plugin-glsl-loader';

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
    build: {
      rollupOptions: {
        plugins: [glslLoader()],
      },
    },
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
