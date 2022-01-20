import {PassThrough} from 'stream';
import {once, EventEmitter } from 'events';

import Chain from 'stream-chain';

import { cpus } from 'os';
import { Worker, MessageChannel } from 'worker_threads';
import WorkerStream from './jsonParserStream.mjs';

import TYPE from "./arvoType.mjs";


const STREAM_OPTIONS = {
	readableHighWaterMark: 128
};
const extendOptions = (options) => Object.assign(STREAM_OPTIONS, options ? options : {});


const workerPath = './modules/jsonParserWorker.mjs';
const cpuNum = cpus().length;
console.log(cpuNum, 'CPU');

class WorkerPool {
	constructor(size) {
		this.pool = new Array(size).fill(null).map(() => new Worker(workerPath));
		this.status = new Array(size).fill(true);
		this.emitter = new EventEmitter();
		this.emitter.setMaxListeners(40);
	}
	async pick() {
		let index = this.status.findIndex(s => s);
		if(index === -1) {
			await once(this.emitter, 'put');
			index = this.status.findIndex(s => s);
		}
		const worker = this.pool[index];
		this.status[index] = false;
		//console.log('worker', index, 'start');
		return [worker, index];
	}
	put(index) {
		if(!this.status[index]) {
			//console.log('worker', index, 'finish');
			this.status[index] = true;
			this.emitter.listenerCount('put') ? this.emitter.rawListeners('put')[0]() : null;
		}
	}
}
const pool = new WorkerPool(cpuNum * 2);

let task = 0;
const parseLists = (type) => {
	return (stream, windowSize, context, length)=> {//}, url) => {
		let taskNum = task;
		task++;
		const { port1, port2 } = new MessageChannel();
		const mainStream = new WorkerStream({
			//readableObjectMode: true
		}, port1);

		pool.pick()
			.then(([worker, index]) => {
				const ts = new Date().getTime();
				//console.log(url, 'parse start');
				console.time(`task ${taskNum} ${type} ${length} ID`);
				worker.postMessage({eventName: 'new', data: [type, port2, windowSize], ts}, [port2]);
				const handleAbort = () => {
					console.log('parser abort')
					worker.postMessage({eventName: 'abort', data: [], ts})
					port1.close()
					pool.put(index);
				}
				context.ac.signal.addEventListener('abort', handleAbort)
				stream.pipe(mainStream);
				mainStream.on('end', () => {
					context.ac.signal.removeEventListener('abort', handleAbort)
					port1.close()
					pool.put(index);
				})
			})
		return new Chain([
			mainStream,
			(buf) => TYPE[type].fromBuffer(buf)
		]).on('end', () => console.timeEnd(`task ${taskNum} ${type} ${length} ID`));
	}
}
const parseMarketLists = parseLists('market');
const parseHistoryLists = parseLists('history');

const joinByID = (streams, IDKey, handler) => {
	let caches = new Array(streams.length).fill(0).map(() => new Map());
	let downStream = new PassThrough(extendOptions({objectMode: true}))//.on('end', () => console.log(cache.filter(pair => pair)));
	const pair = (rec, i) => {
		const ID = rec ? rec[IDKey] : null;
		if(!ID)
			console.log('no ID in', rec, i);
		else {
			if(caches[i].has(ID)) {
				console.log(`${rec.itemID} duplicate`)
				return;
			}
			caches[i].set(ID, rec);
			if(caches.some((c, j) => j !== i && !c.has(ID))) {
				return;
			}
			if(!downStream.write(handler(caches.map(c => c.get(ID))))) {
				streams.forEach(s => s.pause());
				downStream.once('drain', () => {
					streams.forEach(s => s.resume());
				})
			}
			caches.forEach(map => map.set(ID, 1))
		}
	}
	streams.forEach((s, i) => s.on('data', (value) => pair(value, i)))
	Promise.all( streams.map(s => once(s, 'end')) ).then(() => downStream.end())
	return downStream;
}

const joinHistoryByID = (hqListStream, nqListStream, histStream) => {
	return joinByID([hqListStream, nqListStream, histStream], 'itemID',
	([hqList, nqList, hist]) => {
		hqList.hqListings = hqList.listings;
		hqList.nqListings = nqList.listings;
		hqList.listings = [...hqList.hqListings, ...hqList.nqListings];
		hqList.recentHistory = hist.entries;
		return hqList;
	});
}

const joinDefaultByID = (worldStream, defaultStream) => {
	return joinByID([worldStream, defaultStream], 'ID',
	([worldList, defaultList]) => {
		worldList.defaultList = defaultList;
		return worldList;
	})
}


export {parseHistoryLists, parseMarketLists, joinHistoryByID, joinDefaultByID};
export default {parseHistoryLists, parseMarketLists, joinHistoryByID, joinDefaultByID};
