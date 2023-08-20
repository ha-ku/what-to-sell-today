import parseQuery from "./parseQuery.mjs";
import Context from "./requestContext.mjs";
import checkRecaptcha from "./checkRecaptcha.mjs";
import getMarketReports from "./getMarketReports.mjs";

import * as itemLists from './itemLists.mjs';

const WINDOW_SIZE = 5,
	DEFAULT_WORLD = 'LuXingNiao',
	DEFAULT_SERVER = 'ChenXiWangZuo',
	SORT_QUAL = 'nq';

function getReports(req, resp) {
	let { quality, itemListName, world, server, priceWindow, token, recaptchaVersion } = parseQuery(req);
	let context = new Context();

	checkRecaptcha(recaptchaVersion, token, req.hostname)
		.then(() => {

			console.log(`qual: ${quality}, name: ${itemListName}, world: ${world}, server: ${server}, priceWindow: ${priceWindow}`);
			req.on('aborted', () => context.ac.abort());

			if (!itemListName || !itemLists[itemListName]) {
				console.log(`${itemListName} no in ${Object.keys(itemLists)}`);
				resp.end();
			} else {
				const itemList = new Array(...itemLists[itemListName]);
				const config = {
					qual: quality ?? SORT_QUAL,
					world: world ?? DEFAULT_WORLD,
					defaultServer: server ?? DEFAULT_SERVER,
					windowSize: priceWindow ?? WINDOW_SIZE,
					context: context
				};

				let promises = [];
				while (itemList.length > 0 && !context.ac.signal.aborted) {
					promises.push(getMarketReports(itemList.splice(0,  Math.min(Math.ceil(Math.pow(itemLists[itemListName].length, 0.5)), 100)), config).then((reports) => {
						reports.on('data', function writeReport(report) {
							if (context.ac.signal.aborted) {
								reports.off('data', writeReport)
								return
							}
							resp.write(report)
						});
						if (context.ac.signal.aborted)
							return Promise.reject(new Error('abort'));
						return new Promise((res) => reports.on('end', res));
					}))
				}
				return Promise.all(promises)
			}
		})
		.then(() => {
			console.log('end')
			resp.end();
			context.agent.destroy();
		})
		.catch((e) => {
			if (e.message !== 'abort') {
				console.log(e);
				resp.write({err: e});
				context.ac.abort();
			}
			console.log('end')
			resp.end();
			context.agent.destroy();
		})
}


export default getReports;