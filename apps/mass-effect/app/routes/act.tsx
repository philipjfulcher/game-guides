import type { LoaderFunction, MetaFunction } from 'remix';
import { json, Link, Outlet, useLoaderData } from 'remix';
import { Act, getActs, getCurrentStep } from '~/data/data-steps';
import { CheckIcon } from '@heroicons/react/solid';
import ActList from '~/components/act-list';

export let loader: LoaderFunction = async () => {
  const acts = await getActs();
  const currentAct = (await getCurrentStep()).actId;
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
