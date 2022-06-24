const Category = require("./../models/categoryModel");
const factory = require("./handlerFactory");
const Article = require("../models/articleModel");

exports.getOneCategory = factory.getOneDoc(Category);
exports.getAllCategories = factory.getAll(Category);
exports.createOneCategory = factory.createOne(Category);
exports.updateOneCategory = factory.updateOne(Category);
exports.deleteOneCategory = factory.deleteOne(Category);
