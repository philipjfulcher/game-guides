import {Act, ActFrontMatter} from '@game-guides/models';
import {join} from 'path';
import parseFrontMatter from 'front-matter';
import {marked} from 'marked';
import {getStepSummaries} from './steps';
import {readdir, readFile} from 'fs-extra';
import {getMarkdownDirectory} from './util';
import {SimpleInMemoryCache} from "./simple-in-memory-cache";

export async function fetchActs(gameId: string): Promise<Act[]> {
  const markdownPath = getMarkdownDirectory(gameId);
  let actDir;

  actDir = await readdir(markdownPath);

  return Promise.all(
    actDir.map(async (dirName) => {
      return fetchAct(dirName, gameId);
    })
  );
}

const ActsCache = new SimpleInMemoryCache<Act[]>();


export async function getActs(gameId: string): Promise<Act[]> {
  let acts = ActsCache.get(gameId);

  if (!acts) {
    acts = await fetchActs(gameId);
    ActsCache.set(gameId, acts, Date.now() + (24 * 60 * 60 * 1000));
  }

  return acts;
}

export async function getAct(actId: string, gameId: string): Promise<Act> {
  const acts = await getActs(gameId);
  return acts.find(act => act.id === actId)!;
}

export async function fetchAct(actId: string, gameId: string): Promise<Act> {
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
