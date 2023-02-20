import { json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { type LoaderFunction } from "@remix-run/server-runtime";
import { Act, getAct, getActs, getCurrentStep } from "~/data/data-steps";
import MissionList from "~/components/mission-list";

export let loader: LoaderFunction = async ({ params }) => {
  const act = await getAct(params.actId as string);
  const currentStep = await getCurrentStep();

  if (!params.stepId) {
    if (currentStep.actId === act.id) {
      return redirect(`/mass-effect-2/act/${act.id}/step/${currentStep.stepId}`);
    } else {
      const orderedSummaries = act.stepSummary.sort((a, b) => a.order - b.order);
      return redirect(`/mass-effect-2/act/${act.id}/step/${orderedSummaries[0].id}`);
    }
  }
  return json({ act, currentStep });
};

export default function() {
  let { act, currentStep } = useLoaderData<{ act: Act, currentStep: string }>();

  const summaries = act.stepSummary.sort((a, b) => a.order - b.order);
  return (
    <div className={"flex flex-row"}>
      <MissionList steps={summaries} currentStep={currentStep}></MissionList>
      <Outlet></Outlet>
    </div>
  );
}
