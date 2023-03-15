import {Act, ActFrontMatter} from '@game-guides/models';
import {join} from 'path';
import parseFrontMatter from 'front-matter';
import {marked} from 'marked';
import {getStepSummaries} from './steps';
import {readdir, readFile} from 'fs-extra';
import {getMarkdownDirectory} from './util';

export async function getActs(gameId: string): Promise<Act[]> {
  const markdownPath = getMarkdownDirectory(gameId);
  let actDir;

  try {
    actDir = await readdir(markdownPath);
  } catch (err) {
    const lambdaTaskRoot = process.env.LAMBDA_TASK_ROOT;
    const lambdaTaskRootContents = await readdir(process.env.LAMBDA_TASK_ROOT!);
    const dirContents = await readdir(__dirname)
    throw Error(`Error reading actDir: ${markdownPath}, MARKDOWN_PATH: ${process.env.MARKDOWN_PATH}, ${JSON.stringify({lambdaTaskRoot,lambdaTaskRootContents, dirContents})})}`)
  }

  return Promise.all(
    actDir.filter(dirName => dirName !== 'reference').map(async (dirName) => {
      return getAct(dirName, gameId);
    })
  );
}

export async function getAct(actId: string, gameId: string): Promise<Act> {
  const markdownPath = getMarkdownDirectory(gameId);
  const actIndex = await readFile(join(markdownPath, actId, 'index.md'));
  const {attributes, body} = parseFrontMatter<ActFrontMatter>(
    actIndex.toString('utf-8')
  );

  const stepSummaries = await getStepSummaries(actId, gameId);

  const completed = stepSummaries.reduce((acc, cur) => {
    if (!cur.completed) {
      return false;
    } else {
      return acc;
    }
  }, true);

  return {
    title: attributes.title,
    subtitle: attributes.subtitle,
    id: actId,
    contentMarkdown: body,
    contentHtml: marked(body),
    stepSummary: await getStepSummaries(actId, gameId),
    completed,
  };
}
