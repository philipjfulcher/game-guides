import { getMarkdownDirectory } from '@game-guides/data-access';
import { readFile } from 'fs-extra';
import { join } from 'path';
import { marked } from 'marked';

export async function getDate(date: string) {
  const markdownPath = getMarkdownDirectory('persona-3');
  const newMarkdownPath = getMarkdownDirectory('persona-3-new');
  try {
    const dateData = await readFile(join(markdownPath, `${date}.json`));
    const dateContent = await readFile(join(newMarkdownPath, `${date}.md`));

    return {
      ...JSON.parse(dateData.toString('utf-8')),
      htmlContent: marked(dateContent.toString('utf-8')),
    };
  } catch {
    return null;
  }
}
