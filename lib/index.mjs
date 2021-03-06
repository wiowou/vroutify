import fs from 'fs/promises';
import { readFileSync } from 'fs';
import path from 'path';
import process from 'process';
import util from 'util';

/**
 *
 * @typedef {Object} Routing
 * @property {string[]} imports - import statements
 * @property {Object[]} routes - routes
 */

/**
 * Mutates incoming array to remove and return the object matching the predicate
 * @param {Object[]} arr - An array of objects
 * @param predicate - A function that returns true or false depending upon whether a match is found from the array
 * @returns {Object[]} The matching object
 */
function remove(arr, predicate) {
  const idx = arr.findIndex(predicate);
  if (idx === -1) return undefined;
  return arr.splice(idx, 1)[0];
}

/**
 * Reverses the default comparator to ultimately result in a descending order string array
 * @param {string} lhs - The left hand side of the operator comparing two route paths
 * @param {string} rhs - The right hand side of the operator comparing two route paths
 * @returns {int} -1 if rhs occurs before lhs, 1 if lhs occurs before rhs and 0 if they are equal
 */
function routeComparer(lhs, rhs) {
  return -lhs.path.localeCompare(rhs.path);
}

/**
 * Parses a Javascript file looking for simple import statements
 * @param {string} filePath - A path to the file
 * @returns {string[]} Import statements found in the file
 */
function extractImportStatments(filePath) {
  const content = readFileSync(filePath, { encoding: 'utf8' });
  const lines = content.split('\n');
  const imports = lines.filter(x => /^import .+ from ['|"].*['|"];/.test(x.toLowerCase()));
  return imports;
}

/**
 * Apply the user options in the routing.js file to the current Routing object
 * @param {string} dirPath
 * @param {string} curRoutePath
 * @param {Object} routing_js - A file type object containing the file name
 * @param {string[]} imports - import statements
 * @param {Routing} indexRoute - The current Routing object
 * @returns {Routing} The contents of the routes.js file.
 */
async function applyManualRoutingOpts(dirPath, curRoutePath, routing_js, imports, indexRoute) {
  const projDir = process.cwd();
  const filePath = path.join(projDir, dirPath, routing_js.name);
  const routingOpts = await import(filePath);
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
  imports = imports.concat(extractImportStatments(filePath));
  indexRoute = {
    ...indexRoute,
    ...routingOpts.default,
  };
  return {
    imports,
    indexRoute,
  };
}

/**
 * In the situation when there are multiple, named router views, the props object must be specified for each of those named views.
 * When there is only the default router view, props is just set to true.
 * @param {Object} indexRoute
 * @returns {string|Object}
 */
function createDynamicRouteProps(indexRoute) {
  let props = true;
  if ('components' in indexRoute) {
    props = {};
    for (const compName in indexRoute.components) {
      props[compName] = true;
    }
  }
  return props;
}

/**
 * Creates an object representation of imports and routes for the current directory in views/pages. Is recursive.
 * @async
 * @function createRoutes
 * @param {string} pagesDir - The directory containing your application's views/pages. A relative path from the project root directory.
 * @param {string} curRoutePath - The relative path to the directory in views/pages that is currently being parsed
 * @param sourceDir
 * @param sourceDirAlias
 * @returns {Routing} The contents of the current directory in views/pages.
 */
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
    ({ imports, indexRoute } = await applyManualRoutingOpts(dirPath, curRoutePath, routing_js, imports, indexRoute));
  }

  if (relativePath.startsWith(':') && !('props' in indexRoute)) {
    indexRoute.props = createDynamicRouteProps(indexRoute);
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

/**
 * Creates the contents of the routes.js file. This includes import statements and the array of path objects.
 * @async
 * @function createRoutingObject
 * @param {string} pagesDir - The directory containing your application's views/pages. A relative path from the project root directory.
 * @param {string} sourceDir - The directory containing your application's source files. A relative path from the project root directory.
 * @param {string} sourceDirAlias - An alias for the source-dir that should be used in import statements.
 * @returns {Routing} The contents of the routes.js file.
 */
async function createRoutingObject(pagesDir, sourceDir, sourceDirAlias) {
  sourceDirAlias = sourceDirAlias ?? '@';
  pagesDir = pagesDir || path.join('src', 'pages');
  sourceDir = sourceDir || 'src';
  let result = await createRoutes(pagesDir, '', sourceDir, sourceDirAlias);
  //remove duplicate component import statements
  result.imports = result.imports.map(x => x.replaceAll(/( {2,})|(\r)|(\n)|(\t)/g, ''));
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
/**
 * Creates the contents of the routes.js file. This includes import statements and the array of path objects.
 * @async
 * @function vroutify
 * @param {string} pagesDir - The directory containing your application's views/pages. A relative path from the project root directory.
 * @param {string} sourceDir - The directory containing your application's source files. A relative path from the project root directory.
 * @param {string} sourceDirAlias - An alias for the source-dir that should be used in import statements.
 * @returns {string} The contents of the routes.js file.
 */
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
