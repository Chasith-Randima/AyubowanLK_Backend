const factory = require("./handlerFactory");
const Tag = require("../models/tagModel");

exports.getOneTag = factory.getOneDoc(Tag);
exports.geAllTags = factory.getAll(Tag);
exports.createOneTag = factory.createOne(Tag);
exports.updateOneTag = factory.updateOne(Tag);
exports.deleteOneTag = factory.deleteOne(Tag);
