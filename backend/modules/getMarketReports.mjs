import https from 'https';
import { mean } from 'mathjs';
import getUniID from './getUniID.mjs';
import RateLimiter from "./RateLimiter.mjs";

import Parser from './jsonParser.mjs';
import Chain from 'stream-chain';

const WINDOW_SIZE = 5;
const DEFAULT_WORLD = 'LuXingNiao';
const DEFAULT_SERVER = 'ChenXiWangZuo';
const SORT_QUAL = 'nq';
const QUAL_OPTIONS = ['hq', 'nq', 'all'];

//const servers = ['HongYuHai', 'ShenYiZhiDi', 'LaNuoXiYa', 'HuanYingQunDao", "MengYaChi", "YuZHouHeYin', 'WoXianXiRan', 'ChenXiWangZuo'];

const REQUEST_OPTIONS = {
	agent: new https.Agent({
		keepAlive: true,
		maxSockets: 8,
		scheduling: 'fifo'
	}),
	timeout: 5000
};
const rateLimiter = new RateLimiter(10);


async function getServerMarketLists(IDs, server, windowSize, context) {
	const recent = (hists) => {
		const DAYS = [1,2,3,4,5,6,7]
		const aWeekAgo = new Date().getTime() / 1000 - 604800
		let v = [0,0,0,0,0,0,0]
		hists.forEach((hist) => {
			if(hist.timestamp < aWeekAgo)
				return;
			DAYS.forEach(day => {
				if(hist.timestamp > aWeekAgo + 604800 - day * 86400)
					v[day - 1] += hist.quantity
			})
		})
		return v
		/*const v = hists.reduce((acc, hist) => {
			while(hist.timestamp < now - DAYS[acc.day] * 86400) {
				acc.value.push(acc.value[acc.value.length - 1]);
				acc.day++;
			}
			acc.value[acc.value.length - 1] += hist.quantity;
			return acc;
		}, {value: [0], day: 0}).value;
		return v.concat(new Array(DAYS.length - v.length).fill(v[v.length-1]))*/
		//return DAYS.map(day => hists.filter(hist => hist.timestamp > now - day * 86400 ).reduce((acc, a) => acc + a.quantity, 0));
	}
	IDs[1] = IDs[1] ?? IDs[0];
	const options = Object.assign({}, REQUEST_OPTIONS, {signal: context.ac.signal});

	return Promise.all([
			rateLimiter.httpsRequest(`https://universalis.app/api/${server}/${IDs.join(',')}?hq=true&listings=${windowSize}`, options)
				.then(listStream => Parser.parseMarketLists(listStream, 0, context, IDs.length)),
			rateLimiter.httpsRequest(`https://universalis.app/api/${server}/${IDs.join(',')}?hq=false&listings=${windowSize}`, options)
				.then(listStream => Parser.parseMarketLists(listStream, 0, context, IDs.length)),
			rateLimiter.httpsRequest(`https://universalis.app/api/history/${server}/${IDs.join(',')}?entriesWithin=604800`, options)
				.then(histStream => Parser.parseHistoryLists(histStream, 0, context, IDs.length))//, `https://universalis.app/api/history/${server}/${IDs.join(',')}`))
		])
		.then(([hqListStream, nqListStream, histStream]) => {
			//listStream.on('data', (d) => console.log('market data', d.length, ': ', d.slice(0, 75).toString()));
			//histStream.on('data', (d) => console.log('history data', d.length, ': ', d.slice(0, 75).toString()));
			if(context.ac.signal.aborted)
				throw new Error('abort');
			return Parser.joinHistoryByID(hqListStream, nqListStream, histStream);
		})
		.then((stream) =>
			new Chain([
				stream,
				result => {
					let hist = result.recentHistory.reduce((acc, rec) =>  {
						(rec.hq ? acc.hq : acc.nq).push(rec)
						return acc
					}, { hq: [], nq: [], all: result.recentHistory});
					return {
						ID: result.itemID,
						lastUploadTime: result.lastUploadTime,
						volumns: {
							hq: recent(hist.hq, result.itemID),
							nq: recent(hist.nq, result.itemID),
							all: recent(hist.all, result.itemID)
						},
						hq: result.hqListings.slice(0, windowSize),
						nq: result.nqListings.slice(0, windowSize),
						all: result.listings.slice(0, windowSize),
						history: {
							hq: hist.hq.slice(0, windowSize),
							nq: hist.nq.slice(0, windowSize),
							all: hist.all.slice(0, windowSize)
						}
					};
				}
			])
		)
}

async function getMarketLists(IDs, world, defaultServer, windowSize, context) {
	return Promise.all([
		getServerMarketLists(IDs, world, windowSize, context),
		getServerMarketLists(IDs, defaultServer, windowSize, context)
	])
	.then(([worldStream, defaultStream]) => Parser.joinDefaultByID(worldStream, defaultStream))
}

async function getMarketReports(items, config) {
	const {world, defaultServer, windowSize, context} = Object.assign({
		qual: SORT_QUAL,
		world: DEFAULT_WORLD,
		defaultServer: DEFAULT_SERVER,
		windowSize: WINDOW_SIZE
	}, config);
	/*const filtedMean = (array) => {
		array = ;
		if(!array.length)
			return 0;
		array = array.map(rec => rec.pricePerUnit);
		let filtedArray = array;
		if([...new Set(array)].length > 2) {
			const meanValue = mean(array);
			const stdValue = std(array);
			filtedArray = array.filter((x, i) =>
				array[i] - meanValue <= stdValue * 10
			)
		}
		return filtedArray.length === 0 ? mean(array) : mean(filtedArray);
	}*/
	const filtedMean = (array) => {
		array = array.map(rec => rec.pricePerUnit);
		return array.length ? mean(array) : 0;
	};
	const filtKey = ({pricePerUnit, quantity, retainerName}) =>
		({price: pricePerUnit, quantity, seller: retainerName});
	const genQualReport = (obj, qual) => ({
		lowestPrice: obj[qual][0] ? filtKey(obj[qual][0]) : null,
		meanLowPrice: obj[qual].length ? filtedMean(obj[qual]) : null,
		meanLowHistoryPrice: obj.history[qual].length ? filtedMean(obj.history[qual]) : null,
		volumns: obj.volumns[qual]
	})
	//console.time(item.name)

	let IDcache;

	return Promise.all(items.map(item => {
		//getUniID(item).then(console.log);
		if(context && context.ac.signal.aborted)
			return new Array(1);
		return getUniID(item);
	}))
	.then(array=> {
		const IDs = array.map(a => a[0])
		if(context?.ac.signal.aborted)
			throw new Error('abort')
		IDcache = new Map(IDs.map((ID, i) => [ID, items[i]]));
		return getMarketLists(IDs, world, defaultServer, windowSize, context)
	})
	.then((stream) => 
		new Chain([
			stream,//.on('data', data => console.log('get', data.ID, Object.keys(data))).on('end', () => console.log('ALL END')),
			list => {
				let result = Object.assign({
					ID: list.ID,
					lastUploadTime: list.lastUploadTime,
					defaultServer: {
						lastUploadTime: list.defaultList.lastUploadTime
					}
				}, IDcache.get(list.ID));
				QUAL_OPTIONS.forEach(qual => {
					//if(list[qual].length)
						result[qual] = genQualReport(list, qual);
					//if(list.defaultList[qual].length)
						result.defaultServer[qual] = genQualReport(list.defaultList, qual);
				});
				return result;
			}
		])
	)
}

export default getMarketReports;
