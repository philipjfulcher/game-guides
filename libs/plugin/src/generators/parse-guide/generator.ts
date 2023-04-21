import { Tree, workspaceRoot } from '@nrwl/devkit';
import { ParseGuideGeneratorSchema } from './schema';
import Persona3Parser from './persona-3.parser';
import MetroidPrimeParser from './metroid-prime.parser';
import KHBBSParser from './kh-bbs.parser';
import NewPersona3Parser from './new-persona-3.parser';

export default async function (tree: Tree, options: ParseGuideGeneratorSchema) {
  switch (options.file) {
    case 'guides/persona-3-portable-male.txt':
      return Persona3Parser(tree, options);

    case 'guides/persona-3-portable.md':
      return NewPersona3Parser(tree, options);

    case 'guides/metroid-prime.txt':
      return MetroidPrimeParser(tree, options);

    case 'guides/kingdom-hearts-birth-by-sleep.txt':
      return KHBBSParser(tree, options);

    default:
      throw Error('Could not find parser for file');
  }
}
