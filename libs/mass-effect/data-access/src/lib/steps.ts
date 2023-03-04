import { Step, StepFrontmatter, StepSummary } from "@mass-effect/mass-effect/models";
import { readdir, readFile } from "fs-extra";
import { join } from "path";
import parseFrontMatter from "front-matter";
import { marked } from "marked";
import { getAct } from "./acts";

export async function getStepSummaries(actId: string): Promise<StepSummary[]> {
  try {
    const markdownPath = join(__dirname, 'markdown');

    const stepsDir = await readdir(join(markdownPath, actId, "steps"));

    return Promise.all(
      stepsDir.map(async (stepId: string) => {
        const trimmedStepId = stepId.replace(".md", "");
        const step = await getStep(actId, trimmedStepId, true);

        return {
          order: step.order,
          id: step.id,
          actId,
          automatic: step.automatic,
          optional: step.optional,
          title: step.title,
          parent: step.parent,
          // completed: !!(await prisma.completedStep.findFirst({where: {stepId: trimmedStepId,actId}}))
          completed: false
        };
      })
    ).then((steps) => {
      return steps.filter((step) => !step.parent);
    });
  } catch (e) {
    return Promise.resolve([]);
  }
}

export async function getStep(
  actId: string,
  stepId: string,
  findSubSteps: boolean
): Promise<Step> {
  const markdownPath = join(__dirname, 'markdown');

  const stepFile = await readFile(
    join(markdownPath, actId, "steps", `${stepId}.md`)
  );

  const { attributes, body } = parseFrontMatter<StepFrontmatter>(
    stepFile.toString("utf-8")
  );

  return {
    title: attributes.title,
    id: stepId,
    contentMarkdown: body,
    contentHtml: marked(body),
    automatic: attributes?.automatic === "true" ?? false,
    optional: attributes?.optional === "true" ?? false,
    order: parseInt(attributes.order, 10),
    substeps: findSubSteps ? await getSubSteps(actId, stepId) : [],
    parent: attributes?.parent,
    completed: false,
    actId
  };
}

export async function getSubSteps(
  actId: string,
  stepId: string
): Promise<Step[]> {
  const markdownPath = join(__dirname, 'markdown');

  const stepsDir = await readdir(join(markdownPath, actId, "steps"));

  const substeps = await Promise.all(
    stepsDir.map(async (subStepId: string) => {
      const step = await getStep(actId, subStepId.replace(".md", ""), false);

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

export async function getCurrentStep(): Promise<{
  actId: string;
  stepId: string;
}> {
  let lastCreatedStepEntry: any;
  if (lastCreatedStepEntry) {
    const act = await getAct(lastCreatedStepEntry.actId);

    if (act.completed) {
      const nextActId = `0${Number.parseInt(act.id, 10) + 1}`;
      const nextAct = await getAct(nextActId);
      const orderedSummaries = nextAct.stepSummary.sort(
        (a, b) => a.order - b.order
      );

      return { actId: nextAct.id, stepId: orderedSummaries[0].id };
    } else {
      const orderedSummaries = act.stepSummary.sort(
        (a, b) => a.order - b.order
      );
      const lastCompletedStepIndex = orderedSummaries.findIndex(
        (summary) => summary.id === lastCreatedStepEntry.stepId
      );

      if (lastCompletedStepIndex + 1 >= orderedSummaries.length) {
        const nextActId = `0${Number.parseInt(act.id, 10) + 1}`;
        const nextAct = await getAct(nextActId);
        const orderedSummaries = nextAct.stepSummary.sort(
          (a, b) => a.order - b.order
        );

        return { actId: nextAct.id, stepId: orderedSummaries[0].id };
      } else {
        const nextStepId = orderedSummaries[lastCompletedStepIndex + 1].id;
        const nextStep = await getStep(act.id, nextStepId, false);

        return { actId: act.id, stepId: nextStep.id };
      }
    }
  } else {
    const firstAct = await getAct("01");
    const orderedSummaries = firstAct.stepSummary.sort(
      (a, b) => a.order - b.order
    );

    const firstStep = orderedSummaries[0];

    return { actId: firstAct.id, stepId: firstStep.id };
  }
}
