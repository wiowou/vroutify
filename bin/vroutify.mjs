#!/usr/bin/env node

import vroutify from '../index.mjs';

import { createWriteStream } from 'fs';
import util from 'util';
import path from 'path';
import process from 'process';

function cleanseDirArg(dirArg) {
  return dirArg.startsWith('/') || dirArg.startsWith('\\') ? (dirArg = dirArg.substr(1)) : dirArg;
}

async function main() {
  const args = process.argv;
  const projDir = args[1].split(path.sep + 'node_modules' + path.sep)[0];
  let pagesDir = path.join('src', 'pages');
  let routesDir = path.join('src', 'router');
  let sourceDirAlias = '@';
  args.forEach((arg, index) => {
    if (arg.toLowerCase() === '--pages-dir') {
      pagesDir = args[index + 1];
      pagesDir = cleanseDirArg(pagesDir);
    } else if (arg.toLowerCase() === '--routes-dir') {
      routesDir = args[index + 1];
      routesDir = cleanseDirArg(routesDir);
    } else if (arg.toLowerCase() === '--source-dir-alias') {
      routesDir = args[index + 1];
    }
  });

  const { routes, imports } = await vroutify({
    projDir,
    pagesDir,
    sourceDirAlias,
  });
  const outputStream = createWriteStream(path.join(projDir, routesDir, 'routes.js'), { flags: 'w' });
  const outputConsole = new console.Console(outputStream);
  for (const s of imports) {
    outputConsole.log(s);
  }
  outputConsole.log();
  outputConsole.log(
    'export default ' +
      util.inspect(routes, { showHidden: false, depth: null, compact: false }).replaceAll(/('\*)|(\*')/g, '')
  );
}

await main();
