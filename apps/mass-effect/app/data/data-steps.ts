import { join } from 'path';
import { readdir, readFile } from 'fs/promises';
import parseFrontMatter from 'front-matter';
import { marked } from 'marked';
import prisma from "~/data/db";

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
  completed: boolean;
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
  substeps: Step[];
  completed: boolean;
  actId: string;
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
        const trimmedStepId = stepId.replace('.md', '');
        const step = await getStep(actId, trimmedStepId, true);


        return {
          order: step.order,
          id: step.id,
          automatic: step.automatic,
          optional: step.optional,
          title: step.title,
          parent: step.parent,
          completed: !!(await prisma.completedStep.findFirst({where: {stepId: trimmedStepId,actId}}))
        };
      })
    ).then(steps => {
      return steps.filter(step => !step.parent)
    });
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
    parent: attributes?.parent,
    completed: !!(await prisma.completedStep.findFirst({where: {stepId,actId}})),
    actId
  };
}

export async function getSubSteps(actId: string, stepId: string): Promise<Step[]> {

  const stepsDir = await readdir(join(actsPath, actId, 'steps'));

  const substeps = await Promise.all(
      stepsDir.map(async (subStepId: string) => {

        const step = await getStep(actId, subStepId.replace('.md', ''), false);

        if(step?.parent && step.parent === stepId) {

          return step;
        } else {

          return null;
        }

      })
  );

  const filteredSubsteps = substeps.filter(substep => substep !== null) as Step[];


  return filteredSubsteps;

}
