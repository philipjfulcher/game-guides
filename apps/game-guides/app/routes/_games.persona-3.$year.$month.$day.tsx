import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { createSupabaseServerClient, getDate } from '@game-guides/data-access';
import { json, LoaderArgs, redirect, Response } from '@remix-run/node';
import {
  BuildingOfficeIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/solid';
import { ActionFunction } from '@remix-run/server-runtime';
import { createServerClient } from '@supabase/auth-helpers-remix';
import { CompleteButton } from '@game-guides/components';
import { addDays, format, parseISO } from 'date-fns';

export const loader = async ({ request, params }: LoaderArgs) => {
  const date = `${params.year}-${params.month}-${params.day}`;
  const dateData = await getDate(date);
  const response = new Response();
  const supabase = createSupabaseServerClient({ request, response });

  const complete = await supabase
    .from('completed_steps')
    .select('*')
    .eq('game_id', 'persona-3')
    .eq('step_id', date);

  return json({
    ...dateData,
    completed: Boolean(complete.data?.length ?? false),
  });
};

export let action: ActionFunction = async ({ request, params }) => {
  const response = new Response();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
  const formData = await request.formData();

  const gameId = formData.get('gameId');
  const stepId = `${params.year}-${params.month}-${params.day}`;
  const user = await supabase.auth.getUser();

  if (user.data?.user?.id && stepId && gameId) {
    const result = await supabase.from('completed_steps').insert([
      {
        game_id: gameId,
        user_id: user.data.user.id,
        step_id: stepId,
      },
    ]);
    const nextDate = format(addDays(parseISO(stepId), 1), 'yyyy/MM/dd');

    return redirect(`/persona-3/${nextDate}`);
  } else {
    throw new Error(`I dunno', it's messed up`);
  }
};

export default function Persona3Day() {
  const data = useLoaderData<typeof loader>();
  const { state } = useNavigation();
  const isCreating = state === 'submitting';

  return (
    <div className="p-4 space-y-4 bg-white">
      <h1 className="text-lg">
        <span className="text-gray-500 font-semibold">
          {data.date.slice(0, -5)}
        </span>{' '}
        <span className="text-gray-900">{data.dayOfWeek}</span>
      </h1>
      <p>{data.notes}</p>
      <ul role="list" className="divide-y divide-gray-200">
        <li className="relative py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50">
          <div className="flex justify-between items-center space-x-3">
            <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
              <BuildingOfficeIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="truncate text-sm font-medium text-gray-900">
                Morning Class
              </p>
            </div>
          </div>
          <div className="mt-1">
            <p className="line-clamp-2 text-sm text-gray-600">
              {data.morningClass || '---'}
            </p>
          </div>
        </li>

        <li className="relative bg-white py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50">
          <div className="flex justify-between items-center space-x-3">
            <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
              <SunIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="truncate text-sm font-medium text-gray-900">
                Day Time
              </p>
            </div>
          </div>
          <div className="mt-1">
            <p className="line-clamp-2 text-sm text-gray-600">
              {data.dayTime.activity}
            </p>
            <p className="line-clamp-2 text-sm text-gray-600">
              <span className="text-gray-900">Answers </span>
              {data.dayTime.bestAnswers}
            </p>
          </div>
        </li>

        <li className="relative bg-white py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 hover:bg-gray-50">
          <div className="flex justify-between items-center space-x-3">
            <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
              <MoonIcon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="truncate text-sm font-medium text-gray-900">
                Night Time
              </p>
            </div>
          </div>
          <div className="mt-1">
            <p className="line-clamp-2 text-sm text-gray-600">
              {data.nightTime.activity}
            </p>
          </div>
        </li>
      </ul>
      {data.completed ? (
        <CompleteButton
          completed={data.completed}
          creating={isCreating}
        ></CompleteButton>
      ) : (
        <Form method="post">
          <input type="hidden" name="gameId" value="persona-3"></input>
          <CompleteButton
            completed={data.completed}
            creating={isCreating}
          ></CompleteButton>
        </Form>
      )}
    </div>
  );
}
