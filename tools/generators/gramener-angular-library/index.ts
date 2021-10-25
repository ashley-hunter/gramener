import { libraryGenerator } from '@nrwl/angular/generators';
import { addDependenciesToPackageJson, applyChangesToString, formatFiles, generateFiles, getWorkspaceLayout, joinPathFragments, names, readProjectConfiguration, Tree, updateProjectConfiguration } from '@nrwl/devkit';
import { addGlobal } from '@nrwl/workspace/src/utilities/ast-utils';
import { calculateStencilSourceOptions } from '@nxext/stencil/src/generators/add-outputtarget/lib/calculate-stencil-source-options';
import { addOutputTarget } from '@nxext/stencil/src/stencil-core-utils';
import { addImport, readTsSourceFile } from '@nxext/stencil/src/utils/ast-utils';
import { getDistDir } from '@nxext/stencil/src/utils/fileutils';
import { addToGitignore } from '@nxext/stencil/src/utils/utillities';
import { STENCIL_OUTPUTTARGET_VERSION } from '@nxext/stencil/src/utils/versions';
import { relative } from 'path';
import * as ts from 'typescript';
import { GramenerAngularLibrarySchema } from './schema';

export default async function gramenerAngularLibraryGenerator(
  tree: Tree,
  schema: GramenerAngularLibrarySchema,
): Promise<void> {
  await createAngularLibrary(tree, schema);

  const {
    stencilProjectConfig,
    stencilConfigPath,
    stencilConfigSource,
    packageName,
  } = calculateStencilSourceOptions(tree, schema.project);

  addAngularOutputTarget(
    tree,
    schema.project,
    stencilProjectConfig,
    stencilConfigPath,
    stencilConfigSource,
    packageName,
  );

  await formatFiles(tree);
}

async function createAngularLibrary(
  host: Tree,
  schema: GramenerAngularLibrarySchema,
) {
  const { libsDir, npmScope } = getWorkspaceLayout(host);

  await libraryGenerator(host, {
    name: schema.project,
    directory: 'angular',
    skipFormat: true,
    publishable: true,
    importPath: `@gramener-angular/${schema.project}`,
    simpleModuleName: true,
  });

  addDependenciesToPackageJson(
    host,
    {},
    {
      '@stencil/angular-output-target': STENCIL_OUTPUTTARGET_VERSION['angular'],
    },
  );

  const angularProjectName = 'angular-' + schema.project;
  const angularModuleFilename = names(schema.project).fileName;
  const angularModulePath = `${libsDir}/angular/${schema.project}/src/lib/${angularModuleFilename}.module.ts`;
  const angularModuleSource = readTsSourceFile(host, angularModulePath);
  const packageName = `@${npmScope}/${schema.project}`;

  const changes = applyChangesToString(angularModuleSource.text, [
    ...addImport(
      angularModuleSource,
      `import { defineCustomElements } from '${packageName}/loader';`,
    ),
  ]);
  host.write(angularModulePath, changes);

  addGlobal(
    host,
    angularModuleSource,
    angularModulePath,
    'defineCustomElements(window);',
  );

  addToGitignore(host, `${libsDir}/${angularProjectName}/**/generated`);

  createStory(host, schema);
}

function addAngularOutputTarget(
  host: Tree,
  projectName: string,
  stencilProjectConfig,
  stencilConfigPath: string,
  stencilConfigSource: ts.SourceFile,
  packageName: string,
) {
  const angularProjectConfig = readProjectConfiguration(
    host,
    `angular-${projectName}`,
  );

  angularProjectConfig.implicitDependencies = [projectName];
  updateProjectConfiguration(
    host,
    `angular-${projectName}`,
    angularProjectConfig,
  );

  const relativePath = relative(
    getDistDir(stencilProjectConfig.root),
    angularProjectConfig.root,
  );
  const proxyPath = joinPathFragments(
    relativePath,
    'src/generated/directives/proxies.ts',
  );

  const changes = applyChangesToString(stencilConfigSource.text, [
    ...addImport(
      stencilConfigSource,
      `import { angularOutputTarget, ValueAccessorConfig } from '@stencil/angular-output-target';`,
    ),
    ...addOutputTarget(
      stencilConfigSource,
      `
      angularOutputTarget({
          componentCorePackage: '${packageName}',
          directivesProxyFile: '${proxyPath}',
          valueAccessorConfigs: angularValueAccessorBindings
        }),
      `,
    ),
  ]);
  host.write(stencilConfigPath, changes);

  addGlobal(
    host,
    stencilConfigSource,
    stencilConfigPath,
    'const angularValueAccessorBindings: ValueAccessorConfig[] = [];',
  );
}

function createStory(tree: Tree, schema: GramenerAngularLibrarySchema): void {
  const projectConfig = readProjectConfiguration(tree, 'angular-storybook');

  generateFiles(
    tree,
    joinPathFragments(__dirname, './files'),
    joinPathFragments(projectConfig.root, 'stories'),
    {
      componentFileName: names(schema.project).fileName,
      className: names('gramener-' + schema.project).className,
      moduleName: names(schema.project).className + 'Module',
      libraryPath: `@gramener-angular/${schema.project}`,
      tagName: names('gramener-' + schema.project).name
    },
  );
}
