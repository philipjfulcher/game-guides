import { joinPathFragments, Tree } from '@nx/devkit';
import { load } from 'cheerio';

var TurndownService = require('@joplin/turndown');
var turndownPluginGfm = require('@truto/turndown-plugin-gfm');

var gfm = turndownPluginGfm.gfm;
var turndownService = new TurndownService();
turndownService.use(gfm);
turndownService.remove('div');

export default async function (tree: Tree, options: { url: string }) {
  const markdown = await convertFromUrl(options.url);
  tree.write(
    joinPathFragments(
      'guides/persona-3-reload',
      `${options.url.split('/').at(-1)}.md`
    ),
    markdown
  );
}

function convertFromUrl(url: string): Promise<string> {
  return new Promise(async function (resolve, reject) {
    const response = await fetch(new Request(url));

    let $ = load(await response.text());
    let html = $('#faqwrap').html() || '';

    let markdown: string = turndownService.turndown(html);

    resolve(markdown);
  });
}
