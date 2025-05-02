import {Tree, workspaceRoot, names, joinPathFragments} from '@nx/devkit';
import {join} from 'path';
import {ParseGuideGeneratorSchema} from './schema';
import {createInterface} from 'readline';
import {createReadStream} from 'fs';

interface Section {
  title: string;
  content?: string[];
  subsections?: Section[];
}

const sectionTitles = [
  'Act 1',
  'Act 2',
  'Act 3',
  'Act 4',
  'Act 5',
  'Act 6',
];

export default async function (tree: Tree, options: ParseGuideGeneratorSchema, markdownDir: string) {
  const rl = createInterface({
    input: createReadStream(join(workspaceRoot, options.file)),
  });

  const sections: Section[] = [];

  let currentSection: Section;
  let currentSubSection: Section;

  rl.on('line', (line) => {
    // console.log(line);

    if (line.startsWith('<<')) {
      let cleanLine = line.match(/^<<[-]+[ivxl]+. (.*) \[/)[1];
      cleanLine = cleanLine.replaceAll(':','').replaceAll(' (OPTIONAL)','');
      if (!currentSection || currentSubSection.title.startsWith('GRIND')) {
        console.log(`Starting section ${sectionTitles[sections.length]}`);
        if (currentSection !== undefined) {
          if (currentSubSection !== undefined) {
            currentSection.subsections.push(currentSubSection);
          }
          sections.push(currentSection);
        }

        currentSection = {
          title: sectionTitles[sections.length],
          subsections: [],
        };

        currentSubSection = {title: cleanLine, content: []};
      } else {
        console.log(`Starting subsection ${cleanLine}`);
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
      currentSection.subsections.push(currentSubSection);
      sections.push(currentSection)

      sections.forEach((section, sectionIndex) => {
        let safeSectionName = names(section.title).fileName.replaceAll('.', '');
        safeSectionName = `${sectionIndex}-${safeSectionName}`;
        console.log(`Creating ${safeSectionName}`)
        const sectionIndexFileName = joinPathFragments(
          `apps/game-guides/app/data/markdown/${markdownDir}/`,
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
            `apps/game-guides/app/data/markdown/${markdownDir}/`,
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
              if (line.startsWith(' _')) {
                return `\`\`\`\n${line}`;
              } else if (line.startsWith('\\_')) {
                return `${line}\n\`\`\``;
              } else if(line.startsWith('Floor ')) {
                return `**${line}**`
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
