const userController = require("../controllers/user.controller");

const router = require("express").Router();
router.get("/listUsers", userController.listUsers);
router.delete("/deleteUser", userController.deleteUser);
router.put("/updateUser", userController.updateUser);
router.get("/userDetails", userController.viewUserDetails);
router.get("/export", userController.exportUser);
router.get("/search", userController.findUsers);
router.get("/searchUsers", userController.searchUsers);
router.post("/createUser", userController.addUser);
router.get(
  "/exportUserWithSurveys",
  userController.exportUserWithBaselineSurveys
);
router.post("/changeUserPassword", userController.changeUserPassword);
router.post("/sendOTP", userController.sendOTP);
router.post("/verifyOTP", userController.verifyOTP)
module.exports = router;
