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
router.get("/search", middleware, controller.searchProductandCategories);
router.get("/advantages", middleware, controller.getAdvantages);
router.get("/categories", middleware, controller.getCategories);
router.get("/category/:id", middleware, controller.getCategoryById);
router.get(
	"/subcategories/:id",
	middleware,
	controller.getSubcategoriesByCategoryId,
);
router.get("/subcategories", middleware, controller.getSubCategories);
router.get("/subcategory/:id", middleware, controller.getSubCategoriesById);
router.get("/innercategory/:id", middleware, controller.getInnerCategoryById);
router.get(
	"/innercategories/:categoryId",
	middleware,
	controller.getSubcategoriesWithInnerCategories,
);
router.get(
	"/innercategories/list/:id",
	middleware,
	controller.getinnercategoriesBySubcategoryid,
);
router.get("/brands", middleware, controller.getBrands);
router.get("/populars", middleware, controller.getPopulars);
router.get("/brand/:id", middleware, controller.getBrandById);
router.get("/links", middleware, controller.getLinks);
router.get("/usage-rules", controller.getUsage);
router.get("/shopping-gid", middleware, controller.getShoppingGidLimited);
router.get("/shopping-gid/:id", middleware, controller.getShoppingGidById);
router.get("/products", middleware, controller.getProducts);
router.get("/colors", middleware, controller.getColors);
router.get("/products/liked", middleware, controller.getLikedProducts);
router.post("/products/like", middleware, controller.toggleProductsLike);
router.get("/products/:id", middleware, controller.getProductsById);
router.get("/collections", middleware, controller.getinspirations);
router.get("/collections/:id", middleware, controller.getinspirationById);
router.get("/solutions", middleware, controller.getSolutions);

router.post("/subscribe/email", middleware, controller.subscribeUserByEmail);

router.get("/statistics", middleware, controller.getStatistics);
router.get("/max-balance", middleware, controller.getMaxBalance);
router.post("/order-file", middleware, controller.getOrderListInFile);
router.post("/orders", middleware, controller.createOrder);
router.get("/orders", middleware, controller.getAllOrders);
router.get("/orders/:id", middleware, controller.getOrderById);
router.get("/compare-products", middleware, controller.getCompareProducts);
router.get("/comments", middleware, controller.getAllComments);
router.post("/comments", middleware, controller.createCommentForProduct);

module.exports = router;
