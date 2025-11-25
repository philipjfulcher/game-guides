import { Tree, workspaceRoot, writeJson } from '@nx/devkit';
import { join } from 'path';
import { ParseGuideGeneratorSchema } from './schema';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';

const months = [
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
  'january',
];

const regexSimple =
  /^\*\*(1[0-2]|[1-9])\/(3[01]|[12][0-9]|[1-9])\s+([A-Za-z]+)\*\*/i;

export default async function (tree: Tree, options: ParseGuideGeneratorSchema) {
  const promises = Promise.all(
    months.map((monthToRead) => {
      console.log(
        `reading ${join(
          workspaceRoot,
          'guides',
          'persona-3-reload',
          'months',
          `${monthToRead}.md`
        )}`
      );
      const rl = createInterface({
        input: createReadStream(
          join(
            workspaceRoot,
            'guides',
            'persona-3-reload',
            'months',
            `${monthToRead}.md`
          )
        ),
      });

      let currentDate: string;
      let currentContent: string;

      rl.on('line', (line) => {
        const m = line.match(regexSimple);
        if (m) {
          const month = m[1].length === 1 ? `0${m[1]}` : m[1]; // "12"
          const day = m[2].length === 1 ? `0${m[2]}` : m[2]; // "12"

          const year = Number.parseInt(month, 10) < 4 ? '2010' : '2009';

          currentDate = `${year}-${month}-${day}`;
          currentContent = '';
        } else if (line === '---') {
          tree.write(
            `apps/game-guides-astro/src/guides/persona-3-reload/months/${currentDate}.md`,
            currentContent
          );
        } else {
          currentContent += `${line}\n`;
        }
      });

      return new Promise<void>((resolve, reject) => {
        rl.on('close', () => {
          console.log(`resolving ${monthToRead}`);
          resolve();
        });
      });
    })
  );

  return promises;
}
