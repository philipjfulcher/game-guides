import { Login } from '@game-guides/components';
import { Outlet } from '@remix-run/react';

export default function GamesLayout() {
  return (
    <>
      <Login />
      <Outlet></Outlet>
    </>
  );
}
