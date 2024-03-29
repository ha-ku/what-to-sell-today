'use strict'; // code generated by pbf v3.2.1

// HistoryRecord ========================================

var HistoryRecord = exports.HistoryRecord = {};

HistoryRecord.read = function (pbf, end) {
    return pbf.readFields(HistoryRecord._readField, {hq: false, pricePerUnit: 0, quantity: 0, timestamp: 0}, end);
};
HistoryRecord._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.hq = pbf.readBoolean();
    else if (tag === 2) obj.pricePerUnit = pbf.readVarint(true);
    else if (tag === 3) obj.quantity = pbf.readVarint(true);
    else if (tag === 4) obj.timestamp = pbf.readVarint(true);
};
HistoryRecord.write = function (obj, pbf) {
    if (obj.hq) pbf.writeBooleanField(1, obj.hq);
    if (obj.pricePerUnit) pbf.writeVarintField(2, obj.pricePerUnit);
    if (obj.quantity) pbf.writeVarintField(3, obj.quantity);
    if (obj.timestamp) pbf.writeVarintField(4, obj.timestamp);
};

// History ========================================

var History = exports.History = {};

History.read = function (pbf, end) {
    return pbf.readFields(History._readField, {itemID: 0, entries: []}, end);
};
History._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.itemID = pbf.readVarint(true);
    else if (tag === 2) obj.entries.push(HistoryRecord.read(pbf, pbf.readVarint() + pbf.pos));
};
History.write = function (obj, pbf) {
    if (obj.itemID) pbf.writeVarintField(1, obj.itemID);
    if (obj.entries) for (var i = 0; i < obj.entries.length; i++) pbf.writeMessage(2, HistoryRecord.write, obj.entries[i]);
};

// MarketRecord ========================================

var MarketRecord = exports.MarketRecord = {};

MarketRecord.read = function (pbf, end) {
    return pbf.readFields(MarketRecord._readField, {hq: false, pricePerUnit: 0, quantity: 0, retainerName: ""}, end);
};
MarketRecord._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.hq = pbf.readBoolean();
    else if (tag === 2) obj.pricePerUnit = pbf.readVarint(true);
    else if (tag === 3) obj.quantity = pbf.readVarint(true);
    else if (tag === 4) obj.retainerName = pbf.readString();
};
MarketRecord.write = function (obj, pbf) {
    if (obj.hq) pbf.writeBooleanField(1, obj.hq);
    if (obj.pricePerUnit) pbf.writeVarintField(2, obj.pricePerUnit);
    if (obj.quantity) pbf.writeVarintField(3, obj.quantity);
    if (obj.retainerName) pbf.writeStringField(4, obj.retainerName);
};

// Market ========================================

var Market = exports.Market = {};

Market.read = function (pbf, end) {
    return pbf.readFields(Market._readField, {itemID: 0, lastUploadTime: 0, listings: []}, end);
};
Market._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.itemID = pbf.readVarint(true);
    else if (tag === 2) obj.lastUploadTime = pbf.readVarint(true);
    else if (tag === 3) obj.listings.push(MarketRecord.read(pbf, pbf.readVarint() + pbf.pos));
};
Market.write = function (obj, pbf) {
    if (obj.itemID) pbf.writeVarintField(1, obj.itemID);
    if (obj.lastUploadTime) pbf.writeVarintField(2, obj.lastUploadTime);
    if (obj.listings) for (var i = 0; i < obj.listings.length; i++) pbf.writeMessage(3, MarketRecord.write, obj.listings[i]);
};

// Record ========================================

var Record = exports.Record = {};

Record.read = function (pbf, end) {
    return pbf.readFields(Record._readField, {price: 0, quantity: 0, seller: ""}, end);
};
Record._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.price = pbf.readVarint(true);
    else if (tag === 2) obj.quantity = pbf.readVarint(true);
    else if (tag === 3) obj.seller = pbf.readString();
};
Record.write = function (obj, pbf) {
    if (obj.price) pbf.writeVarintField(1, obj.price);
    if (obj.quantity) pbf.writeVarintField(2, obj.quantity);
    if (obj.seller) pbf.writeStringField(3, obj.seller);
};

// ServerQualityReport ========================================

