import { getMarkdownDirectory } from '@game-guides/data-access';
import { readFile } from 'fs-extra';
import { join } from 'path';

export async function getDate(date: string) {
  const markdownPath = getMarkdownDirectory('persona-3');
  try {
    const dateData = await readFile(join(markdownPath, `${date}.json`));
    return JSON.parse(dateData.toString('utf-8'));
  } catch {
    return null;
  }
}
