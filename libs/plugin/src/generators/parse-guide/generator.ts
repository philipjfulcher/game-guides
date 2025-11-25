import { Tree } from '@nx/devkit';
import { ParseGuideGeneratorSchema } from './schema';
import Persona3Parser from './persona-3.parser';
import MetroidPrimeParser from './metroid-prime.parser';
import KHBBSParser from './kh-bbs.parser';
import NewPersona3Parser from './new-persona-3.parser';
import DQ1Parser from './dq1.parser';
import p3reloadParser from './persona-3-reload';

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

    case 'guides/dragon-quest-1.txt':
      return DQ1Parser(tree, options, 'dq1');

    case 'guides/dragon-quest-2.txt':
      return DQ1Parser(tree, options, 'dq2');

    case 'p3reload':
      return p3reloadParser(tree, options);

    default:
      throw Error('Could not find parser for file');
  }
}
