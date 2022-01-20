import StreamBase from './StreamDynamicBase.mjs';
import withParser from 'stream-json/utils/withParser.js';

class StreamDynamicValues extends StreamBase {
  static make(options) {
    return new StreamDynamicValues(options);
  }

  static withParser(options) {
    return withParser(StreamDynamicValues.make, Object.assign({}, options, {jsonStreaming: true}));
  }

  constructor(options) {
    super(options);
    this._counter = 0;
    this._level = 0;
  }

  _push(discard) {
    if (discard) {
      ++this._counter;
    } else {
      this.push({key: this._counter++, value: this._assembler.current});
    }
    this._assembler.current = this._assembler.key = null;
  }
}

StreamDynamicValues.make.Constructor = StreamDynamicValues;
const streamDynamicValues = StreamDynamicValues.make

export {streamDynamicValues};
export default StreamDynamicValues;
