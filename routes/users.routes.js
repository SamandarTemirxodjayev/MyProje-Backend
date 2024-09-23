const {Router} = require("express");
const controller = require("../controllers/users.controller.js");
const middleware = require("../middlewares/users.middleware.js");
const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/profile", middleware, controller.editProfile);
router.get("/me", middleware, controller.getMe);
router.post("/reset-password", middleware, controller.resetPassword);
router.post("/restore-password", controller.restorePassword);
router.post("/restore-password/:uuid", controller.restorePasswordConfirm);
router.get("/directions", controller.getDirections);
router.get("/advantages", controller.getAdvantages);
router.get("/categories", controller.getCategories);
router.get("/brands", controller.getBrands);

module.exports = router;
