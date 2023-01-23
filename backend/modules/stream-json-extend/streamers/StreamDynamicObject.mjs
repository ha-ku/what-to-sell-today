import StreamBase from './StreamDynamicBase.mjs';
import withParser from 'stream-json/utils/withParser.js';

class StreamDynamicObject extends StreamBase {
  static make(options) {
    return new StreamDynamicObject(options);
  }

  static withParser(options) {
    return withParser(StreamDynamicObject.make, options);
  }

  constructor(options) {
    super(options);
    this._level = 1;
    this._lastKey = null;
  }

  _wait(chunk, _, callback) {
    // first chunk should open an array
    if (chunk.name !== 'startObject') {
      return callback(new Error('Top-level object should be an object.'));
    }
    this._transform = this._filter;
    return this._transform(chunk, _, callback);
  }

  _push(discard) {
    if (this._lastKey === null) {
      this._lastKey = this._assembler.key;
    } else {
      !discard && this.push({key: this._lastKey, value: this._assembler.current[this._lastKey]});
      this._assembler.current = {};
      this._lastKey = null;
    }
  }
}

StreamDynamicObject.make.Constructor = StreamDynamicObject;
const streamDynamicObject = StreamDynamicObject.make;

export {streamDynamicObject};
export default StreamDynamicObject;
