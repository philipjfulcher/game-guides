import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import { getActs, getCurrentStep, validGameId } from "@game-guides/data-access";
import { Act } from "@game-guides/models";
import { ActList } from "@game-guides/components";
import { createServerClient } from "@supabase/auth-helpers-remix";

export let loader: LoaderFunction = async ({ request, params }) => {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  const user = await supabase.auth.getUser();
  const gameId = params.gameId;

  if (gameId && validGameId(gameId)) {
    let acts = await getActs(gameId);
    const currentAct = (await getCurrentStep(gameId,supabase)).actId;

    if (user?.data.user) {
      const completedSteps = await supabase.from("completed_steps").select("*");
      acts = acts.map((act) => {
        const stepSummary = act.stepSummary.map((stepSummary) => {
          return {
            ...stepSummary,
            completed: Boolean(
              completedSteps.data?.find(
                (step) => step.step_id === `${act.id}:${stepSummary.id}`
              )
            )
          };
        });
        console.log(stepSummary);

        const completed = stepSummary.reduce((acc, cur) => {
          if (!cur.completed) {
            return false;
          } else {
            return acc;
          }
        }, true);

        return {
          ...act,
          stepSummary,
          completed
        };
      });
    }
    return json({ acts, currentAct });
  } else {
    throw Error(`${gameId} is not a valid game.`);
  }

};

export let meta: MetaFunction = () => {
  return {
    title: "Mass Effect 2 Mission Order",
    description: "Mission tracker for Mass Effect 2"
  };
};

export default function Index() {
  let { acts, currentAct } = useLoaderData<{
    acts: Act[];
    currentAct: string;
  }>();

  const { gameId } = useParams();

  return (
    <div className="flex flex-col w-full">
      <ActList acts={acts} currentAct={currentAct} gameId={gameId as string}></ActList>
      <Outlet></Outlet>
    </div>
  );
}
