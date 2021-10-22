import {
  formatFiles,
  joinPathFragments,
  names,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { GramenerLibrarySchema } from './schema';
import { libraryGenerator, makeLibBuildableGenerator } from '@nxext/stencil';
import { Linter } from '@nrwl/linter';
import { SupportedStyles } from '@nxext/stencil/src/stencil-core-utils';
import gramenerComponentGenerator from '../gramener-component';
import { load } from 'cheerio';

export default async function gramenerLibraryGenerator(
  tree: Tree,
  schema: GramenerLibrarySchema,
): Promise<void> {
  const normalizedSchema = normalizeSchema(schema);

  // create the initial library files and setup
  await generateStencilLibrary(tree, normalizedSchema);

  // remove unused files from the directory
  cleanupLibrary(tree, normalizedSchema);

  // make the library buildable and publishable
  await makeBuildableLibrary(tree, normalizedSchema);

  // add an initial component to the library
  await gramenerComponentGenerator(tree, {
    name: normalizedSchema.libraryName,
    project: normalizedSchema.libraryName,
  });

  // update the index.html file to update the tag name to match the generated component
  updateIndexHtml(tree, normalizedSchema);

  await formatFiles(tree);
}

async function generateStencilLibrary(
  tree: Tree,
  schema: NormalizedGramenerLibrarySchema,
): Promise<void> {
  await libraryGenerator(tree, {
    name: schema.libraryName,
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
}

function cleanupLibrary(
  tree: Tree,
  schema: NormalizedGramenerLibrarySchema,
): void {
  tree.delete(joinPathFragments(schema.libraryPath, 'LICENSE'));
  tree.delete(joinPathFragments(schema.librarySourceRoot, 'utils'));
}

async function makeBuildableLibrary(
  tree: Tree,
  schema: NormalizedGramenerLibrarySchema,
) {
  await makeLibBuildableGenerator(tree, {
    name: schema.libraryName,
    style: SupportedStyles.css,
    directory: 'stencil',
    importPath: `@gramener/${schema.name}`,
  });

  // update the serve task to use development mode
  const configuration = readProjectConfiguration(tree, schema.name);

  configuration.targets.serve.options.dev = true;
  configuration.targets.serve.options.debug = true;

  // delete e2e target
  delete configuration.targets.e2e;

  updateProjectConfiguration(tree, schema.name, configuration);

  // clear the components.d.ts file
  tree.write(
    joinPathFragments(schema.librarySourceRoot, 'components.d.ts'),
    '',
  );
}

function updateIndexHtml(tree: Tree, schema: NormalizedGramenerLibrarySchema) {
  const indexPath = joinPathFragments(schema.librarySourceRoot, 'index.html');
  const contents = tree.read(indexPath).toString();
  const $ = load(contents);
  // find the default component selector
  const element = $('my-component');
  // remove the default props
  element.removeAttr('first').removeAttr('last');
  // update the tage name
  element[0].tagName = 'gramener-' + schema.libraryName;
  tree.write(indexPath, $.html());
}

function normalizeSchema(
  schema: GramenerLibrarySchema,
): NormalizedGramenerLibrarySchema {
  const libraryName = names(schema.name).name;
  const libraryPath = joinPathFragments('libs', 'stencil', libraryName);
  const librarySourceRoot = joinPathFragments(libraryPath, 'src');

  return {
    ...schema,
    libraryName,
    libraryPath,
    librarySourceRoot,
  };
}

interface NormalizedGramenerLibrarySchema extends GramenerLibrarySchema {
  libraryName: string;
  libraryPath: string;
  librarySourceRoot: string;
}
