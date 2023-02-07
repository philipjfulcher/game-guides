import { type LoaderFunction, type MetaFunction, json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Act, getActs } from '~/data/data-steps';

export let loader: LoaderFunction = async () => {
  return redirect('/act');
};

// https://remix.run/guides/routing#index-routes
export default function Index() {}
