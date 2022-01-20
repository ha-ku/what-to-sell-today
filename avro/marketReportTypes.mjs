import avro from 'avsc/etc/browser/avsc-types.js';
import avroContainer from 'avsc/lib/containers.js';
const streams = avroContainer.streams;

const RECORD_SCHEMA = {
	type: 'record',
	name: 'Record',
	fields: [
		{name: 'price', type: 'int'},
		{name: 'quantity', type: 'int'},
		{name: 'seller', type: 'string'},
	]
}
const SERVER_QUAL_REPORT_SCHEMA = {
	type: 'record',
	name: 'ServerQualReport',
	fields: [
		{name: 'lowestPrice', type: ['null', 'Record'], default: null},
		{name: 'meanLowPrice', type: ['null', 'float'], default: null},
		{name: 'meanLowHistoryPrice', type: ['null', 'float'], default: null},
		{name: 'volumns', type: {type: 'array', items: 'int'}},
	]
}
const SERVER_REPORT_SCHEMA = {
	type: 'record',
	name: 'ServerReport',
	fields: [
		{name: 'nq', type: 'ServerQualReport'},
		{name: 'hq', type: 'ServerQualReport'},
		{name: 'all', type: 'ServerQualReport'},
		{name: 'lastUploadTime', type: 'long'}
	]
}
const ERROR_SCHEMA = {
	type: 'record',
	name: 'Error',
	fields: [
		{name: 'code', type: 'int'},
		{name: 'content', type: 'string'},
	]
}
const REPORT_SCHEMA = {
	type: 'record',
	name: 'Report',
	fields: [
		{name: 'name', type: ['null', 'string'], default: null},
		{name: 'ID', type: ['null', 'int'], default: null},
		{name: 'lastUploadTime', type: ['null', 'long'], default: null},
		{name: 'cost', type: ['null', 'float'], default: null},
		{name: 'nq', type: ['null', 'ServerQualReport'], default: null},
		{name: 'hq', type: ['null', 'ServerQualReport'], default: null},
		{name: 'all', type: ['null', 'ServerQualReport'], default: null},
		{name: 'defaultServer', type: ['null', 'ServerReport'], default: null},
		{name: 'err', type: ['null', 'Error'], default: null},
	]
}

let registry = {};
avro.Type.forSchema(RECORD_SCHEMA, {registry});
avro.Type.forSchema(SERVER_QUAL_REPORT_SCHEMA, {registry});
avro.Type.forSchema(SERVER_REPORT_SCHEMA, {registry});
avro.Type.forSchema(ERROR_SCHEMA, {registry});
avro.Type.forSchema(REPORT_SCHEMA, {registry});
const {Report} = registry;

const reportEncoder = (batchSize = 4) => new streams.RawEncoder(Report, {batchSize})
const reportDecoder = () => new streams.RawDecoder(Report);
const exports = {reportDecoder, reportEncoder, Report};


export {reportDecoder, reportEncoder};
export default exports;