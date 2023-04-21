import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from '@remix-run/react';

import styles from './tailwind.css';
import {json, LoaderArgs, MetaFunction, V2_MetaFunction} from '@remix-run/node';
import { createBrowserClient } from '@supabase/auth-helpers-remix';
import { useState } from 'react';
import Shell from './layout/Shell';
import { Navbar } from '@game-guides/layout';

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}

export const loader = ({}: LoaderArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    GOOGLE_AUTH_REDIRECT_URI: process.env.GOOGLE_AUTH_REDIRECT_URI,
  };

  return json({ env });
};

export let meta: V2_MetaFunction = () => {
  return [{
    title: 'Game Guides',
    description: 'Game guides with built-in progress tracking',
  }];
};


export default function App() {
  const { env } = useLoaderData();
  const [supabase] = useState(() =>
    createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );
  return (
    <Document>
      <Shell>
        <Navbar
          supabase={supabase}
          redirectUri={env.GOOGLE_AUTH_REDIRECT_URI}
        ></Navbar>
        <Outlet
          context={{ supabase, redirectUri: env.GOOGLE_AUTH_REDIRECT_URI }}
        />
      </Shell>
    </Document>
  );
}

// https://remix.run/docs/en/v1/api/conventions#errorboundary
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Error!">
      <Layout>
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
          <hr />
          <p>
            Hey, developer, you should replace this with what you want your
            users to see.
          </p>
        </div>
      </Layout>
    </Document>
  );
}

// https://remix.run/docs/en/v1/api/conventions#catchboundary
export function CatchBoundary() {
  let caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  );
}

function Document({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="remix-app">
      <header className="remix-app__header">Mass Effect 2 Mission Order</header>
      <div className="remix-app__main">
        <div className="container remix-app__main-content">{children}</div>
      </div>
    </div>
  );
}
