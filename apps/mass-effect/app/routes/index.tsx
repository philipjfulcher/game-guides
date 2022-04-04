import type { MetaFunction, LoaderFunction } from 'remix';
import { useLoaderData, json, Link, Outlet, redirect } from 'remix';
import { Act, getActs } from '~/data/data-steps';

export let loader: LoaderFunction = async () => {
  return redirect('/act');
};

// https://remix.run/guides/routing#index-routes
export default function Index() {}
