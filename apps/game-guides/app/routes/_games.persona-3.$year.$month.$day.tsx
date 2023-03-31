import { useLoaderData, useParams } from '@remix-run/react';
import { getDate } from '@game-guides/data-access';
import { json, LoaderArgs } from '@remix-run/node';

export const loader = async ({ params }: LoaderArgs) => {
  const dateData = await getDate(
    `${params.year}-${params.month}-${params.day}`
  );

  return json(dateData);
};
export default function Persona3Day() {
  const { year, month, day } = useParams();
  const data = useLoaderData<typeof loader>();

  return (
    <p>
      {year}-{month}-{day} {JSON.stringify(data)}
    </p>
  );
}
