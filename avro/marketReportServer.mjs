import getReports from "../modules/getReports.mjs";

import {reportEncoder} from "./marketReportTypes.mjs";
import http2 from 'http2';


const server = http2.createServer();

server.on('stream', (stream, headers) => {
	stream.url = `https://${headers[':authority']}${headers[':path']}`;
	stream.headers = {
		host: `https://${headers[':authority']}`
	};
	stream.hostname = headers[':authority'];
	const encoder = reportEncoder(1024);
	getReports(stream, encoder);
	encoder.pipe(stream);
})

server.listen(9092);
