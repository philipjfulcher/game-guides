import { json, redirect, Response } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useParams,
  useTransition
} from "@remix-run/react";
import {
  type ActionFunction,
  type LoaderFunction
} from "@remix-run/server-runtime";
import { getCurrentStep, getStep, validGameId } from "@game-guides/data-access";
import { Step } from "@game-guides/models";
import { CompleteButton } from "@game-guides/components";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { createSupabaseServerClient } from "../../../../../data/supabase";

export let loader: LoaderFunction = async ({ params, request }) => {
  const response = new Response();
  const gameId = params.gameId;

  if (gameId && validGameId(gameId)) {
    const step = await getStep(
      params.actId as string,
      params.stepId as string,
      true,
      gameId
    );

    const supabase = createSupabaseServerClient({ request, response });
    const user = await supabase.auth.getUser();

    if (user?.data.user) {
      const completedSteps = await supabase
        .from("completed_steps")
        .select("*")
        .eq("game_id", gameId);

      console.log({ completedSteps });

      const completed = Boolean(
        completedSteps.data?.find(
          (step) => step.step_id === `${params.actId}:${params.stepId}`
        )
      );
      step.completed = completed;
    }

    return json(step);
  } else {
    throw new Error(`${gameId} is not a valid game.`);
  }
};

export let action: ActionFunction = async ({ request }) => {
  const response = new Response();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  const formData = await request.formData();

  const gameId = formData.get("gameId");
  const stepId = formData.get("stepId");
  const actId = formData.get("actId");
  const user = await supabase.auth.getUser();

  console.log(user.data);

  if (user.data?.user?.id && stepId && actId && gameId) {

    const result = await supabase.from("completed_steps").insert([
      {
        game_id: gameId,
        user_id: user.data.user.id,
        step_id: `${actId}:${stepId}`
      }
    ]);

    const step = await getStep(
      actId.toString(),
      stepId.toString(),
      false,
      gameId.toString()
    );

    if (step.parent) {
      return null;
    } else {
      const currentStep = await getCurrentStep(gameId.toString(), supabase);

      return redirect(
        `/${gameId}/act/${currentStep.actId}/step/${currentStep.stepId}`
      );
    }
    const currentStep = await getCurrentStep(
      gameId?.toString() as string,
      supabase
    );

    return redirect(
      `/${gameId}/act/${currentStep.actId}/step/${currentStep.stepId}`
    );
  } else {
    throw new Error(`I dunno', it's messed up`);
  }
};

export default function() {
  let step = useLoaderData<Step>();
  const transition = useTransition();
  const isCreating = Boolean(transition.submission);
  const { gameId } = useParams();

  return (
    <div className="w-full flex flex-col">
      <div className="p-4">
        <div className="parsed-markdown"
             dangerouslySetInnerHTML={{ __html: step.contentHtml }}></div>
      </div>

      {step.substeps.length > 0 ? (
        <div className="pb-12 px-4">
          <p className="font-semibold">Substeps</p>

          {step.substeps.map((substep) => (
            <div className="pb-6" key={substep.id}>
              <div
                className="parsed-markdown"
                dangerouslySetInnerHTML={{ __html: substep.contentHtml }}
              ></div>
              {substep.completed ? (
                <CompleteButton
                  completed={substep.completed}
                  creating={
                    isCreating &&
                    transition.submission?.formData.get("stepId") === substep.id
                  }
                ></CompleteButton>
              ) : (
                <Form method="post">
                  <input
                    type="hidden"
                    name="actId"
                    value={substep.actId}
                  ></input>
                  <input type="hidden" name="stepId" value={substep.id}></input>
                  <input type="hidden" name="gameId" value={gameId}></input>
                  <CompleteButton
                    completed={substep.completed}
                    creating={
                      isCreating &&
                      transition.submission?.formData.get("stepId") ===
                      substep.id
                    }
                  ></CompleteButton>
                </Form>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className="px-4">
        {step.completed ? (
          <CompleteButton
            completed={step.completed}
            creating={isCreating}
          ></CompleteButton>
        ) : step.substeps.filter((substep) => !substep.completed).length ===
        0 ? (
          <Form method="post">
            <input type="hidden" name="actId" value={step.actId}></input>
            <input type="hidden" name="stepId" value={step.id}></input>
            <input type="hidden" name="gameId" value={gameId}></input>

            <CompleteButton
              completed={step.completed}
              creating={isCreating}
            ></CompleteButton>
          </Form>
        ) : (
          <small>Complete all substeps to continue</small>
        )}
      </div>
    </div>
  );
}
