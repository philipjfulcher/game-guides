import {
  type LoaderFunction,
  type MetaFunction,
  json,
  redirect,
} from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { Act, getActs } from '~/data/data-steps';
import Login from '~/components/login';

export let loader: LoaderFunction = async () => {
  return redirect('/mass-effect-2/act');
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  return <Outlet></Outlet>;
}