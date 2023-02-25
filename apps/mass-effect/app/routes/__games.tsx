import Login from "~/components/login";
import { Outlet } from "@remix-run/react";

export default function GamesLayout() {
  return <><Login /><Outlet></Outlet></>
}
