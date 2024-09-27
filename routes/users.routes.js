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
router.get("/directions", middleware, controller.getDirections);
router.get("/advantages", middleware, controller.getAdvantages);
router.get("/categories", middleware, controller.getCategories);
router.get("/subcategories", middleware, controller.getSubCategories);
router.get(
	"/innercategories/:categoryId",
	middleware,
	controller.getSubcategoriesWithInnerCategories,
);
router.get("/brands", middleware, controller.getBrands);
router.get("/links", middleware, controller.getLinks);
router.get("/usage-rules", middleware, controller.getUsage);
router.get("/working", controller.getWorking);
router.get(
	"/shopping-gid/:limit",
	middleware,
	controller.getShoppingGidLimited,
);

module.exports = router;
