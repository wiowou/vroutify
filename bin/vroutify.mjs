#!/usr/bin/env node

import vroutify from '../index.mjs';

import { createWriteStream } from 'fs';
import util from 'util';
import path from 'path';
import process from 'process';

async function main() {
  const args = process.argv;
  let pagesDir = '';
  let routesDir = path.join('src', 'router');
  let sourceDir = '';
  let sourceDirAlias = '@';
  args.forEach((arg, index) => {
    if (arg.toLowerCase() === '--pages-dir') {
      pagesDir = args[index + 1];
    } else if (arg.toLowerCase() === '--routes-dir') {
      routesDir = args[index + 1];
    } else if (arg.toLowerCase() === '--source-dir') {
      sourceDir = args[index + 1];
    } else if (arg.toLowerCase() === '--source-dir-alias') {
      sourceDirAlias = args[index + 1];
    }
  });

  const { routes, imports } = await vroutify(pagesDir, sourceDir, sourceDirAlias);
  const outputStream = createWriteStream(path.join(routesDir, 'routes.js'), { flags: 'w' });
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
