const {Router} = require("express");
const controller = require("../controllers/admin.controller.js");
const middleware = require("../middlewares/admin.middleware.js");

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/users", middleware, controller.getUsers);
router.post("/users/:id", middleware, controller.submitUserById);

router.post("/directions", middleware, controller.createDirections);
router.get("/directions", middleware, controller.getAllDirections);
router.get("/directions/:id", middleware, controller.getDirectionById);
router.put("/directions/:id", middleware, controller.updateDirectionsById);
router.delete("/directions/:id", middleware, controller.deleteDirectionsById);

router.post("/advantages", middleware, controller.createAdvantages);
router.get("/advantages", middleware, controller.getAllAdvantages);
router.get("/advantages/:id", middleware, controller.getAdvantagesById);
router.put("/advantages/:id", middleware, controller.updateAdvantageById);
router.delete("/advantages/:id", middleware, controller.deleteAdvantagesById);

router.post("/categories", middleware, controller.createCategory);
router.get("/categories", middleware, controller.getAllCategories);
router.get("/categories/:id", middleware, controller.getCategoryById);
router.put("/categories/:id", middleware, controller.updateCategoryById);
router.delete("/categories/:id", middleware, controller.deleteCategoryById);

router.post("/subcategories", middleware, controller.createSubCategory);
router.get("/subcategories", middleware, controller.getAllSubCategories);
router.get("/subcategories/:id", middleware, controller.getSubCategoryById);
router.put("/subcategories/:id", middleware, controller.updateSubCategoryById);
router.delete(
	"/subcategories/:id",
	middleware,
	controller.deleteSubCategoryById,
);

router.post("/innercategories", middleware, controller.createInnerCategory);
router.get("/innercategories", middleware, controller.getAllInnerCategories);
router.get("/innercategory/:id", middleware, controller.getInnerCategoryById);
router.get(
	"/innercategories/:id",
	middleware,
	controller.getInnerCategoriesGetByCategoriesId,
);
router.put(
	"/innercategories/:id",
	middleware,
	controller.updateInnerCategoryById,
);
router.delete(
	"/innercategories/:id",
	middleware,
	controller.deleteInnerCategoryById,
);

router.post("/brands", middleware, controller.createBrand);
router.get("/brands", middleware, controller.getAllBrands);
router.get("/brands/:id", middleware, controller.getBrandById);
router.put("/brands/:id", middleware, controller.updateBrandById);
router.delete("/brands/:id", middleware, controller.deleteBrandById);

router.get("/usage-rules", middleware, controller.getUsage);
router.post("/usage-rules", middleware, controller.updateUsage);

router.get("/links", middleware, controller.getLinks);
router.post("/links", middleware, controller.updateLinks);

router.get("/working", middleware, controller.getIsWorking);
router.post("/working", middleware, controller.updateLinks);

router.post("/shopping-gid", middleware, controller.createShoppingGid);
router.get("/shopping-gid", middleware, controller.getAllShoppingGids);
router.get(
	"/shopping-gid/limited/:limit",
	middleware,
	controller.getActiveLimitedShoppingGids,
);
router.get("/shopping-gid/:id", middleware, controller.getShoppingGidById);
router.put("/shopping-gid/:id", middleware, controller.updateShoppingGidById);
router.delete(
	"/shopping-gid/:id",
	middleware,
	controller.deleteShoppingGidById,
);

router.post("/products", middleware, controller.createProducts);
router.get("/brands", middleware, controller.getAllBrands);
router.get("/brands/:id", middleware, controller.getBrandById);
router.put("/brands/:id", middleware, controller.updateBrandById);
router.delete("/brands/:id", middleware, controller.deleteBrandById);

module.exports = router;
