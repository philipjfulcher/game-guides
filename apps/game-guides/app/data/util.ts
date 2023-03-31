import { join } from 'path';

export function getMarkdownDirectory(gameId: string) {
  return join(__dirname, process.env.MARKDOWN_PATH!, gameId);
}

export const gameIds = ['mass-effect-2', 'kh-bbs', 'metroid-prime-remastered', 'persona-3'];
export function validGameId(gameId: string | null | undefined) {
  return gameId && gameIds.includes(gameId);
}
