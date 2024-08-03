import getReports from "../modules/getReports.mjs";
import Chain from "stream-chain";
import Pbf from "pbf";
import MarketReport from './MarketReport.mjs';
import lpstream from '../modules/lengthPrefixedWebstream.mjs';



import http2 from 'http2';
import {Transform} from "stream";


const server = http2.createServer();

server.on('stream', (stream, headers) => {
	stream.url = `https://${headers[':authority']}${headers[':path']}`;
	stream.headers = {
		host: `https://${headers[':authority']}`
	};
	stream.hostname = headers[':authority'];
	const lpEncodeStream = new Transform({
		transform(chunk, encoding, callback) {
			const stream = this;
			const lpEncoder = lpstream.encode(),
				writer = lpEncoder.writable.getWriter(),
				reader = lpEncoder.readable.getReader();
			writer.ready.then(() => writer.write(chunk)).then(() => writer.close());
			reader.read().then(function onData({done, value}) {
				if(done) {
					callback();
					return;
				}
				stream.push(value);
				reader.read().then(onData);
			})
		}
	})
	const encoder = new Chain([
		(obj) => {
			let pbf = new Pbf();
			MarketReport.Report.write(obj, pbf);
			return pbf.finish();
		},
		lpEncodeStream,
		stream
	]);
	getReports(stream, encoder);
})

server.listen(19092);
