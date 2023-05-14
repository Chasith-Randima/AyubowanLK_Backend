const Article = require("../models/articleModel");
const Category = require("../models/categoryModel");

const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const slugify = require("slugify");
const Tag = require("../models/tagModel");
const { convert } = require("html-to-text");

const smartTrim = (str, length, delim, appendix) => {
  if (str.length <= length) return str;

  var trimmedStr = str.substr(0, length + delim.length);

  var lastDelimIndex = trimmedStr.lastIndexOf(delim);
  if (lastDelimIndex >= 0) trimmedStr = trimmedStr.substr(0, lastDelimIndex);

  if (trimmedStr) trimmedStr += appendix;
  return trimmedStr;
};

exports.createArticle = catchAsync(async (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  // console.log(req.user, "this is from top");

  form.parse(req, async (err, fields, files) => {
    // console.log(fields, files);
    if (err) {
      console.log(err);
      return next(new AppError(err, 400));
      // return res.status(400).json({
      //   error: err,
      // });
    }

    const { title, article, categories, tags, slug } = fields;

    if (!title || !title.length) {
      return next(new AppError("Title is required"));
      // return res.status(400).json({
      //   error: "Title  is required",
      // });
    }

    if (!article) {
      return next(new AppError("Content is too short ", 409));
      return res.status(409).json({
        error: "Content is too short",
      });
    }

    let newArticle = new Article();

    newArticle.title = smartTrim(title, 70, " ", "...");
    newArticle.article = article;
    newArticle.excerpt = smartTrim(article, 600, " ", " ...");
    newArticle.mtitle = `${title} | ${process.env.NEXT_PUBLIC_APP_NAME}`;

    // let tempMDesc;

    // assert.equal(stripHtml(article.substring(0, 160)).result, tempMDesc);
    newArticle.mdesc = convert(article.substring(0, 160), { wordwrap: 160 });
    newArticle.slug = slugify(slug, { lower: true });
    newArticle.categories = categories && categories.split(",");
    newArticle.tags = tags && tags.split(",");
    newArticle.postedBy = req.user._id;

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return next(
          new AppError("Image should be less than 1mb in size...", 400)
        );
        // return res.status(400).json({
        //   error: "Image Should be less than 1mb in size",
        // });
      }

      newArticle.photo.data = fs.readFileSync(files.photo.filepath);
      newArticle.photo.contentType = files.photo.mimetype;
    }

    const done = await newArticle.save();

    if (!done) {
      return next(
        new AppError("There was an error saving the article...", 400)
      );
      // return res.status(400).json({
      //   message: "error"
      // });
    }

    res.status(200).json({
      message: "success",
      done,
    });
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;

  let doc = await Article.findOne({ slug: slug });

  if (!doc) {
    return next(new AppError("There is no document with that slug"));
    // return res.status(400).json({
    //   message: "There is no docuemnt with that slug",
    // });
  }

  let form = new formidable.IncomingForm();

  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    // console.log(err);
    if (err) {
      return next(new AppError(err, 400));
      // return res.status(400).json({
      //   error: err,
      // });
    }

    let slugBeforeMerge = doc.slug;
    // console.log(fields);

    doc = _.merge(doc, fields);

    doc.slug = slugBeforeMerge;

    const { article, categories, tags } = fields;

    if (article) {
      doc.excerpt = smartTrim(article, 320, " ", "...");
      doc.mdesc = article.substring(0, 160);
      doc.article = article;
    }
    if (categories) {
      doc.categories = categories.split(",");
    }
    if (tags) {
      doc.tags = tags.split(",");
    }

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return next(new AppError("Image should be less than 1mb in size", 400));
        // return res.status(400).json({
        //   error: "Image shoulg be less than 1mb in size",
        // });
      }

      doc.photo.data = fs.readFileSync(files.photo.filepath);
      doc.photo.contentType = files.photo.mimetype;
    }

    const newArticle = await doc.save();

    if (!newArticle) {
      return next(new AppError("There was and error updating the article.."));
      // return res.status(400).json({
      //   error: "there was an error updating the article",
      // });
    }

    res.status(200).json({
      status: "success",
      newArticle,
    });
  });
});

exports.allArticles = catchAsync(async (req, res, next) => {
  const limit = req.body.limit ? parseInt(req.body.limit) : 10;
  const skip = req.body.skip ? parseInt(req.body.skipt) : 0;

  const doc = await Article.find({})
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "_id title slug excerpt categories tags postedBy createdAt updatedAt"
    );

  if (!doc) {
    return next(new AppError("There are no documents..."));
  }

  res.status(200).json({
    message: "success",
    results: doc.length,
    doc,
  });
});
exports.allArticlesWithTagsAndCategories = catchAsync(
  async (req, res, next) => {
    let count = await Article.count();
    const limit = req.query.limit ? req.query.limit : 9;
    const skip = req.query.skip ? req.query.skip : 0;
    // const limit = req.body.limit ? parseInt(req.body.limit) : 10;
    // const skip = req.body.skip ? parseInt(req.body.skipt) : 0;

    const doc = await Article.find({})
      .populate("postedBy", "_id name photo slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id title slug excerpt postedBy updatedAt");

    if (!doc) {
      return next(new AppError("There are no documents...", 404));
    }
    // const cat = await Category.find({}).select("_id name slug");

    // if (!cat) {
    //   return next(new AppError("There are no categories...", 404));
    // }

    // const tags = await Tag.find({}).select("_id name slug");

    // if (!tags) {
    //   return next(new AppError("There are no tags...", 404));
    // }

    // console.log(count);

    res.status(200).json({
      message: "success",
      results: doc.length,
      totalCount: count,
      doc,
      // cat,
      // tags,
    });
  }
);

