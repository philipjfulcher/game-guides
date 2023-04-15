import { Step, StepFrontmatter, StepSummary } from '@game-guides/models';
import { readdir, readFile } from 'fs-extra';
import { join } from 'path';
import parseFrontMatter from 'front-matter';
import { marked } from 'marked';
import { getActs } from './acts';
import { getMarkdownDirectory } from './util';
import { SupabaseClient } from '@supabase/auth-helpers-remix';
import { Database } from '@game-guides/data-access';
import { SimpleInMemoryCache } from './simple-in-memory-cache';

const StepSummaryCache = new SimpleInMemoryCache<StepSummary[]>();

export async function getStepSummaries(
  actId: string,
  gameId: string
): Promise<StepSummary[]> {
  const cacheKey = `${gameId}-${actId}`;
  let stepSummaries = StepSummaryCache.get(cacheKey);

  if (!stepSummaries) {
    stepSummaries = await fetchStepSummaries(actId, gameId);
    StepSummaryCache.set(
      cacheKey,
      stepSummaries,
      Date.now() + 24 * 60 * 60 * 1000
    );
  }

  return stepSummaries;
}

export async function fetchStepSummaries(
  actId: string,
  gameId: string
): Promise<StepSummary[]> {
  try {
    const markdownPath = getMarkdownDirectory(gameId);

    const stepsDir = await readdir(join(markdownPath, actId, 'steps'));

    return Promise.all(
      stepsDir.map(async (stepId: string) => {
        const trimmedStepId = stepId.replace('.md', '');
        const step = await getStep(actId, trimmedStepId, true, gameId);
        return {
          order: step.order,
          id: step.id,
          actId,
          automatic: step.automatic,
          optional: step.optional,
          title: step.title,
          parent: step.parent,
          completed: false,
        };
      })
    ).then((steps) => {
      return steps.filter((step) => !step.parent);
    });
  } catch (e) {
    return Promise.resolve([]);
  }
}

const StepCache = new SimpleInMemoryCache<Step>();

export async function getStep(
  actId: string,
  stepId: string,
  findSubSteps: boolean,
  gameId: string
): Promise<Step> {
  const cacheKey = `${gameId}-${actId}-${stepId}-${findSubSteps.toString()}`;
  let step = StepCache.get(cacheKey);

  if (!step) {
    step = await fetchStep(actId, stepId, findSubSteps, gameId);
    StepCache.set(cacheKey, step, Date.now() + 24 * 60 * 60 * 1000);
  }

  return step;
}

export async function fetchStep(
  actId: string,
  stepId: string,
  findSubSteps: boolean,
  gameId: string
): Promise<Step> {
  const markdownPath = getMarkdownDirectory(gameId);

  const stepFile = await readFile(
    join(markdownPath, actId, 'steps', `${stepId}.md`)
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
    substeps: findSubSteps ? await getSubSteps(actId, stepId, gameId) : [],
    parent: attributes?.parent,
    completed: false,
    actId,
  };
}

export async function getSubSteps(
  actId: string,
  stepId: string,
  gameId: string
): Promise<Step[]> {
  const markdownPath = getMarkdownDirectory(gameId);

  const stepsDir = await readdir(join(markdownPath, actId, 'steps'));

  const substeps = await Promise.all(
    stepsDir.map(async (subStepId: string) => {
      const step = await getStep(
        actId,
        subStepId.replace('.md', ''),
        false,
        gameId
      );

      if (step?.parent && step.parent === stepId) {
        return step;
      } else {
        return null;
      }
    })
  );

  const filteredSubsteps = substeps.filter(
    (substep) => substep !== null
  ) as Step[];

  return filteredSubsteps;
}

export async function getCurrentStep(
  gameId: string,
  supabase: SupabaseClient<Database>
): Promise<{
  actId: string;
  stepId: string;
}> {
  const lastCreatedStepResult = await supabase
    .from('completed_steps')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })
    .limit(1);

  const lastCreatedStep = lastCreatedStepResult.data?.[0];

  if (lastCreatedStep) {
    const [actId, stepId] = lastCreatedStep.step_id.split(':');
    const acts = await getActs(gameId);
    const currentActIndex = acts.findIndex(
      (actToCheck) => actToCheck.id === actId
    );
    const act = acts[currentActIndex];
    const nextActIndex = currentActIndex + 1;
    const nextAct = acts[nextActIndex];

    if (act.completed) {
      const orderedSummaries = nextAct.stepSummary.sort(
        (a, b) => a.order - b.order
      );

      return { actId: nextAct.id, stepId: orderedSummaries[0].id };
    } else {
      const orderedSummaries = act.stepSummary.sort(
        (a, b) => a.order - b.order
      );
      const lastCompletedStepIndex = orderedSummaries.findIndex(
        (summary) => summary.id === stepId
      );

      if (lastCompletedStepIndex + 1 >= orderedSummaries.length && nextAct) {
        const orderedSummaries = nextAct.stepSummary.sort(
          (a, b) => a.order - b.order
        );

        return { actId: nextAct.id, stepId: orderedSummaries[0].id };
      } else if (nextAct) {
        const nextStepId = orderedSummaries[lastCompletedStepIndex + 1].id;

        return { actId: act.id, stepId: nextStepId };
      } else {
        const firstAct = (await getActs(gameId))[0];
        const orderedSummaries = firstAct.stepSummary.sort(
          (a, b) => a.order - b.order
        );

        const firstStep = orderedSummaries[0];
        return { actId: firstAct.id, stepId: firstStep.id };
      }
    }
  } else {
    const firstAct = (await getActs(gameId))[0];
    const orderedSummaries = firstAct.stepSummary.sort(
      (a, b) => a.order - b.order
    );

    const firstStep = orderedSummaries[0];
    return { actId: firstAct.id, stepId: firstStep.id };
  }
}
