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

  const stencilProjectPath = joinPathFragments('libs', 'stencil', schema.name);

  // delete the utils folder
  tree.delete(joinPathFragments(stencilProjectPath, 'src', 'utils'));

  // simplify the component path and file names
  const oldComponentPath = joinPathFragments(
    stencilProjectPath,
    'src',
    'components',
    componentName,
  );

  const newComponentPath = joinPathFragments(
    stencilProjectPath,
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

  // delete the license files
  tree.delete(joinPathFragments(stencilProjectPath, 'LICENSE'));

  // update the serve task to use development mode
  const configuration = readProjectConfiguration(tree, schema.name);

  configuration.targets.serve.options.dev = true;
  configuration.targets.serve.options.debug = true;

  // delete e2e target
  delete configuration.targets.e2e;

  updateProjectConfiguration(tree, schema.name, configuration);

  // update the components.d.ts file

  // create the Angular build target

  // format the files with prettier to ensure they follow the code style convention
  await formatFiles(tree);
}
