import { Act, ActFrontMatter } from "@mass-effect/mass-effect/models";
import { join } from "path";
import parseFrontMatter from "front-matter";
import { marked } from "marked";
import { getStepSummaries } from "./steps";
import { readdir, readFile } from "fs-extra";

export async function getActs(): Promise<Act[]> {
  const markdownPath = join(__dirname, 'markdown');

  console.log({markdownPath,process: process.cwd(), file: __filename, dir: __dirname, boo: 'boo'})
  const actDir = await readdir(markdownPath);

  return Promise.all(
    actDir.map(async (dirName) => {
      return getAct(dirName);
    })
  );
}

export async function getAct(actId: string): Promise<Act> {
  const markdownPath = join(__dirname, 'markdown');

  const actIndex = await readFile(join(markdownPath, actId, "index.md"));
  const { attributes, body } = parseFrontMatter<ActFrontMatter>(
    actIndex.toString("utf-8")
  );

  const stepSummaries = await getStepSummaries(actId);

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
    stepSummary: await getStepSummaries(actId),
    completed
  };
}
