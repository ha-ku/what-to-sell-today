import { Duplex } from 'stream';
import { EventEmitter, once } from 'events';


class WorkerStream extends Duplex {
	constructor(options, port) {
		super(options);
		this.emitter = new EventEmitter();
		this.emitter.setMaxListeners(20);
		this.port = port;
		this.port.on('message', ({eventName, data}) => {
			this.emitter.emit(eventName, ...(data ?? []));
		})

		this.upstreamNeedDrain = this.downstreamNeedDrain = true;
		this.emitter.on('drain', () => this.upstreamNeedDrain = false)
		this.emitter.on('pause', () => this.upstreamNeedDrain = true)
	}
	_write(chunk, encoding, cb) {
		this._writev([{chunk, encoding}], cb);
	}
	_writev(chunks, cb) {
		if(new Set(chunks.map(c => c.encoding)).size === 1) { // should not write with mixed encoding
			const encoding = chunks[0].encoding;
			chunks = chunks.map(c => c.chunk);
			let transferList = [];
			if(encoding === 'buffer') { // check if buffer could be transferred
				chunks = chunks.map(chunk =>
					(!chunk.byteOffset || chunk.length !== chunk.buffer.length) ?
						Buffer.alloc(chunk.length, chunk)
						: chunk
				)
				transferList = chunks.map(c => c.buffer)
			}
			if(this.upstreamNeedDrain) { // wait drain if needed
				once(this.emitter, 'drain')
					.then(() => {
						this.port.postMessage({eventName: 'data', data: [chunks, encoding]}, transferList);
						cb(null);
					})
			}
			else {
				this.port.postMessage({eventName: 'data', data: [chunks, encoding]}, transferList);
				cb(null);
			}
		}
		else {
			throw new Error("different encodings pass to same workerStream");
		}
	}

	_final(cb) {
		this.port.postMessage({eventName: 'data', data: [[null]]});
		cb();
	}
	_read(_) {
		const data = (chunks, encode) => {
			/*if(this.rCounter === 1 && typeof chunk === 'string' && !chunk.startsWith("{")) {
				console.log('inspect');
				this.emitter.once('data', data);
				return;
			}*/
			const res = chunks.map(chunk => this.push(chunk, encode));
			if(res.some(r => !r) && !(chunks.length === 1 && chunks[0] === null)) {
				console.log('send pause');
				this.downstreamNeedDrain = true;
				this.port.postMessage({eventName: 'pause'});
			}
		}
		if(this.downstreamNeedDrain) {
			//console.log('send drain');
			this.downstreamNeedDrain = false;
			this.port.postMessage({eventName: 'drain'})
		}
		this.emitter.once('data', data);
	}
}

export default WorkerStream;
