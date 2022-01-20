import Parser from 'stream-json/Parser.js';
import Filter from 'stream-json/filters/Filter.js';
import Pick from 'stream-json/filters/Pick.js';
import StreamArray from 'stream-json/streamers/StreamArray.js';
import StreamDynamicArray from './stream-json-extend/streamers/StreamDynamicArray.mjs';

import Chain from 'stream-chain';

import { parentPort } from 'worker_threads';
import WorkerStream from './jsonParserStream.mjs';

import TYPE from "./arvoType.mjs";

const STREAM_OPTIONS = {writableObjectMode: false, readableObjectMode: false};
const extendOptions = (options) => Object.assign({}, STREAM_OPTIONS, options ?? {});

let parseLists = {};
//const HISTORY_PROPERTIES = ["entries", "itemID"];
//const HISTORY_REG = new RegExp(`^items\\.\\d*\\.(${HISTORY_PROPERTIES.join('|')})\\b`);
const HISTORY_KEYS = ["hq", "pricePerUnit", "quantity", "timestamp", "entries", "itemID", "items"];
const HISTORY_KEYS_SET = new Set(HISTORY_KEYS)
parseLists.history = (stream) => {
	const aWeekAgo = new Date().getTime() / 1000 - 604800;
	return new Chain([
		stream,
		new Parser(extendOptions({
			packValues: true,
			streamValues: false
		})),
		/*new Filter(extendOptions({
			filter: HISTORY_REG
		})),*/
		new Pick(extendOptions({
			filter: 'items',
			once: true
		})),
		new StreamDynamicArray(extendOptions({
			includeUndecided: true,
			reviver: (key, value) =>
				(HISTORY_KEYS_SET.has(key) || !isNaN(key)) ? value : undefined
			/*,
			objectFilter: asm => {
				return asm.current.timestamp < aWeekAgo ? asm.depth - 2 : undefined
			}*/
		})),
		rec => {
			let result = Object.assign({entries: []}, rec.value);
			if(result.entries.length && result.entries[result.entries.length - 1].timestamp < aWeekAgo)
				result.entries.pop();
			//console.log('abnormal', result.entries.filter(rec => rec.timestamp < aWeekAgo).map(rec => JSON.stringify(rec)));
			return TYPE.history.toBuffer(result)
		}
	], extendOptions())
}

const MARKET_PROPERTIES = ['pricePerUnit', 'quantity', 'hq', 'retainerName'];
parseLists.market = (stream) => {
	//windowSize = windowSize ?? Number.MAX_SAFE_INTEGER;
	const MARKET_REG = new RegExp(`^items\\.\\d*.(listings\\.\\d*\\.(${MARKET_PROPERTIES.join('|')})|itemID|lastUploadTime)\\b`)
	return new Chain([
		stream,
		new Parser(extendOptions({
			packValues: true,
			streamValues: false
		})),//.on('error', e => console.log('worker', threadId, 'error', e)),
		new Filter(extendOptions({
			filter: MARKET_REG
		})),
		new Pick(extendOptions({
			filter: 'items',
			once: true
		})),
		new StreamArray(STREAM_OPTIONS),
		rec => TYPE.market.toBuffer(Object.assign({listings: []}, rec.value))
	], extendOptions())
}

const TIMEOUT = 60;
let tasks = new Map();
parentPort.on('message', ({eventName, data, ts}) => {
	switch (eventName) {
		case 'new':
			let [type, port, windowSize] = data;
			// hardcode restrict windowSize
			windowSize = Math.min(windowSize, 9);
			let workerStream = new WorkerStream({
				//writableObjectMode: true
			}, port)
			const ABORT = setTimeout(() => workerStream.end(), TIMEOUT * 1000);
			tasks.set(ts, {workerStream, ABORT});
			parseLists[type](workerStream, windowSize).pipe(workerStream).on('finish', () => {
				clearTimeout(ABORT)
				tasks.delete(ts);
			});
			break;
		case 'abort':
			const task = tasks.get(ts);
			if(task) {
				task.workerStream.end()
				clearTimeout(task.ABORT);
			}
			tasks.delete(ts);
			break;
	}
})
