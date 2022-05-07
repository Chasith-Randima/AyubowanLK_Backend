const express = require("express");

const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

// auth route

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.signout);

router.patch(
  "/updatePassword",
  authController.protected,
  authController.updatePassword
);

router.get("/getProfile/:slug", userController.getOneProfile);

router.patch("/updateMe", authController.protected, userController.updateMe);

router.get("/userProfile/:userId", userController.userProfile);

router.patch(
  "/updateUserProfile",
  authController.protected,
  userController.updateProfile
);

router.get("/userPhoto", userController.userPhoto);
module.exports = router;
