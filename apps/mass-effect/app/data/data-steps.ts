import { join } from 'path';
import { readdir, readFile } from 'fs/promises';
import parseFrontMatter from 'front-matter';
import { marked } from 'marked';

interface ActFrontMatter {
  title: string;
  subtitle?: string;
}

export interface Act extends ActFrontMatter {
  id: string;
  contentMarkdown: string;
  contentHtml: string;
  stepSummary: StepSummary[];
}

interface StepFrontmatter {
  order: string;
  title: string;
  optional?: string;
  automatic?: string;
  parent?: string;
}

interface StepSummary {
  id: string;
  order: number;
  title: string;
  optional: boolean;
  automatic: boolean;
}

export interface Step {
  id: string;
  contentMarkdown: string;
  contentHtml: string;
  order: number;
  title: string;
  optional: boolean;
  automatic: boolean;
  parent?: string;
  substeps: Step[]
}

const actsPath = join(__dirname, '../app/data/acts');

export async function getActs(): Promise<Act[]> {
  const actDir = await readdir(actsPath);

  return Promise.all(
    actDir.map(async (dirName) => {
      return getAct(dirName);
    })
  );
}

export async function getAct(actId: string): Promise<Act> {
  const actIndex = await readFile(join(actsPath, actId, 'index.md'));
  const { attributes, body } = parseFrontMatter<ActFrontMatter>(
    actIndex.toString('utf-8')
  );

  return {
    title: attributes.title,
    subtitle: attributes.subtitle,
    id: actId,
    contentMarkdown: body,
    contentHtml: marked(body),
    stepSummary: await getStepSummaries(actId),
  };
}

export async function getStepSummaries(actId: string): Promise<StepSummary[]> {
  try {
    const stepsDir = await readdir(join(actsPath, actId, 'steps'));

    return Promise.all(
      stepsDir.map(async (stepId: string) => {
        const step = await getStep(actId, stepId.replace('.md', ''), true);

        return {
          order: step.order,
          id: step.id,
          automatic: step.automatic,
          optional: step.optional,
          title: step.title,
        };
      })
    );
  } catch (e) {
    return Promise.resolve([]);
  }
}

export async function getStep(actId: string, stepId: string, findSubSteps: boolean): Promise<Step> {
  const stepFile = await readFile(
    join(actsPath, actId, 'steps', `${stepId}.md`)
  );

  const { attributes, body } = parseFrontMatter<StepFrontmatter>(
    stepFile.toString('utf-8')
  );

  return {
    title: attributes.title,
    id: stepId,
    contentMarkdown: body,
    contentHtml: marked(body),
    automatic: attributes?.automatic === 'true' ?? false,
    optional: attributes?.optional === 'true' ?? false,
    order: parseInt(attributes.order, 10),
    substeps: findSubSteps ? await getSubSteps(actId, stepId) : [],
    parent: attributes?.parent
  };
}

export async function getSubSteps(actId: string, stepId: string): Promise<Step[]> {
  if(stepId === 'recruit-the-assassin-and-the-justicar') {
    console.log(`getting substeps for ${actId},${stepId}`);
  }
  const stepsDir = await readdir(join(actsPath, actId, 'steps'));

  const substeps = await Promise.all(
      stepsDir.map(async (subStepId: string) => {
        if(stepId === 'recruit-the-assassin-and-the-justicar') {
          console.log(`Checking ${subStepId}`);
        }
        const step = await getStep(actId, subStepId.replace('.md', ''), false);

        if(step?.parent && step.parent === stepId) {
          if(stepId === 'recruit-the-assassin-and-the-justicar') {
            console.log(`${step.id} is a substep of ${stepId}`);
          }
          return step;
        } else {
          if(stepId === 'recruit-the-assassin-and-the-justicar') {
            console.log(`${step.id} is not a substep of ${stepId}`);
          }
          return null;
        }

      })
  );

  const filteredSubsteps = substeps.filter(substep => substep !== null) as Step[];

  // console.log(filteredSubsteps);

  return filteredSubsteps;

}
