import StreamDynamicBase from './StreamDynamicBase.mjs';
import withParser from 'stream-json/utils/withParser.js';

class StreamDynamicArray extends StreamDynamicBase {
	static make(options) {
		return new StreamDynamicArray(options);
	}

	static withParser(options) {
		return withParser(StreamDynamicArray.make, options);
	}

	constructor(options) {
		super(options);
		this._level = 1;
		this._counter = 0;
	}

	_wait(chunk, _, callback) {
		// first chunk should open an array
		if (chunk.name !== 'startArray') {
			return callback(new Error('Top-level object should be an array.'));
		}
		this._transform = this._filter;
		return this._transform(chunk, _, callback);
	}

	_push(discard) {
		if (this._assembler.current.length) {
			if (discard) {
				++this._counter;
				this._assembler.current.pop();
			} else {
				//const tmp = this._assembler.current[this._assembler.current.length - 1];
				//console.log('StreamDynamicArray data: ', Object.keys(tmp), tmp.entries && tmp.entries.length ? tmp.entries.length : 'no entries lenght')
				this.push({key: this._counter++, value: this._assembler.current.pop()});
			}
		}
	}
}

StreamDynamicArray.make.Constructor = StreamDynamicArray;
const streamDynamicArray = StreamDynamicArray.make

export {streamDynamicArray};
export default StreamDynamicArray;
