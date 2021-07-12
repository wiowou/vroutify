#!/usr/bin/env node

import vroutify from '../';

import { createWriteStream } from 'fs';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

(function next() {
  const pagesDir = null;
  if (!pagesDir) {
    const curDir = path.dirname(fileURLToPath(import.meta.url));
    pagesDir = path.join(path.dirname(curDir), 'src', 'pages');
  }
  const { routes, importStatements } = await vroutify(pagesDir);
  const outputStream = createWriteStream('src/router/routes.js', { flags: 'w' });
  const outputConsole = new console.Console(outputStream);
  for (const s of importStatements) {
    outputConsole.log(s);
  }
  outputConsole.log();
  outputConsole.log(
    'export default ' +
      util.inspect(routes, { showHidden: false, depth: null, compact: false }).replaceAll(/('\*)|(\*')/g, '')
  );
})();
