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
    let importPath = routingOpts.default.component.path;
    let componentName = routingOpts.default.component.name;
    imports.push(`import ${componentName} from '${importPath}';`);
    routingOpts.default.component = `*${componentName}*`;
  }
  if ('components' in routingOpts.default) {
    for (const slot in routingOpts.default.components) {
      let importPath = routingOpts.default.components[slot].path;
      let componentName = routingOpts.default.components[slot].name;
      imports.push(`import ${componentName} from '${importPath}';`);
      routingOpts.default.components[slot] = `*${componentName}*`;
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

async function createRoutes({ projDir, pagesDir, curRoutePath, sourceDirAlias }) {
  const dirPath = pagesDir + curRoutePath.replace('/', path.sep);
  let dirEnts = await fs.readdir(dirPath, { withFileTypes: true });
  const index_vue = remove(dirEnts, x => x.name.toLowerCase() === 'index.vue');
  const routing_js = remove(dirEnts, x => x.name.toLowerCase() === 'routing.mjs');
  const routes = [];
  let imports = [];
  let relativePath = curRoutePath === '' ? '/' : path.basename(curRoutePath).replace('_', ':');
  let indexRoute = {
    path: relativePath,
  };
  if (index_vue) {
    const componentName = `HOME${curRoutePath.replaceAll('/', '').toUpperCase()}`;
    indexRoute.component = `*${componentName}*`;
    let importPath = path.join(projDir, pagesDir, curRoutePath, index_vue.name);
    if (sourceDirAlias) importPath = importPath.replace(path.join(projDir, 'src'), sourceDirAlias);
    imports.push(`import ${componentName} from '${importPath}';`);
  }
  if (routing_js) {
    const routingOpts = await import(path.join(projDir, pagesDir, routing_js.name));
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
      let importPath = path.join(projDir, pagesDir, curRoutePath, dirEnt.name);
      if (sourceDirAlias) importPath = importPath.replace(path.join(projDir, 'src'), sourceDirAlias);
      imports.push(`import ${componentName} from '${importPath}';`);
    } else if (dirEnt.isDirectory()) {
      const { imports: childImports, routes: childRoutes } = await createRoutes({
        projDir,
        pagesDir,
        curRoutePath: `${curRoutePath}/${dirEnt.name}`,
        sourceDirAlias,
      });
      if (!indexRoute.children) indexRoute.children = [];
      indexRoute.children = indexRoute.children.concat(childRoutes);
      imports = imports.concat(childImports);
    }
  }
  routes.push(indexRoute);
  routes.sort((lhs, rhs) => -lhs.path.localeCompare(rhs.path));
  return {
    imports,
    routes,
  };
}

async function vroutify({ pagesDir, sourceDirAlias }) {
  const projDir = fileURLToPath(import.meta.url).split(path.sep + 'node_modules' + path.sep)[0];
  return await createRoutes({
    projDir,
    pagesDir,
    curRoutePath: '',
    sourceDirAlias
  });
}

export default vroutify;
