import getReports from "../modules/getReports.mjs";
import {reportEncoder} from "../avro/marketReportTypes.mjs";


export async function marketReport(ctx) {
	const encoder = reportEncoder(1024);
	const {readable, writeable} = new TransformStream();
	const writer = writeable.getWriter();

	encoder.on('data', data => {
		writer.write(data);
	})
	getReports(ctx.request, encoder);

	return new Response(readable);
}