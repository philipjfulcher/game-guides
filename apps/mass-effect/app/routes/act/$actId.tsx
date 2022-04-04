import { json, Link, LoaderFunction, useLoaderData, Outlet } from 'remix';
import { Act, getAct, getActs } from '~/data/data-steps';

export let loader: LoaderFunction = async ({ params }) => {
  const act = await getAct(params.actId as string);

  return json(act);
};

export default function Act() {
  let act = useLoaderData<Act>();
  const summaries = act.stepSummary.sort((a, b) => a.order - b.order);
  console.log(summaries);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: act.contentHtml }}></div>
      <ol>
        {summaries.map((summary) => {
          return (
            <li>
              <Link to={`/act/${act.id}/step/${summary.id}`} prefetch="intent">
                {summary.title}
              </Link>
            </li>
          );
        })}
      </ol>
      <Outlet></Outlet>
    </>
  );
}
