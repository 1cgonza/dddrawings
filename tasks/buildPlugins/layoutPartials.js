import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const options = { encoding: 'utf8' };

export default async (files, metalsmith, done) => {
  const head = await readFile(resolve(__dirname, '../layouts/partials/head.hbs'), options);
  const footer = await readFile(resolve(__dirname, '../layouts/partials/footer.hbs'), options);
  Handlebars.registerPartial('head', head);
  Handlebars.registerPartial('footer', footer);
  done();
};
