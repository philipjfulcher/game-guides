import { type LoaderFunction, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

export let loader: LoaderFunction = async () => {
  return redirect('/mass-effect-2/act');
};

export default function Index() {
  return <Outlet></Outlet>;
}
