const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const slugify = require("slugify");

// template crud functions
exports.getOneDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params);
    const doc = await Model.findOne({ slug: req.params.slug });

    if (!doc) {
      return next(new AppError("There is no document with that slug...", 404));
    }

    res.status(200).json({
      message: "success",
      doc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.find();

    if (!doc) {
      return next(new AppError("There are no articles availbale....", 404));
    }

    res.status(200).json({
      status: "success",
      results: doc.length,
      doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let slug = slugify(req.body.name, { lower: true });
    req.body.slug = slug;
    const doc = await Model.create(req.body);

    if (!doc) {
      return next(
        new AppError("There was an problem creating the document...", 400)
      );
    }

    res.status(200).json({
      status: "Success",
      message: "Success...",
      doc,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(new AppError("No document found with that Id"));
    }

    res.status(200).json({
      status: "success",
      doc,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.params.slug);

    const doc = await Model.findOneAndDelete({ slug: req.params.slug });

    if (!doc) {
      return next(new AppError("No docuemnt found with that Id", 404));
    }

    return res.status(200).json({
      status: "success",
      data: null,
    });
  });
