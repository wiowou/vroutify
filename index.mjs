import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

function remove(arr, predicate) {
  const idx = arr.findIndex(predicate);
  if (idx === -1) return undefined;
  return arr.splice(idx, 1)[0];
}

function addRoutingOptions(routingOpts, imports, indexRoute) {
  if ('component' in routingOpts.default) {
    imports.push(`import ${routingOpts.default.component.name} from '${routingOpts.default.component.path}';`);
    routingOpts.default.component = `*${routingOpts.default.component.name}*`;
  }
  if ('components' in routingOpts.default) {
    for (const slot in routingOpts.default.components) {
      imports.push(
        `import ${routingOpts.default.components[slot].name} from '${routingOpts.default.components[slot].path}';`
      );
      routingOpts.default.components[slot] = `*${routingOpts.default.components[slot].name}*`;
    }
  }
  indexRoute = {
    ...indexRoute,
    ...routingOpts.default,
  };
  return {
    imports,
    indexRoute,
  };
}

async function createRoutes(projDir, pagesDir, curRoutePath, imports) {
  const dirPath = pagesDir + curRoutePath.replace('/', path.sep);
  let dirEnts = await fs.readdir(dirPath, { withFileTypes: true });
  const index_vue = remove(dirEnts, x => x.name.toLowerCase() === 'index.vue');
  const routing_js = remove(dirEnts, x => x.name.toLowerCase() === 'routing.mjs');
  const routes = [];
  let relativePath = curRoutePath === '' ? '/' : path.basename(curRoutePath).replace('_', ':');
  let indexRoute = {
    path: relativePath,
  };
  if (index_vue) {
    const componentName = `HOME${curRoutePath.replaceAll('/', '').toUpperCase()}`;
    indexRoute.component = `*${componentName}*`;
    imports.push(`import ${componentName} from '${path.join('@', 'pages', curRoutePath, index_vue.name)}';`);
  }
  if (routing_js) {
    const routingOpts = await import(path.join(projDir, 'src', 'pages', routing_js.name));
    ({ imports, indexRoute } = addRoutingOptions(routingOpts, imports, indexRoute));
  }

  for (const dirEnt of dirEnts) {
    if (dirEnt.isFile()) {
      let relativePath = dirEnt.name.split('.')[0].replace('_', ':');
      if (curRoutePath === '') relativePath = '/' + relativePath;
      const componentName = `HOME${curRoutePath}${relativePath}`.replaceAll('/', '').toUpperCase();
      let route = {
        path: relativePath,
        component: `*${componentName}*`,
      };
      routes.push(route);
      imports.push(`import ${componentName} from '${path.join('@', 'pages', curRoutePath, dirEnt.name)}';`);
    } else if (dirEnt.isDirectory()) {
      const children = await createRoutes(pagesDir, `${curRoutePath}/${dirEnt.name}`, imports);
      if (!indexRoute.children) indexRoute.children = [];
      indexRoute.children = indexRoute.children.concat(children);
    }
  }
  routes.push(indexRoute);
  routes.sort((lhs, rhs) => -lhs.path.localeCompare(rhs.path));
  return routes;
}

async function vroutify(pagesDir) {
  const importStatements = [];
  const projDir = fileURLToPath(import.meta.url).split(path.sep + 'node_modules' + path.sep)[0];
  const routes = await createRoutes(projDir, pagesDir, '', importStatements);
  return {
    routes,
    importStatements,
  };
}

export default vroutify;
