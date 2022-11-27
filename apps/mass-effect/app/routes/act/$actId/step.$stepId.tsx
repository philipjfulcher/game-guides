import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useLoaderData,
} from 'remix';
import { getAct, getCurrentStep, getStep, Step } from '~/data/data-steps';
import { Fragment } from 'react';
import prisma from '~/data/db';
import CompleteButton from '~/components/complete-button';
import { useTransition } from '@remix-run/react';

export let loader: LoaderFunction = async ({ params, request }) => {
  const step = await getStep(
    params.actId as string,
    params.stepId as string,
    true
  );

  return json(step);
};

export let action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const stepId = formData.get('stepId');
  const actId = formData.get('actId');

  if (stepId && actId) {
    await prisma.completedStep.create({
      data: { stepId: stepId.toString(), actId: actId.toString() },
    });

    const step = await getStep(actId.toString(), stepId.toString(), false);

    if(step.parent) {
      return null;
    } else {
      const currentStep = await getCurrentStep();

      return redirect(`/act/${currentStep.actId}/step/${currentStep.stepId}`);
    }
  }


  const currentStep = await getCurrentStep();

  return redirect(`/act/${currentStep.actId}/step/${currentStep.stepId}`);
};

export default function Step() {
  let step = useLoaderData<Step>();
  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return (
    <div className="w-full flex flex-col">
      <div className="py-12 px-4">
        <div dangerouslySetInnerHTML={{ __html: step.contentHtml }}></div>
      </div>

      {step.substeps.length > 0 ? (
        <div className="pb-12 px-4">
          <p className="font-semibold">Substeps</p>

          {step.substeps.map((substep) => (
            <div className="pb-6" key={substep.id}>
              <div
                dangerouslySetInnerHTML={{ __html: substep.contentHtml }}
              ></div>
              {substep.completed ? (
                <CompleteButton
                  completed={substep.completed}
                  creating={isCreating && transition.submission?.formData.get('stepId') === substep.id}
                ></CompleteButton>
              ) : (
                <Form method="post">
                  <input
                    type="hidden"
                    name="actId"
                    value={substep.actId}
                  ></input>
                  <input type="hidden" name="stepId" value={substep.id}></input>
                  <CompleteButton
                    completed={substep.completed}
                    creating={isCreating && transition.submission?.formData.get('stepId') === substep.id}
                  ></CompleteButton>
                </Form>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className="px-4">
        {step.completed ? (
          <CompleteButton completed={step.completed} creating={isCreating}></CompleteButton>
        ) : step.substeps.filter((substep) => !substep.completed).length ===
          0 ? (
          <Form method="post">
            <input type="hidden" name="actId" value={step.actId}></input>
            <input type="hidden" name="stepId" value={step.id}></input>
            <CompleteButton completed={step.completed} creating={isCreating}></CompleteButton>
          </Form>
        ) : (
          <small>Complete all substeps to continue</small>
        )}
      </div>
    </div>
  );
}