exports.getOneArticle = catchAsync(async (req, res, next) => {
  const doc = await Article.findOne({ slug: req.params.slug })
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username");

  if (!doc) {
    return next(new AppError("There is no document with that Slug", 404));
  }

  res.status(200).json({
    status: "success",
    doc,
  });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  doc = await Article.findOneAndDelete({ slug: req.params.slug });

  if (!doc) {
    return next(new AppError("There is no document found with that Slug", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Document deleted successfully..",
    doc: null,
  });
});

exports.articlePhoto = async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug }).select(
    "photo"
  );

  if (!article) {
    return res.status(404).json({
      error: "There is no photo with that slug...",
    });
  }
  res.set("Content-Type", article.photo.contentType);
  return res.send(article.photo.data);
};

exports.listRelated = async (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 3;

  const { _id, categories } = req.body;

  const doc = await Article.find({
    _id: { $ne: _id },
    categories: { $in: categories },
  })
    .limit(limit)
    .populate("postedBy", "_id name")
    .select("title slug postedBy createdAt updatedAt");

  if (!doc) {
    return res.status(400).json({
      error: "Articles not found",
    });
  }

  res.status(200).json({
    doc,
  });
};

exports.manageArticleList = async (req, res) => {
  const doc = await Article.find({})
    .sort({ createdAt: -1 })
    .populate("postedBy", "_id name")
    .select("_id title slug postedBy updatedAt createdAt");

  if (!doc) {
    return res.status(404).json({
      error: "There are no documents...",
    });
  }

  res.status(200).json({
    doc,
  });
};

exports.getArticlesByCategories = async (req, res) => {
  // console.log(req.params, req.query);

  let count = await Article.count({ categories: cat });

  let skip =
    !req.query.skip || req.query.skip == "undefined" ? 0 : req.query.skip;
  let limit =
    !req.query.limit || req.query.limit == "undefined" ? 9 : req.query.limit;

  // console.log(skip, limit, "afeter");

  const cat = await Category.findOne({ slug: req.params.slug });
  if (!cat) {
    return res.status(404).json({
      error: "There is no category with that slug...",
    });
  }

  // console.log(cat);

  const doc = await Article.find({ categories: cat })
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "_id title slug excerpt categories postedBy tags createdAt updatedAt"
    );

  // console.log(doc);

  if (!doc) {
    return res.status(404).json({
      error: "There are no articles with that category",
    });
  }

  // const tags = await Tag.find({})

  // console.log(count);

  return res.status(200).json({
    message: "success",
    results: doc.length,
    totalCount: count,
    doc,
    cat,
  });
};
exports.getArticlesByTags = async (req, res) => {
  // console.log(req.params);

  let count = await Article.count({ tags: tag });
  let skip =
    !req.query.skip || req.query.skip == "undefined" ? 0 : req.query.skip;
  let limit =
    !req.query.limit || req.query.limit == "undefined" ? 9 : req.query.limit;

  // console.log(skip, limit, "afeter");

  const tag = await Tag.findOne({ slug: req.params.slug });
  if (!tag) {
    return res.status(404).json({
      error: "There is no tag with that slug...",
    });
  }

  // console.log(cat);

  const doc = await Article.find({ tags: tag })
    .populate("categories", "_id name slug")
    .populate("postedBy", "_id name slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "_id title slug excerpt categories postedBy tags createdAt updatedAt"
    );

  if (!doc) {
    return res.status(404).json({
      error: "There are no articles with that tag",
    });
  }

  // const tags = await Tag.find({})

  // console.log(count);

  // console.log(doc.length);

  return res.status(200).json({
    message: "success",
    results: doc.length,
    totalCount: count,
    doc,
    tag,
  });
};

exports.listSearch = async (req, res) => {
  const search = req.query.search;
  let doc;

  if (search) {
    doc = await Article.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { article: { $regex: search, $options: "i" } },
      ],
    }).select("-photo -article -mdesc -mtitle");

    // console.log(doc);
  }

  if (!doc) {
    return res.status(404).json({
      error: "There are no articles that match to your search ",
    });
  }

  return res.status(200).json({
    message: "success",
    doc,
  });
};

exports.getAllTagsAndCategories = async (req, res) => {
  // console.log("Get ALl Categories and tags..");
  const tags = await Tag.find({});

  if (!tags) {
    return res.status(404).json({
      error: "Thre are no Tags...",
    });
  }
  const cats = await Category.find({});

  if (!cats) {
    return res.status(404).json({
      error: "Thre are no Categories...",
    });
  }

  return res.status(200).json({
    message: "success",
    cats,
    tags,
  });
};
