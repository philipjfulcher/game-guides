import { join } from 'path';

export function getMarkdownDirectory(gameId: string) {
  return join(__dirname, process.env.MARKDOWN_PATH!, gameId);
}

export const gameIds = ['mass-effect-2', 'kh-bbs', 'metroid-prime-remastered'];
export function validGameId(gameId: string) {
  return gameIds.includes(gameId);
}
