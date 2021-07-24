import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import util from 'util';

function remove(arr, predicate) {
  const idx = arr.findIndex(predicate);
  if (idx === -1) return undefined;
  return arr.splice(idx, 1)[0];
}

function routeComparer(lhs, rhs) {
  return -lhs.path.localeCompare(rhs.path);
}

async function createRoutes(pagesDir, curRoutePath, sourceDir, sourceDirAlias) {
  const dirPath = pagesDir + curRoutePath.replace('/', path.sep);
  let dirEnts = await fs.readdir(dirPath, { withFileTypes: true });
  dirEnts = dirEnts.filter(x => !x.name.startsWith('-'));
  const index_vue = remove(dirEnts, x => x.name.toLowerCase() === 'index.vue');
  const routing_js = remove(dirEnts, x => x.name.toLowerCase() === 'routing.mjs');
  const routes = [];
  let imports = [];
  let relativePath = curRoutePath === '' ? '/' : path.basename(curRoutePath).replace('_', ':');
  let indexRoute = {
    path: relativePath,
  };

  if (index_vue) {
    const componentName = `HOME${curRoutePath}`.replaceAll('/', '').toUpperCase();
    indexRoute.component = `*${componentName}*`;
    let importPath = path.join(pagesDir, curRoutePath, index_vue.name);
    importPath = importPath.replace(sourceDir, sourceDirAlias);
    imports.push(`import ${componentName} from '${importPath}';`);
  }
  if (routing_js) {
    const projDir = process.cwd();
    const routingOpts = await import(path.join(projDir, dirPath, routing_js.name));
    for (const prop in routingOpts.default) {
      if (typeof routingOpts.default[prop] === 'function') {
        let functionBody = routingOpts.default[prop].toString();
        functionBody = functionBody.replaceAll(/( {2,})|(\r)|(\n)|(\t)/g, '');
        //const functionKeyword = routingOpts.default[prop].toString().includes('=>') ? '' : 'function';
        routingOpts.default[prop] = `*function ${functionBody}*`;
      }
    }
    if ('components' in routingOpts.default) {
      delete routingOpts.default.component;
      delete indexRoute.component;
      imports.pop(); //do not assume the import from index_vue will be used
      for (const slot in routingOpts.default.components) {
        const importPath = routingOpts.default.components[slot];
        let fileName = path.basename(routingOpts.default.components[slot]).split('.')[0];
        fileName = fileName.toLowerCase() === 'index' ? '' : fileName;
        const componentName = `HOME${curRoutePath}${fileName}`.replaceAll('/', '').toUpperCase();
        imports.push(`import ${componentName} from '${importPath}';`);
        routingOpts.default.components[slot] = `*${componentName}*`;
      }
    }
    indexRoute = {
      ...indexRoute,
      ...routingOpts.default,
    };
  }

  if (relativePath.startsWith(':') && !('props' in indexRoute)) {
    let props = true;
    if ('components' in indexRoute) {
      props = {};
      for (const compName in indexRoute.components) {
        props[compName] = true;
      }
    }
    indexRoute.props = props;
  }

  for (const dirEnt of dirEnts) {
    if (dirEnt.isFile()) {
      if (!dirEnt.name.toLowerCase().endsWith('.vue')) continue;
      const fileName = dirEnt.name.split('.')[0];
      let relativePath = fileName.replace('_', ':');
      if (curRoutePath === '') relativePath = '/' + relativePath;
      const componentName = `HOME${curRoutePath}${fileName}`.replaceAll('/', '').toUpperCase();
      let route = {
        path: relativePath,
        component: `*${componentName}*`,
      };
      if (relativePath.startsWith(':')) {
        route.props = true;
      }
      if (!indexRoute.children) indexRoute.children = [];
      indexRoute.children.push(route);
      let importPath = path.join(pagesDir, curRoutePath, dirEnt.name);
      importPath = importPath.replace(sourceDir, sourceDirAlias);
      imports.push(`import ${componentName} from '${importPath}';`);
    } else if (dirEnt.isDirectory()) {
      const { imports: childImports, routes: childRoutes } = await createRoutes(
        pagesDir,
        `${curRoutePath}/${dirEnt.name}`,
        sourceDir,
        sourceDirAlias
      );
      if (!indexRoute.children) indexRoute.children = [];
      indexRoute.children = indexRoute.children.concat(childRoutes);
      imports = imports.concat(childImports);
    }
  }
  if (indexRoute.children) {
    indexRoute.children.sort(routeComparer);
  }
  routes.push(indexRoute);
  routes.sort(routeComparer);
  return {
    imports,
    routes,
  };
}

async function createRoutingObject(pagesDir, sourceDir, sourceDirAlias) {
  sourceDirAlias = sourceDirAlias ?? '@';
  pagesDir = pagesDir || path.join('src', 'pages');
  sourceDir = sourceDir || 'src';
  let result = await createRoutes(pagesDir, '', sourceDir, sourceDirAlias);
  //remove duplicate component import statements
  result.imports.sort((lhs, rhs) => {
    const lhsCompName = lhs.split(' ')[1];
    const rhsCompName = rhs.split(' ')[1];
    return lhsCompName.localeCompare(rhsCompName);
  });
  result.imports = result.imports.filter((_, index, array) => {
    if (index === 0) return true;
    const lhsCompName = array[index - 1].split(' ')[1];
    const rhsCompName = array[index].split(' ')[1];
    return lhsCompName !== rhsCompName;
  });
  return result;
}

async function vroutify(pagesDir, sourceDir, sourceDirAlias) {
  const { routes, imports } = await createRoutingObject(pagesDir, sourceDir, sourceDirAlias);
  const output =
    imports.join('\n') +
    '\n' +
    '\n' +
    'export default ' +
    util.inspect(routes, { showHidden: false, depth: null, compact: false }).replaceAll(/('\*)|(\*')/g, '');
  return output;
}

export default vroutify;