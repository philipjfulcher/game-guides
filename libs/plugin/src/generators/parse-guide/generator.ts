import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree, workspaceRoot,
} from '@nrwl/devkit';
import * as path from 'path';
import {ParseGuideGeneratorSchema} from './schema';
import {createInterface} from "readline";
import {createReadStream} from "fs";
import {join} from "path";

type SectionKey =
  "intro" |
  "foreword" |
  "contents" |
  "faqs" |
  "socialLinkMechanism" |
  "importantThings" |
  "schedule" |
  "revisionHistory" |
  "support";

const sectionOrder: SectionKey[] = [
  "intro",
  "foreword",
  "contents",
  "faqs",
  "socialLinkMechanism",
  "importantThings",
  "schedule",
  "revisionHistory",
  "support"
];


export default async function (tree: Tree, options: ParseGuideGeneratorSchema) {
  const rl = createInterface({
    input: createReadStream(join(workspaceRoot, options.file)),
  });

  const sections: { [K in SectionKey]?: string[] } = {};
  const days: string[][] = [];
  let dayCount = -1;

  let sectionCount = -1;
  let currentSection: SectionKey = null;

  rl.on('line', (line) => {


    if ([null, 'intro', 'foreword', 'contents'].includes(currentSection) && line.startsWith('<>') && line.endsWith('<>')) {
      sectionCount++;
      currentSection = sectionOrder[sectionCount]
      console.log(currentSection)
    } else if (currentSection === 'schedule' && line.startsWith('<>-') && line.endsWith('-<>')) {
      dayCount++;

    } else if (currentSection === 'schedule') {
      if (days[dayCount]) {

        days[dayCount].push(line);
      } else {
        days[dayCount] = [line]
      }
    } else if (line.startsWith('<>[') && line.endsWith('-<>')) {

      sectionCount++;
      currentSection = sectionOrder[sectionCount]

    } else if (sections[currentSection]) {
      sections[currentSection].push(line);
    } else {
      sections[currentSection] = [line]
    }


  });

  return new Promise<void>((resolve, reject) => {
    rl.on('close', () => {
      const parsedDays = parseDays(days);
      console.log(parsedDays[3])
      resolve();
    });
  })
}

type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface Day {
  date: string,
  dayOfWeek: DayOfWeek;
  morningClass: string;
  notes: string;
  dayTime: string;
  bestAnswers: string;
  nightTime: string;
}

type DaySectionKey = keyof Day;

function parseDays(days: string[][]): Day[] {
  return days.map(day => {
    const dayLine = day.shift();
    const [date, dayOfWeek] = dayLine.split(', ');
    let parsedDay: Day = {
      date,
      dayOfWeek: dayOfWeek as DayOfWeek,
      notes: '',
      dayTime: '',
      bestAnswers: '',
      nightTime: '',
      morningClass: ''
    };

    let currentSection: DaySectionKey;

    day.forEach(line => {
      if (line.startsWith('Morning class: ')) {
        currentSection = 'morningClass';
      } else if (line.startsWith('Day time: ')) {
        currentSection = 'dayTime';
      } else if (line.startsWith('Night time: ')) {
        currentSection = 'nightTime'
      } else if (line.startsWith('Notes for today: ')) {
        currentSection = 'notes';
      }

      parsedDay[currentSection] += line;
    })

    parsedDay = {
      ...parsedDay,
      morningClass: parsedDay.morningClass.replace('Morning class: ', '').replaceAll('  ', ' '),
      notes: parsedDay.notes.replace('Notes for today: ', '').replaceAll('  ', ' ')

    }

    return parsedDay;
  })
}
