const articlController = require("./../controllers/articleController");
const authController = require("./../controllers/authController");

const express = require("express");

const router = express.Router();

// articles routes

router.use(authController.isLoggedIn);
router
  .route("/fullArticles")
  .get(articlController.allArticlesWithTagsAndCategories);

router.post("/related", articlController.listRelated);
router.get("/manageArticleList", articlController.manageArticleList);
router.get(
  "/getAllTagsAndCategories",
  articlController.getAllTagsAndCategories
);

router.get("/photo/:slug", articlController.articlePhoto);
router.get(
  "/articleByCategory/:slug",
  articlController.getArticlesByCategories
);
router.get("/search", articlController.listSearch);
router.get("/articleByTag/:slug", articlController.getArticlesByTags);

router
  .route("/")
  .get(articlController.allArticles)
  .post(authController.protected, articlController.createArticle);
router
  .route("/:slug")
  .get(articlController.getOneArticle)
  .patch(authController.protected, articlController.update)
  .delete(
    authController.protected,
    authController.restrictTo("Admin"),
    articlController.deleteOne
  );

module.exports = router;
