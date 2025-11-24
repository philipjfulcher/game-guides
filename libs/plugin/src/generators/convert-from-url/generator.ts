import { joinPathFragments, Tree } from '@nx/devkit';
import { load } from 'cheerio';

var TurndownService = require('@joplin/turndown');
var turndownPluginGfm = require('@truto/turndown-plugin-gfm');

var gfm = turndownPluginGfm.gfm;
var turndownService = new TurndownService();
turndownService.use(gfm);
turndownService.remove('div');

const urls = [
    "introduction",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
    "january",
    "epilogue",
    "guide-for-the-secret-boss-main-game",
    "social-stat-activities-breakdown",
    "loot-and-breakable-objects",
    "skill-cards",
    "tanakas-amazing-commodities",
];
const baseUrl = "https://gamefaqs.gamespot.com/xbox-series-x/409940-persona-3-reload/faqs/81159/";

export default async function (tree: Tree, options: { url: string }) {
    for (const url of urls) {
        const markdown = await convertFromUrl(`${baseUrl}${url}`);
        tree.write(
            joinPathFragments(
                'guides/persona-3-reload',
                `${url}.md`
            ),
            markdown
        );
    }

}

function convertFromUrl(url: string): Promise<string> {
    console.log(`Processing ${url}`);
    return new Promise(async function (resolve, reject) {
        const response = await fetch(new Request(url));

        let $ = load(await response.text());
        let html = $('#faqwrap').html() || '';

        let markdown: string = turndownService.turndown(html);

        resolve(markdown);
    });
}
