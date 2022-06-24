const Article = require("../models/articleModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const factory = require("./handlerFactory");
const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");

exports.getOneUser = factory.getOneDoc(User);
exports.getAllUsers = factory.getAll(User);
exports.createOneUser = factory.createOne(User);
exports.updateOneUser = factory.updateOne(User);
exports.deleteOneUser = factory.deleteOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updateUser) {
    return next(new AppError("There was an error updating the profile..", 400));
  }

  res.status(200).json({
    status: "success",
    updateUser,
  });
});

exports.userProfile = async (req, res) => {
  console.log(req.params.userId);
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      error: "There is no user with that ID",
    });
  }

  const articles = await Article.find({ postedBy: user._id })
    .populate("postedBy", "name _id slug")
    .limit(10)
    .select("_id title slug postedBy updatedAt photo");

  if (!articles) {
    return res.status(404).json({
      error: "There are no articles that was postedby this user",
    });
  }

  return res.status(200).json({
    message: "Success",
    user,
    articles,
  });
};

exports.updateProfile = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtension = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Profile could not be updated...",
      });
    }

    let user = req.user;
    console.log(user, "before");

    user = _.extend(user, fields);
    console.log(user, "after");

    if (user.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb",
        });
      }
      user.photo.data = fs.readFileSync(files.photo.filepath);
      user.photo.contentType = files.photo.mimetype;
    }

    const newUser = await User.findByIdAndUpdate(req.user._id, user, {
      new: true,
      runValidators: true,
    });

    if (!newUser) {
      return res.status(400).json({
        error: "Thre was an error updating the user",
      });
    }

    return res.status(200).json({
      newUser,
    });
  });
};

exports.userPhoto = async (req, res) => {
  const userName = req.params.username;

  const user = await User.findOne({ name: userName });

  if (!user) {
    return res.status(404).json({
      error: "There is no user with that username",
    });
  }

  if (user.photo.data) {
    res.set("Content-Type", user.photo.contentType);

    return res.send(user.photo.data);
  }
};

exports.getOneProfile = async (req, res) => {
  const doc = await User.findOne({ _id: req.params.slug });

  if (!doc) {
    return next(new AppError("There is no document with that slug...", 404));
  }

  res.status(200).json({
    message: "success",
    doc,
  });
};
