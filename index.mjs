import fs from 'fs/promises';
import path from 'path';

function remove(arr, predicate) {
  const idx = arr.findIndex(predicate);
  if (idx === -1) return undefined;
  return arr.splice(idx, 1)[0];
}

async function createRoutes(pagesDir, curRoutePath, imports) {
  const dirPath = pagesDir + curRoutePath.replace('/', path.sep);
  let dirEnts = await fs.readdir(dirPath, { withFileTypes: true });
  const index_vue = remove(dirEnts, x => x.name.toLowerCase() === 'index.vue');
  const routing_js = remove(dirEnts, x => x.name.toLowerCase() === 'routing.mjs');
  const routes = [];
  let indexRoute = {
    path: curRoutePath === '' ? '/' : path.basename(curRoutePath),
  };
  if (index_vue) {
    const componentName = `HOME${curRoutePath.replaceAll('/', '').toUpperCase()}`;
    indexRoute.component = `*${componentName}*`;
    imports.push(`import ${componentName} from '${path.join('@', 'pages', curRoutePath, index_vue.name)}';`);
  }
  if (routing_js) {
    const routingOpts = await import(path.join(dirPath, routing_js.name));

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
  }
  if (dirEnts.length) indexRoute.children = [];

  for (const dirEnt of dirEnts) {
    if (dirEnt.isFile()) {
      const routePath = `${curRoutePath}/${dirEnt.name.split('.')[0]}`;
      const componentName = `HOME${routePath.replaceAll('/', '').toUpperCase()}`;
      let route = {
        path: path.basename(routePath),
        component: `*${componentName}*`,
      };
      routes.push(route);
      imports.push(`import ${componentName} from '${path.join('@', 'pages', curRoutePath, dirEnt.name)}';`);
    } else if (dirEnt.isDirectory()) {
      const children = await createRoutes(pagesDir, `${curRoutePath}/${dirEnt.name}`, imports);
      indexRoute.children = indexRoute.children.concat(children);
    }
  }
  routes.push(indexRoute);
  return routes;
}

export default async function vroutify(pagesDir) {
  const importStatements = [];
  return {
    routes: createRoutes(pagesDir, '', importStatements),
    importStatements,
  };
}
