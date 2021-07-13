#!/usr/bin/env node

import vroutify from './index.mjs';

import { createWriteStream } from 'fs';
import util from 'util';
import path from 'path';

(async function next() {
  let pagesDir = null;
  if (!pagesDir) {
    pagesDir = path.join('src', 'pages');
  }
  const { routes, importStatements } = await vroutify(pagesDir);
  const outputStream = createWriteStream(path.join('src', 'router', 'routes.js'), { flags: 'w' });
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
