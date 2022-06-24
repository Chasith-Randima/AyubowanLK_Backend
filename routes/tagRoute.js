const express = require("express");
const router = express.Router();

const tagController = require("./../controllers/tagController");

router.route("/").get(tagController.geAllTags).post(tagController.createOneTag);
router
  .route("/:slug")
  .get(tagController.getOneTag)
  .patch(tagController.updateOneTag)
  .delete(tagController.deleteOneTag);

module.exports = router;
