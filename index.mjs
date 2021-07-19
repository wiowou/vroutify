import fs from 'fs/promises';
import path from 'path';
import process from 'process';

function remove(arr, predicate) {
  const idx = arr.findIndex(predicate);
  if (idx === -1) return undefined;
  return arr.splice(idx, 1)[0];
}

async function createRoutes(pagesDir, curRoutePath, sourceDir, sourceDirAlias) {
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
    const componentName = `HOME${curRoutePath}`.replaceAll('/', '').toUpperCase();
    indexRoute.component = `*${componentName}*`;
    let importPath = path.join(pagesDir, curRoutePath, index_vue.name);
    importPath = importPath.replace(sourceDir, sourceDirAlias);
    imports.push(`import ${componentName} from '${importPath}';`);
  }
  if (routing_js) {
    const projDir = process.cwd();
    const routingOpts = await import(path.join(projDir, dirPath, routing_js.name));
    if ('components' in routingOpts.default) {
      delete routingOpts.default.component;
      delete indexRoute.component;
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

  for (const dirEnt of dirEnts) {
    if (dirEnt.isFile()) {
      const fileName = dirEnt.name.split('.')[0];
      let relativePath = fileName.replace('_', ':');
      if (curRoutePath === '') relativePath = '/' + relativePath;
      const componentName = `HOME${curRoutePath}${fileName}`.replaceAll('/', '').toUpperCase();
      let route = {
        path: relativePath,
        component: `*${componentName}*`,
      };
      routes.push(route);
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
  routes.push(indexRoute);
  routes.sort((lhs, rhs) => -lhs.path.localeCompare(rhs.path));
  return {
    imports,
    routes,
  };
}

async function vroutify(pagesDir, sourceDir, sourceDirAlias) {
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

export default vroutify;
