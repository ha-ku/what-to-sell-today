import avro from "avsc/etc/browser/avsc-types.js";

const HISTORY_SCHEMA = {
	type: 'record',
	fields: [
		{name: 'itemID', type: 'int'},
		{
			name: 'entries', type: {
				type: 'array',
				items: {
					type: 'record',
					fields: [
						{name: 'hq', type: 'boolean'},
						{name: 'pricePerUnit', type: 'int'},
						{name: 'quantity', type: 'int'},
						{name: 'timestamp', type: 'long'}
					]
				}
			}
		}
	]
};
const MARKET_SCHEMA = {
	type: "record",
	fields: [
		{name: "itemID", type: "int"},
		{name: "lastUploadTime", type: "long"},
		{
			name: "listings",
			type: {
				type: "array",
				items: {
					type: "record",
					fields: [
						{name: "pricePerUnit", type: "int"},
						{name: "quantity", type: "int"},
						{name: "hq", type: "boolean"},
						{name: "retainerName", type: "string"}
					]
				}
			}
		}
	]
};
const TYPE = {
	history: avro.Type.forSchema(HISTORY_SCHEMA),
	market: avro.Type.forSchema(MARKET_SCHEMA)
}

export default TYPE;
