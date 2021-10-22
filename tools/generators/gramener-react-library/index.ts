import {
  addDependenciesToPackageJson,
  applyChangesToString,
  formatFiles,
  getWorkspaceLayout,
  readProjectConfiguration,
  Tree,
} from '@nrwl/devkit';
import { GramenerReactLibrarySchema } from './schema';
import { addOutputTarget } from '@nxext/stencil/src/stencil-core-utils';
import {
  getDistDir,
  getRelativePath,
} from '@nxext/stencil/src/utils/fileutils';
import { addToGitignore } from '@nxext/stencil/src/utils/utillities';
import { STENCIL_OUTPUTTARGET_VERSION } from '@nxext/stencil/src/utils/versions';
import { libraryGenerator } from '@nrwl/react';
import { Linter } from '@nrwl/linter';
import * as ts from 'typescript';
import { addImport } from '@nxext/stencil/src/utils/ast-utils';
import { calculateStencilSourceOptions } from '@nxext/stencil/src/generators/add-outputtarget/lib/calculate-stencil-source-options';

export default async function gramenerReactLibraryGenerator(
  tree: Tree,
  schema: GramenerReactLibrarySchema,
): Promise<void> {
  await createReactLibrary(tree, schema);

  const {
    stencilProjectConfig,
    stencilConfigPath,
    stencilConfigSource,
    packageName,
  } = calculateStencilSourceOptions(tree, schema.project);

  addReactOutputTarget(
    tree,
    schema.project,
    stencilProjectConfig,
    stencilConfigPath,
    stencilConfigSource,
    packageName,
  );

  await formatFiles(tree);
}

async function createReactLibrary(
  tree: Tree,
  schema: GramenerReactLibrarySchema,
) {
  const { libsDir } = getWorkspaceLayout(tree);

  await libraryGenerator(tree, {
    name: schema.project,
    style: 'css',
    publishable: true,
    component: false,
    directory: 'react',
    importPath: `@gramener-react/${schema.project}`,
    skipTsConfig: false,
    skipFormat: true,
    unitTestRunner: 'jest',
    linter: Linter.EsLint,
  });

  await addDependenciesToPackageJson(
    tree,
    {},
    {
      '@stencil/react-output-target': STENCIL_OUTPUTTARGET_VERSION['react'],
    },
  );

  tree.write(
    `${libsDir}/react/${schema.project}/src/index.ts`,
    `export * from './generated/components';`,
  );

  addToGitignore(tree, `${libsDir}/react/${schema.project}/**/generated`);
}

function addReactOutputTarget(
  tree: Tree,
  projectName: string,
  stencilProjectConfig,
  stencilConfigPath: string,
  stencilConfigSource: ts.SourceFile,
  packageName: string,
) {
  const reactProjectConfig = readProjectConfiguration(
    tree,
    `react-${projectName}`,
  );
  const relativePath = getRelativePath(
    getDistDir(stencilProjectConfig.root),
    reactProjectConfig.root,
  );

  const changes = applyChangesToString(stencilConfigSource.text, [
    ...addImport(
      stencilConfigSource,
      `import { reactOutputTarget } from '@stencil/react-output-target';`,
    ),
    ...addOutputTarget(
      stencilConfigSource,
      `
      reactOutputTarget({
        componentCorePackage: '${packageName}',
        proxiesFile: '${relativePath}/src/generated/components.ts',
        includeDefineCustomElements: true,
      })
      `,
    ),
  ]);
  tree.write(stencilConfigPath, changes);
}
