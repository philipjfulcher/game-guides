import {Tree, workspaceRoot, names, joinPathFragments} from "@nrwl/devkit";
import {join} from "path";
import {ParseGuideGeneratorSchema} from "./schema";
import {createInterface} from "readline";
import {createReadStream} from "fs";

interface Act {
  title: string;
  id: number;
  steps: Step[];
}

interface Step {
  title: string;
  id: number;
  content: string[]
}

const referenceIdRecord: Record<number, string> = {
  1100: "Introduction",
  1200: "Basics",
  1300: "Characters",
  1700: "Mini-Games",
  1800: "Mirage Arena",
  1900: "Bestiary",
  2001: "Terra's Reports",
  2002: "Ventus' Reports",
  2003: "Aqua's Reports",
  2004: "Trophies",
  2005: "Command Melding",
  2006: "Keyblades",
  2007: "Prize Pod Locations",
};

const referenceIds = Object.keys(referenceIdRecord);

const actIdRecord = {
  1400: "Terra's Story",
  1500: "Ventus' Story",
  1600: "Aqua's Story"
}

const actIds = Object.keys(actIdRecord);

const stepIdRecord = {
  1400: {
    1401: "Enchanted Dominion",
    1402: "Castle of Dreams",
    1403: "Dwarf Woodlands",
    1404: "Mysterious Tower",
    1405: "Radiant Garden",
    1406: "Disney Town",
    1407: "Olympus Coliseum",
    1408: "Deep Space",
    1409: "Never Land",
    1410: "Badlands",
    1411: "Side Questing",
    1412: "Keyblade Graveyard",
  },
  1500: {
    1501: "Dwarf Woodlands",
    1502: "Castle of Dreams",
    1503: "Enchanted Dominion",
    1504: "Radiant Garden",
    1505: "Disney Town",
    1506: "Olympus Coliseum",
    1507: "Deep Space",
    1508: "Never Land",
    1509: "Mysterious Tower",
    1510: "Side Questing",
    1511: "Keyblade Graveyard",
  },
  1600: {
    1601: "Castle of Dreams",
    1602: "Dwarf Woodlands",
    1603: "Enchanted Dominion",
    1604: "Radiant Garden",
    1605: "Disney Town",
    1606: "Olympus Coliseum",
    1607: "Deep Space",
    1608: "Never Land",
    1609: "Mysterious Tower",
    1610: "Side Questing",
    1611: "Keyblade Graveyard",
    1612: "Final Episode",
    1613: "Secret Episode",
    1614: "Secret Bosses",
  }
};

const stepIds = Object.keys(stepIdRecord).map(actId => Object.keys(stepIdRecord[actId])).flat();

const forbiddenLines: string[] = [
  "               _______________________________________________",
  "              |-----------------------------------------------|",
  "               ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯",
  "        ______________________________________________________________",
  "        ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯",
  "        ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯"
];

