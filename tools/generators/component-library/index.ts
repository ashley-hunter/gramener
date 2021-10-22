import {
  formatFiles,
  joinPathFragments,
  names,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { Linter } from '@nrwl/linter';
import {
  componentGenerator,
  libraryGenerator,
  makeLibBuildableGenerator,
} from '@nxext/stencil';
import { SupportedStyles } from '@nxext/stencil/src/stencil-core-utils';
import { ComponentLibrarySchema } from './schema';

export default async function (
  tree: Tree,
  schema: ComponentLibrarySchema,
): Promise<void> {
  // ensure the name is formatted correctly
  schema.name = names(schema.name).name;

  // generate the stencil library
  await libraryGenerator(tree, {
    name: schema.name,
    buildable: false,
    component: false,
    publishable: false,
    directory: 'stencil',
    e2eTestRunner: 'none',
    linter: Linter.EsLint,
    style: SupportedStyles.css,
    tags: 'stencil',
    unitTestRunner: 'jest',
  });

  // create the component
  const componentName = 'gramener-' + schema.name;

  await componentGenerator(tree, {
    name: componentName,
    project: schema.name,
  });

  // simplify the component path and file names
  const oldComponentPath = joinPathFragments(
    'libs',
    'stencil',
    schema.name,
    'src',
    'components',
    componentName,
  );

  const newComponentPath = joinPathFragments(
    'libs',
    'stencil',
    schema.name,
    'src',
    'components',
    schema.name,
  );

  // delete the e2e file
  tree.delete(joinPathFragments(oldComponentPath, `${componentName}.e2e.ts`));

  // move all the component files to the new directory and rename them
  for (const file of tree.children(oldComponentPath)) {
    const newFilePath = joinPathFragments(
      newComponentPath,
      file.replace('gramener-', ''),
    );
    const oldFilePath = joinPathFragments(oldComponentPath, file);

    tree.write(newFilePath, tree.read(oldFilePath));
    tree.delete(oldFilePath);
  }

  // make the library buildable
  await makeLibBuildableGenerator(tree, {
    name: schema.name,
    style: SupportedStyles.css,
    directory: 'stencil',
    importPath: `@gramener/${schema.name}`,
  });

  // update the serve task to use development mode
  const configuration = readProjectConfiguration(tree, schema.name);

  configuration.targets.serve.options.dev = true;
  configuration.targets.serve.options.debug = true;

  updateProjectConfiguration(tree, schema.name, configuration);

  // create the Angular build target

  // format the files with prettier to ensure they follow the code style convention
  await formatFiles(tree);
}