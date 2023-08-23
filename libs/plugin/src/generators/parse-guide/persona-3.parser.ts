import { Tree, workspaceRoot, writeJson } from '@nx/devkit';
import { join } from 'path';
import { ParseGuideGeneratorSchema } from './schema';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';

type SectionKey =
  | 'intro'
  | 'foreword'
  | 'contents'
  | 'faqs'
  | 'socialLinkMechanism'
  | 'importantThings'
  | 'schedule'
  | 'revisionHistory'
  | 'support';

const sectionOrder: SectionKey[] = [
  'intro',
  'foreword',
  'contents',
  'faqs',
  'socialLinkMechanism',
  'importantThings',
  'schedule',
  'revisionHistory',
  'support',
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
    if (
      [null, 'intro', 'foreword', 'contents'].includes(currentSection) &&
      line.startsWith('<>') &&
      line.endsWith('<>')
    ) {
      sectionCount++;
      currentSection = sectionOrder[sectionCount];
      console.log(currentSection);
    } else if (
      currentSection === 'schedule' &&
      line.startsWith('<>-') &&
      line.endsWith('-<>')
    ) {
      dayCount++;
    } else if (currentSection === 'schedule') {
      if (days[dayCount]) {
        days[dayCount].push(line);
      } else {
        days[dayCount] = [line];
      }
    } else if (line.startsWith('<>[') && line.endsWith('-<>')) {
      sectionCount++;
      currentSection = sectionOrder[sectionCount];
    } else if (sections[currentSection]) {
      sections[currentSection].push(line);
    } else {
      sections[currentSection] = [line];
    }
  });

  return new Promise<void>((resolve, reject) => {
    rl.on('close', () => {
      const parsedDays = parseDays(days);
      parsedDays.forEach((day) => {
        const dateComponents = day.date
          .split('/')
          .map((dateComp) =>
            dateComp.length === 1 ? `0${dateComp}` : dateComp
          );
        const date = `${dateComponents[2]}-${dateComponents[0]}-${dateComponents[1]}`;
        writeJson(
          tree,
          `apps/game-guides/app/data/markdown/persona-3/${date}.json`,
          day
        );
      });
      resolve();
    });
  });
}

type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface DayPeriod {
  activity: string;
  bestAnswers: string;
  pointsForNextRank: string;
  pointsGotToday: string;
}

interface Day {
  date: string;
  dayOfWeek: DayOfWeek;
  notes: string;
  morningClass: string;
  dayTime: DayPeriod;
  nightTime: DayPeriod;
}

type DaySectionKey = keyof Day;
type DayPeriodKey = keyof DayPeriod;

function parseDays(days: string[][]): Day[] {
  return days.map((day) => {
    const dayLine = day.shift();
    const [date, dayOfWeek] = dayLine.split(', ');
    let parsedDay: Day = {
      date: date.endsWith('2011')
        ? date.replace('2011', '2010')
        : `${date}/2009`,
      dayOfWeek: dayOfWeek as DayOfWeek,
      notes: '',
      dayTime: {
        activity: '',
        bestAnswers: '',
        pointsForNextRank: '0',
        pointsGotToday: '0',
      },
      nightTime: {
        activity: '',
        bestAnswers: '',
        pointsForNextRank: '0',
        pointsGotToday: '0',
      },
      morningClass: '',
    };

    let currentSection: DaySectionKey;
    let currentPeriodSection: DayPeriodKey;
    let dayOrNight: 'dayTime' | 'nightTime' = 'dayTime';
    let cleanLine = '';

    day.forEach((line) => {
      if (line.startsWith('Morning class: ')) {
        currentSection = 'morningClass';
        cleanLine = line.replace('Morning class: ', '');
      } else if (line.startsWith('Day time: ')) {
        currentSection = 'dayTime';
        currentPeriodSection = 'activity';
        dayOrNight = 'dayTime';
        cleanLine = line.replace('Day time: ', '');
      } else if (line.startsWith('Night time: ')) {
        currentSection = 'nightTime';
        currentPeriodSection = 'activity';
        cleanLine = line.replace('Night time: ', '');

        dayOrNight = 'nightTime';
      } else if (line.startsWith('Notes for today: ')) {
        currentSection = 'notes';
        cleanLine = line.replace('Notes for today: ', '');
      } else if (line.startsWith('Best answers: ')) {
        currentPeriodSection = 'bestAnswers';
        cleanLine = line.replace('Best answers: ', '');
      } else if (line.startsWith('Points required for next rank: ')) {
        currentPeriodSection = 'pointsForNextRank';
        cleanLine = line.replace('Points required for next rank: ', '');
      } else if (line.startsWith('Points got today: ')) {
        currentPeriodSection = 'pointsGotToday';
        cleanLine = line.replace('Points got today: ', '');
      } else {
        cleanLine = line.trim();
      }

      if (currentSection === 'dayTime' || currentSection === 'nightTime') {
        parsedDay[dayOrNight][currentPeriodSection] = cleanLine;
      } else {
        parsedDay[currentSection] +=
          parsedDay[currentSection] === '' ? cleanLine : ` ${cleanLine}`;
      }
    });

    return parsedDay;
  });
}