const replacementLines: [string, string][] = [
  [
    "              |===============================================|",
    "              |-----------------------------------------------|"
  ],
  [
    " _____________________________________________________________________________",
    "```"
  ],
  [
    " ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯",
    "```"
  ]
]
export default async function (tree: Tree, options: ParseGuideGeneratorSchema) {
  const rl = createInterface({
    input: createReadStream(join(workspaceRoot, options.file))
  });

  const acts: Act[] = [];

  let currentAct: Act;
  let currentStep: Step;
  const referenceAct: Act = {
    id: 1,
    title: "Reference",
    steps: []
  }

  rl.on("line", (line) => {
    const lineHasId = line.match(/\[(\d{4})\]/);

    if (lineHasId && lineHasId[1] && actIds.includes(lineHasId[1])) {
      console.log("Starting act", currentAct?.id, lineHasId[1]);
      if (currentAct !== undefined) {
        if (currentStep !== undefined) {
          currentAct.steps.push(currentStep);
        }
        if (currentAct.id !== 1) {
          acts.push(currentAct);
        }
      }

      currentAct = {
        id: Number.parseInt(lineHasId[1], 10),
        title: actIdRecord[lineHasId[1]],
        steps: []
      };

      currentStep = {
        id: 1,
        title: 'First steps',
        content: []
      };

    } else if (lineHasId && lineHasId[1] && referenceIds.includes(lineHasId[1])) {
      console.log("Starting reference");

      if (currentStep !== undefined) {
        currentAct.steps.push(currentStep);
      }
      if (currentAct && currentAct.id !== 1) {
        acts.push(currentAct);
      }
      const id = Number.parseInt(lineHasId[1], 10);

      currentStep = {
        id,
        title: referenceIdRecord[id],
        content: []
      };

      currentAct = referenceAct;
    } else if (lineHasId && lineHasId[1] && stepIds.includes(lineHasId[1])) {
      // console.log("Starting step");
      if (currentStep !== undefined) {
        currentAct.steps.push(currentStep);
      }
      const id = Number.parseInt(lineHasId[1], 10);

      currentStep = {
        id,
        title: stepIdRecord[currentAct.id][id],
        content: []
      };
    } else if (currentStep) {
      currentStep.content.push(line)
    }


  });

  return new Promise<void>((resolve, reject) => {
    rl.on("close", () => {
      currentAct.steps.push(currentStep);
      if (currentAct.id !== 1) {
        acts.push(currentAct);
      }
      acts.push(referenceAct);
      acts.forEach((section, sectionIndex) => {
        let safeSectionName = names(section.title).fileName.replaceAll(".", "").replaceAll("\"", "").replaceAll("'", "").replaceAll("“", '').replaceAll("”", '').replaceAll('!', '');

        safeSectionName = section.id === 1 ? 'reference' : `${sectionIndex}-${safeSectionName}`;
        const sectionIndexFileName = joinPathFragments("apps/game-guides/app/data/markdown/kh-bbs/", safeSectionName, "/index.md");
        const sectionContent =
          `---
title: ${section.title}
subtitle:
---

#### ${section.title}
`;

        tree.write(sectionIndexFileName, sectionContent);

        section.steps.forEach((subsection, index) => {
          const safeSubSectionName = names(subsection.title).fileName.replaceAll(".", "").replaceAll("\"", "").replaceAll("'", "").replaceAll("“", '').replaceAll("”", '').replaceAll('!', '');
          const subsectionFileName = joinPathFragments("apps/game-guides/app/data/markdown/kh-bbs/", safeSectionName, "/steps", `${safeSubSectionName}.md`);
          const subSectionContent =
            `---
title: ${subsection.title}
order: ${index}
---

${subsection.content.map((line, index) => {

              if (subsection.content[index+1] && subsection.content[index+1].trim().startsWith('¯') && line.trim().length === subsection.content[index+1].trim().length) {
                return `## ${line} ##`;
              } else if (line.trim().startsWith('¯') && line.trim().length === subsection.content[index-1].trim().length) {
                return '';
              } else {
                return line;
              }
            }).map(line => {
              if (forbiddenLines.includes(line)) {
                return "\n"
              } else {
                return line;
              }
            }).map(line => {
              if(line.startsWith('       |')) {
                return line.replaceAll('|','').replaceAll(/ {2,}/g,'')
              } else {
                return line;
              }
            }).map(line => {
              let newLine = line;
              replacementLines.forEach(([lineToReplace, replacement]) => {
                if (line === lineToReplace) {
                  newLine = replacement;
                }
              })

              return newLine;
            }).map(line => {
              if (line.startsWith('        [ ] ') || line.startsWith('        • ')) {
                return line.replaceAll(/ {2,}/g, "\n").replaceAll('[ ]', "* ").replaceAll('•', '*');
              } else {
                return line;
              }
            }).map(line => {
              return line.replaceAll('•', '*')
            }).map(line => line.trim()).join("\n")}
`;

          tree.write(subsectionFileName, subSectionContent);

        });

        console.log(section.title);

        section.steps.forEach(subsection => {
          console.log(`  ${subsection.title}`);
        });
      });
      resolve();
    });
  });
}
