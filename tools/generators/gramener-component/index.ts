import {
  generateFiles,
  joinPathFragments,
  names,
  readProjectConfiguration,
  Tree,
} from '@nrwl/devkit';
import { GramenerComponentSchema } from './schema';

export default async function gramenerComponentGenerator(
  tree: Tree,
  schema: GramenerComponentSchema,
): Promise<void> {
  const normalizedSchema = normalizeSchema(schema);
  await generateComponent(tree, normalizedSchema);

  // update the components.d.ts to export the component
  updateExportFile(tree, schema);
}

function normalizeSchema(
  schema: GramenerComponentSchema,
): NormalizedGramenerComponentSchema {
  const componentName = names(schema.name).name;
  const componentTag = `gramener-` + componentName;
  const componentFileName = names(schema.name).fileName;
  const className = names(schema.name).className;
  return {
    ...schema,
    componentTag,
    componentName,
    componentFileName,
    className,
  };
}

function updateExportFile(tree: Tree, schema: GramenerComponentSchema) {
  const projectConfig = readProjectConfiguration(tree, schema.project);

  const componentExportPath = joinPathFragments(
    projectConfig.sourceRoot,
    'components.d.ts',
  );

  const componentExport = [
    ...tree.read(componentExportPath).toString().split('\n'),
    `export * from './components/${schema.name}/${schema.name}';`,
  ].join('\n');

  tree.write(componentExportPath, componentExport);
}

async function generateComponent(
  tree: Tree,
  schema: NormalizedGramenerComponentSchema,
) {
  const projectConfig = readProjectConfiguration(tree, schema.project);

  generateFiles(
    tree,
    joinPathFragments(__dirname, './files/component'),
    joinPathFragments(
      `${projectConfig.sourceRoot}/components/${schema.componentName}`,
    ),
    schema,
  );
}

interface NormalizedGramenerComponentSchema extends GramenerComponentSchema {
  componentName: string;
  componentTag: string;
  componentFileName: string;
  className: string;
}
