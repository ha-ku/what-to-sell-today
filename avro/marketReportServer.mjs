import getMarketReports from '../modules/getMarketReports.mjs';
import itemLists from '../public/json/itemLists.json';
import Context from '../modules/requestContext.mjs';
import parseQuery from "../modules/parseQuery.mjs";

import {reportEncoder} from "./marketReportTypes.mjs";
import https from "https";
import http2 from 'http2';

import process from 'process';


const WINDOW_SIZE = 5,
	DEFAULT_WORLD = 'LuXingNiao',
	DEFAULT_SERVER = 'ChenXiWangZuo',
	SORT_QUAL = 'nq';
const SECRET = {
	v2: process.env.WTST_RECAPTCHA_KEY_V2,
	v3: process.env.WTST_RECAPTCHA_KEY_V3
}

const checkToken = (version, token, host) => {
	return new Promise((resolve, reject) => {
		let response = '';
		const req = https.request(`https://www.google.com/recaptcha/api/siteverify?secret=${SECRET[version]}&response=${token}`, {
			method: 'POST'
		}, (res) => {
			res.on('data', chunk => response = response + chunk)
			res.on('end', () => {
				const {success, hostname, score, action} = JSON.parse(response);
				if(hostname !== host || (version === 'v3' && action !== 'marketReport')) {
					//onsole.log('invalid recaptcha result for', hostname, ':', action);
					console.log('invalid recaptcha result', response);
					reject({code: 400, content: 'invalid recaptcha result'});
					return;
				}
				if(!success || (version === 'v3' && score < 0.5)){
					console.log('recaptcha failed.' + version === 'v3' ? `, score ${score}` : '');
					reject({code: 403, content: 'recaptcha failed'});
					return;
				}
				console.log('recaptcha pass.' + version === 'v3' ? `, score ${score}` : '');
				resolve();
			})
		});
		req.end();
	})
}

function getReports(req, resp) {
	let { quality, itemListName, world, server, priceWindow, token, recaptchaVersion } = parseQuery(req);
	let context = new Context();

	checkToken(recaptchaVersion, token, req.hostname)
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
			}
			console.log('end')
			resp.end();
			context.agent.destroy();
		})
}

const server = http2.createServer();

/*server.on('request', (req, resp) => {
	const encoder = reportEncoder();
	getReports(req, encoder);
	encoder.pipe(resp);
})*/
server.on('stream', (stream, headers) => {
	stream.url = `https://${headers[':authority']}${headers[':path']}`;
	stream.headers = {
		host: `https://${headers[':authority']}`
	};
	stream.hostname = headers[':authority'];
	const encoder = reportEncoder(1024);
	getReports(stream, encoder);
	encoder.pipe(stream);
})

server.listen(9092);
