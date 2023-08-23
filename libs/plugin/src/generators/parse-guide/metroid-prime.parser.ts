import { Tree, workspaceRoot, names, joinPathFragments } from '@nx/devkit';
import { join } from 'path';
import { ParseGuideGeneratorSchema } from './schema';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';

interface Section {
  title: string;
  content?: string[];
  subsections?: Section[];
}

const sectionTitles = [
  'Unidentified distress signal....',
  'Speedy Recovery',
  'Exploring Extreme Temperatures',
  'Infiltrating the Mines',
  'Getting all the Artifacts',
  'Final Bout',
];

export default async function (tree: Tree, options: ParseGuideGeneratorSchema) {
  const rl = createInterface({
    input: createReadStream(join(workspaceRoot, options.file)),
  });

  const sections: Section[] = [];

  let currentSection: Section;
  let currentSubSection: Section;

  rl.on('line', (line) => {
    console.log(line);
    if (line.endsWith('/')) {
      const cleanLine = line.replace(/([ ]+\/)/, '');
      if (sectionTitles.includes(cleanLine)) {
        console.log('Starting section');
        if (currentSection !== undefined) {
          if (currentSubSection !== undefined) {
            currentSection.subsections.push(currentSubSection);
          }
          sections.push(currentSection);
        }

        currentSection = {
          title: cleanLine,
          subsections: [],
        };

        currentSubSection = { title: 'First Steps', content: [] };
      } else {
        console.log('Starting subsection');
        if (currentSubSection !== undefined) {
          currentSection.subsections.push(currentSubSection);
        }

        currentSubSection = {
          title: cleanLine,
          content: [],
        };
      }
    } else {
      currentSubSection.content.push(line);
    }
  });

  return new Promise<void>((resolve, reject) => {
    rl.on('close', () => {
      sections.forEach((section, sectionIndex) => {
        let safeSectionName = names(section.title).fileName.replaceAll('.', '');
        safeSectionName = `${sectionIndex}-${safeSectionName}`;
        const sectionIndexFileName = joinPathFragments(
          'apps/game-guides/app/data/metroid-prime-remastered/',
          safeSectionName,
          '/index.md'
        );
        const sectionContent = `---
title: ${section.title}
subtitle:
---

#### ${section.title}
`;

        tree.write(sectionIndexFileName, sectionContent);

        section.subsections.forEach((subsection, index) => {
          const safeSubSectionName = names(subsection.title)
            .fileName.replaceAll('.', '')
            .replaceAll('"', '')
            .replaceAll("'", '')
            .replaceAll('“', '')
            .replaceAll('”', '')
            .replaceAll('!', '');
          const subsectionFileName = joinPathFragments(
            'apps/game-guides/app/data/metroid-prime-remastered/',
            safeSectionName,
            '/steps',
            `${safeSubSectionName}.md`
          );
          const subSectionContent = `---
title: ${subsection.title}
order: ${index}
---

${subsection.content
  .map((line) => {
    if (line.startsWith('BOSS')) {
      return `**${line}**`;
    } else {
      return line;
    }
  })
  .join('\n')}
`;

          tree.write(subsectionFileName, subSectionContent);
        });

        console.log(section.title);

        section.subsections.forEach((subsection) => {
          console.log(`  ${subsection.title}`);
        });
      });
      resolve();
    });
  });
}
