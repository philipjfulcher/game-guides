import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { type LoaderFunction } from "@remix-run/server-runtime";
import {Act, getAct, getActs, getCurrentStep} from '~/data/data-steps';
import MissionList from "~/components/mission-list";

export let loader: LoaderFunction = async ({ params }) => {
  const act = await getAct(params.actId as string);
  const currentStep = (await getCurrentStep()).stepId;
  return json({act,currentStep});
};

export default function() {
  let {act,currentStep} = useLoaderData<{act: Act, currentStep: string}>();

  const summaries = act.stepSummary.sort((a, b) => a.order - b.order);
  return (
    <div className={"flex flex-row"}>
      <MissionList steps={summaries} currentStep={currentStep}></MissionList>
      <Outlet></Outlet>
    </div>
  );
}
