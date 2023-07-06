import buffer from "buffer";
const {Buffer} = buffer;
import {TransformStream} from 'stream/web';

function encodeLength(l){
	if(l < 0xfd) {
		const b = Buffer.alloc(1);
		b.writeUInt8(l, 0);
		return b;
	}
	if(l < 0xffff) {
		const b = Buffer.alloc(3);
		b.writeUInt8(0xfe, 0);
		b.writeUInt16LE(l, 1);
		return b;
	}
	const b = Buffer.alloc(5);
	b.writeUInt8(0xff, 0);
	b.writeUInt32LE(l, 1);
	return b;
}
function encode() {
	return new TransformStream({
		transform(chunk, controller) {
			chunk = Buffer.from(chunk);
			controller.enqueue(encodeLength(chunk.length))
			controller.enqueue(chunk);
		}
	})
}

function decodeLength(b) {
	if(b.length > 0) {
		const first = b.readUInt8(0);
		switch (first) {
			case 0xff:
				if (b.length > 5)
					return [5, b.readUInt32LE(1)];
				break;
			case 0xfe:
				if (b.length > 3)
					return [3, b.readUInt16LE(1)];
				break;
			default:
				return [1, first];
		}
	}
	return [0];
}

function decode() {
	return new TransformStream({
		transform(chunk, controller) {
			chunk = Buffer.from(chunk);
			if(this.b) {
				chunk = Buffer.concat([this.b, chunk]);
			}
			while (chunk.length > 0) {
				const [offset, l] = decodeLength(chunk);
				if(offset === 0)
					break;
				const frameLength = offset + l;
				if(chunk.length < frameLength)
					break;
				controller.enqueue(chunk.subarray(offset, frameLength));
				chunk = chunk.subarray(frameLength);
			}
			this.b = chunk;
		},
	})
}

const lp = {encode, decode};


export default lp;
export { encode, decode };