import type { MetaFunction, LoaderFunction } from 'remix';
import { useLoaderData, json, Link, Outlet } from 'remix';
import { Act, getActs } from '~/data/data-steps';

export let loader: LoaderFunction = async () => {
  const acts = await getActs();

  // https://remix.run/api/remix#json
  return json(acts);
};

// https://remix.run/api/conventions#meta
export let meta: MetaFunction = () => {
  return {
    title: 'Remix Starter',
    description: 'Welcome to remix!',
  };
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  let acts = useLoaderData<Act[]>();

  return (
    <div className="remix__page">
      <main>
        <ul>
          {acts.map((act) => (
            <li key={act.id} className="remix__page__resource">
              <Link to={`/act/${act.id}`} prefetch="intent">
                {act.title}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <aside>
        <Outlet></Outlet>
      </aside>
    </div>
  );
}
