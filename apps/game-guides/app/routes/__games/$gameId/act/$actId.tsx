import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { type LoaderFunction } from "@remix-run/server-runtime";
import { getAct, getCurrentStep, validGameId } from "@game-guides/data-access";
import { Act } from "@game-guides/models";
import { MissionList } from "@game-guides/components";
import { createServerClient } from "@supabase/auth-helpers-remix";

export let loader: LoaderFunction = async ({ params, request }) => {
  const gameId = params.gameId;
    const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  if (gameId && validGameId(gameId)) {
    const act = await getAct(params.actId as string, gameId);
    const currentStep = await getCurrentStep(gameId,supabase);
    if (!params.stepId) {
      if (currentStep.actId === act.id) {
        return redirect(`/${gameId}/act/${act.id}/step/${currentStep.stepId}`);
      } else {
        const orderedSummaries = act.stepSummary.sort((a, b) => a.order - b.order);
        return redirect(`/${gameId}/act/${act.id}/step/${orderedSummaries[0].id}`);
      }
    }


    const user = await supabase.auth.getUser();

    if (user?.data.user) {
      const completedSteps = await supabase.from('completed_steps').select('*');
      const stepSummary = act.stepSummary.map((stepSummary) => {
        return {
          ...stepSummary,
          completed: Boolean(
            completedSteps.data?.find(
              (step) => step.step_id === `${act.id}:${stepSummary.id}`
            )
          ),
        };
      });

      const completed = stepSummary.reduce((acc, cur) => {
        if (!cur.completed) {
          return false;
        } else {
          return acc;
        }
      }, true);

      act.stepSummary = stepSummary;
      act.completed = completed;
    }

    return json({ act, currentStep });

  } else {
    throw new Error(`${gameId} is not a valid game.`);
  }

};

export default function () {
  let { act, currentStep } = useLoaderData<{ act: Act; currentStep: string }>();

  const summaries = act.stepSummary.sort((a, b) => a.order - b.order);
  return (
    <div className={'flex flex-row'}>
      <MissionList steps={summaries} currentStep={currentStep}></MissionList>
      <Outlet></Outlet>
    </div>
  );
}
