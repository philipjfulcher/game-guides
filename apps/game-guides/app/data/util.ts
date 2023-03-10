import { join } from 'path';

export function getMarkdownDirectory(gameId: string) {
  return join(__dirname, `../app/data/${gameId}`);
}

export const gameIds = ['mass-effect-2', 'kh-bbs'];
export function validGameId(gameId: string) {
  return gameIds.includes(gameId);
}