var ServerQualityReport = exports.ServerQualityReport = {};

ServerQualityReport.read = function (pbf, end) {
    return pbf.readFields(ServerQualityReport._readField, {lowestPrice: null, meanLowPrice: 0, meanLowHistoryPrice: 0, volumns: []}, end);
};
ServerQualityReport._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.lowestPrice = Record.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) obj.meanLowPrice = pbf.readFloat();
    else if (tag === 3) obj.meanLowHistoryPrice = pbf.readFloat();
    else if (tag === 4) pbf.readPackedVarint(obj.volumns, true);
};
ServerQualityReport.write = function (obj, pbf) {
    if (obj.lowestPrice) pbf.writeMessage(1, Record.write, obj.lowestPrice);
    if (obj.meanLowPrice) pbf.writeFloatField(2, obj.meanLowPrice);
    if (obj.meanLowHistoryPrice) pbf.writeFloatField(3, obj.meanLowHistoryPrice);
    if (obj.volumns) pbf.writePackedVarint(4, obj.volumns);
};

// ServerReport ========================================

var ServerReport = exports.ServerReport = {};

ServerReport.read = function (pbf, end) {
    return pbf.readFields(ServerReport._readField, {nq: null, hq: null, all: null, lastUploadTime: 0}, end);
};
ServerReport._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.nq = ServerQualityReport.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) obj.hq = ServerQualityReport.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3) obj.all = ServerQualityReport.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 4) obj.lastUploadTime = pbf.readVarint(true);
};
ServerReport.write = function (obj, pbf) {
    if (obj.nq) pbf.writeMessage(1, ServerQualityReport.write, obj.nq);
    if (obj.hq) pbf.writeMessage(2, ServerQualityReport.write, obj.hq);
    if (obj.all) pbf.writeMessage(3, ServerQualityReport.write, obj.all);
    if (obj.lastUploadTime) pbf.writeVarintField(4, obj.lastUploadTime);
};

// Error ========================================

var Error = exports.Error = {};

Error.read = function (pbf, end) {
    return pbf.readFields(Error._readField, {code: 0, content: ""}, end);
};
Error._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.code = pbf.readVarint(true);
    else if (tag === 2) obj.content = pbf.readString();
};
Error.write = function (obj, pbf) {
    if (obj.code) pbf.writeVarintField(1, obj.code);
    if (obj.content) pbf.writeStringField(2, obj.content);
};

// Report ========================================

var Report = exports.Report = {};

Report.read = function (pbf, end) {
    return pbf.readFields(Report._readField, {name: "", ID: 0, enName: "", cost: 0, lastUploadTime: 0, nq: null, hq: null, all: null, defaultServer: null, err: null}, end);
};
Report._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.name = pbf.readString();
    else if (tag === 2) obj.ID = pbf.readVarint(true);
    else if (tag === 3) obj.enName = pbf.readString();
    else if (tag === 4) obj.cost = pbf.readFloat();
    else if (tag === 5) obj.lastUploadTime = pbf.readVarint(true);
    else if (tag === 6) obj.nq = ServerQualityReport.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 7) obj.hq = ServerQualityReport.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 8) obj.all = ServerQualityReport.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 9) obj.defaultServer = ServerReport.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 10) obj.err = Error.read(pbf, pbf.readVarint() + pbf.pos);
};
Report.write = function (obj, pbf) {
    if (obj.name) pbf.writeStringField(1, obj.name);
    if (obj.ID) pbf.writeVarintField(2, obj.ID);
    if (obj.enName) pbf.writeStringField(3, obj.enName);
    if (obj.cost) pbf.writeFloatField(4, obj.cost);
    if (obj.lastUploadTime) pbf.writeVarintField(5, obj.lastUploadTime);
    if (obj.nq) pbf.writeMessage(6, ServerQualityReport.write, obj.nq);
    if (obj.hq) pbf.writeMessage(7, ServerQualityReport.write, obj.hq);
    if (obj.all) pbf.writeMessage(8, ServerQualityReport.write, obj.all);
    if (obj.defaultServer) pbf.writeMessage(9, ServerReport.write, obj.defaultServer);
    if (obj.err) pbf.writeMessage(10, Error.write, obj.err);
};
