import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  useLoaderData,
} from 'remix';
import { getAct, getStep, Step } from '~/data/data-steps';
import { Fragment } from 'react';
import prisma from '~/data/db';
import CompleteButton from '~/components/complete-button';

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
  }

  return null;
};

export default function Step() {
  let step = useLoaderData<Step>();

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
              <p className="font-bold">{substep.title}</p>
              <div
                dangerouslySetInnerHTML={{ __html: substep.contentHtml }}
              ></div>
              {substep.completed ? (
                <CompleteButton completed={substep.completed}></CompleteButton>
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
                  ></CompleteButton>
                </Form>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className="px-4">
        {step.completed ? (
          <CompleteButton completed={step.completed}></CompleteButton>
        ) : step.substeps.filter((substep) => !substep.completed).length ===
          0 ? (
          <Form method="post">
            <input type="hidden" name="actId" value={step.actId}></input>
            <input type="hidden" name="stepId" value={step.id}></input>
            <CompleteButton completed={step.completed}></CompleteButton>
          </Form>
        ) : (
          <small>Complete all substeps to continue</small>
        )}
      </div>
    </div>
  );
}
