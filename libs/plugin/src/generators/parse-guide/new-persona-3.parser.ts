import { Tree, workspaceRoot, writeJson } from '@nx/devkit';
import { join } from 'path';
import { ParseGuideGeneratorSchema } from './schema';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';

export default async function (tree: Tree, options: ParseGuideGeneratorSchema) {
  const rl = createInterface({
    input: createReadStream(join(workspaceRoot, options.file)),
  });

  let currentDate: string;
  let currentContent: string;

  rl.on('line', (line) => {
    if (line.startsWith('**')) {
      if (currentDate !== undefined) {
        const [month, day] = currentDate
          .split('/')
          .map((dateComp) =>
            dateComp.length === 1 ? `0${dateComp}` : dateComp
          );
        const year = Number.parseInt(month, 10) < 4 ? '2010' : '2009';
        const fileName = `${year}-${month}-${day}`;
        tree.write(
          `apps/game-guides/app/data/markdown/persona-3-new/${fileName}.md`,
          currentContent
        );
      }
      currentDate = line.match(/\d+\/\d+/)[0];
      currentContent = '';
    } else {
      currentContent += `${line}\n`;
    }
  });

  return new Promise<void>((resolve, reject) => {
    rl.on('close', () => {
      resolve();
    });
  });
}
