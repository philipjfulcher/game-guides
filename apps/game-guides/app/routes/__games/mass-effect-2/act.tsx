import { type LoaderFunction, type MetaFunction, json } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { Act, getActs, getCurrentStep } from '~/data/data-steps';
import { CheckIcon } from '@heroicons/react/solid';
import ActList from '~/components/act-list';
import { createServerClient } from '@supabase/auth-helpers-remix';

export let loader: LoaderFunction = async ({ request }) => {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  const user = await supabase.auth.getUser();

  console.log(user.data);
  let acts = await getActs();
  const currentAct = (await getCurrentStep()).actId;

  if (user?.data.user) {
    const completedSteps = await supabase.from('completed_steps').select('*');
    acts = acts.map((act) => {
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
        completed,
      };
    });
  }
  return json({ acts, currentAct });
};

export let meta: MetaFunction = () => {
  return {
    title: 'Mass Effect 2 Mission Order',
    description: 'Mission tracker for Mass Effect 2',
  };
};

export default function Index() {
  let { acts, currentAct } = useLoaderData<{
    acts: Act[];
    currentAct: string;
  }>();

  return (
    <div className="flex flex-col w-full">
      <ActList acts={acts} currentAct={currentAct}></ActList>
      <Outlet></Outlet>
    </div>
  );
}
