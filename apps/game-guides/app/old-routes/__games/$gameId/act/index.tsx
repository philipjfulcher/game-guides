import { getActs, validGameId } from '@game-guides/data-access';
import { LoaderArgs, redirect } from '@remix-run/node';

export async function loader({ params }: LoaderArgs) {
  if (validGameId(params.gameId)) {
    const acts = await getActs(params.gameId as string);

    return redirect(`/${params.gameId}/act/${acts[0].id}`);
  }
}
