import { join } from 'path';
import { readdir } from 'fs/promises';

interface Act {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

interface Step {
  order: number;
  title: string;
  contentMarkdown: string;
  contentHtml: string;
}

const actsPath = join(__dirname, '../acts');

export async function getActs(): Promise<Act[]> {
  const dir = await readdir(actsPath);

  return Promise.all(
    dir.map(async (filename) => {
      return {
        title: 'title',
        subtitle: 'subtitle',
        id: 'whatever',
        content: 'something here',
      };
    })
  );
}

export function getAct(id: string): Act {
  return {
    title: 'title',
    subtitle: 'subtitle',
    id,
    content: 'something here',
  };
}
