import { json, LoaderFunction, useLoaderData } from 'remix';
import { getAct, getStep, Step } from '~/data/data-steps';
import {Fragment} from "react";

export let loader: LoaderFunction = async ({ params }) => {
  const step = await getStep(params.actId as string, params.stepId as string, true);

  return json(step);
};

export default function Step() {
  let step = useLoaderData<Step>();
  // console.log(step);
  return <>
    <div dangerouslySetInnerHTML={{ __html: step.contentHtml }}></div>
    {step.substeps.map(substep => (<Fragment key={substep.id}><h4>{substep.title}</h4><div  dangerouslySetInnerHTML={{ __html: substep.contentHtml }}></div></Fragment>))}</>;
}
