const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

// article schema
const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      min: 3,
      max: 200,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    article: {
      type: {},
      required: true,
      min: 200,
      max: 200000,
    },
    excerpt: {
      type: String,
      max: 1000,
    },
    mtitle: {
      type: String,
      max: 1000,
    },
    mdesc: {
      type: String,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    categories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        //   required: true,
      },
    ],
    tags: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Tag",
        //   required:true
      },
    ],
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// articleSchema.pre("save", function () {
//   this.slug = slugify(this.title, { lower: true });
// });

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
