import { getAct, validGameId } from '@game-guides/data-access';
import { json, LoaderArgs, redirect } from '@remix-run/node';

export async function loader({ params }: LoaderArgs) {
  if (validGameId(params.gameId) && params.actId) {
    const act = await getAct(params.actId as string, params.gameId as string);

    return redirect(
      `/${params.gameId}/act/${params.actId}/step/${act.stepSummary[0].id}`
    );
  } else {
    throw json('It messed up');
  }
}
