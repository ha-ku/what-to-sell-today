import getReports from "../modules/getReports.mjs";
import Chain from "stream-chain";
import Pbf from "pbf";
import MarketReport from './MarketReport.js';
import lpstream from 'length-prefixed-stream';



import http2 from 'http2';


const server = http2.createServer();

server.on('stream', (stream, headers) => {
	stream.url = `https://${headers[':authority']}${headers[':path']}`;
	stream.headers = {
		host: `https://${headers[':authority']}`
	};
	stream.hostname = headers[':authority'];
	const encoder = new Chain([
		(obj) => {
			let pbf = new Pbf();
			MarketReport.Report.write(obj, pbf);
			return pbf.finish();
		}
	]);
	getReports(stream, encoder);
	encoder.pipe(lpstream.encode()).pipe(stream);
})

server.listen(19092);
