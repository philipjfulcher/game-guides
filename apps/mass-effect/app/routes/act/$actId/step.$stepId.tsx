import { json, LoaderFunction, useLoaderData } from 'remix';
import { getAct, getStep, Step } from '~/data/data-steps';

export let loader: LoaderFunction = async ({ params }) => {
  const step = await getStep(params.actId as string, params.stepId as string);

  return json(step);
};

export default function Step() {
  let step = useLoaderData<Step>();
  console.log(step);
  return <div dangerouslySetInnerHTML={{ __html: step.contentHtml }}></div>;
}
