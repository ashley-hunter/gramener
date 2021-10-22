import {
  addDependenciesToPackageJson,
  applyChangesToString,
  formatFiles,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  readProjectConfiguration,
  Tree,
} from '@nrwl/devkit';
import { GramenerAngularLibrarySchema } from './schema';
import { libraryGenerator } from '@nrwl/angular/generators';
import { STENCIL_OUTPUTTARGET_VERSION } from '@nxext/stencil/src/utils/versions';
import {
  addImport,
  readTsSourceFile,
} from '@nxext/stencil/src/utils/ast-utils';
import { addToGitignore } from '@nxext/stencil/src/utils/utillities';
import { addGlobal } from '@nrwl/workspace/src/utilities/ast-utils';
import { relative } from 'path';
import { getDistDir } from '@nxext/stencil/src/utils/fileutils';
import { addOutputTarget } from '@nxext/stencil/src/stencil-core-utils';
import * as ts from 'typescript';
import { calculateStencilSourceOptions } from '@nxext/stencil/src/generators/add-outputtarget/lib/calculate-stencil-source-options';

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
  const angularProjectName = `${schema.project}-angular`;
  const { libsDir, npmScope } = getWorkspaceLayout(host);

  await libraryGenerator(host, {
    name: angularProjectName,
    skipFormat: true,
    publishable: true,
    importPath: `@gramener-angular/${schema.project}`,
  });

  addDependenciesToPackageJson(
    host,
    {},
    {
      '@stencil/angular-output-target': STENCIL_OUTPUTTARGET_VERSION['angular'],
    },
  );

  const angularModuleFilename = names(angularProjectName).fileName;
  const angularModulePath = `${libsDir}/${angularProjectName}/src/lib/${angularModuleFilename}.module.ts`;
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
    `${projectName}-angular`,
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
