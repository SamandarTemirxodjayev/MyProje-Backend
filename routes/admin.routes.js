const {Router} = require("express");
const controller = require("../controllers/admin.controller.js");
const middleware = require("../middlewares/admin.middleware.js");

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/users", middleware, controller.getUsers);
router.get("/users/search", middleware, controller.searchUser);
router.get("/users/:id", middleware, controller.getUserById);
router.post("/users/:id", middleware, controller.submitUserById);
router.delete("/users/:id", middleware, controller.deleteUserById);
router.post("/users", middleware, controller.createUser);
router.get("/me", middleware, controller.getMe);

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
router.get("/categories/search", middleware, controller.searchCategories);
router.get("/categories/:id", middleware, controller.getCategoryById);
router.put("/categories/:id", middleware, controller.updateCategoryById);
router.delete("/categories/:id", middleware, controller.deleteCategoryById);

router.post("/subcategories", middleware, controller.createSubCategory);
router.get("/subcategories", middleware, controller.getAllSubCategories);
router.get("/subcategories/search", middleware, controller.searchSubcategories);
router.get("/subcategories/:id", middleware, controller.getSubCategoryById);
router.put("/subcategories/:id", middleware, controller.updateSubCategoryById);
router.delete(
	"/subcategories/:id",
	middleware,
	controller.deleteSubCategoryById,
);

router.post("/innercategories", middleware, controller.createInnerCategory);
router.get("/innercategories", middleware, controller.getAllInnerCategories);
router.get(
	"/innercategories/search",
	middleware,
	controller.searchinnercategories,
);
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
router.get("/brands/search", middleware, controller.searchBrands);
router.get("/brands/:id", middleware, controller.getBrandById);
router.put("/brands/:id", middleware, controller.updateBrandById);
router.delete("/brands/:id", middleware, controller.deleteBrandById);

router.get("/usage-rules", middleware, controller.getUsage);
router.post("/usage-rules", middleware, controller.updateUsage);

router.get("/links", middleware, controller.getLinks);
router.put("/links", middleware, controller.updateLinks);

router.get("/working", middleware, controller.getIsWorking);
router.put("/working", middleware, controller.updateisWorkding);

router.get("/balance", middleware, controller.getBalance);
router.put("/balance", middleware, controller.updateBalance);

router.post("/shopping-gid", middleware, controller.createShoppingGid);
router.get("/shopping-gid", middleware, controller.getAllShoppingGids);
router.get("/shopping-gid/:id", middleware, controller.getShoppingGidById);
router.get(
	"/shopping-gid/limited/:limit",
	middleware,
	controller.getActiveLimitedShoppingGids,
);

router.get("/shopping-gid/search", middleware, controller.searchShoppingGids);
router.put("/shopping-gid/:id", middleware, controller.updateShoppingGidById);
router.delete(
	"/shopping-gid/:id",
	middleware,
	controller.deleteShoppingGidById,
);

router.post("/products", middleware, controller.createProducts);
router.get("/products", middleware, controller.getAllProducts);
router.get("/products/search", middleware, controller.searchProducts);
router.get("/products/:id", middleware, controller.getProductById);
router.put("/products/:id", middleware, controller.updateProductById);
router.delete("/products/:id", middleware, controller.deleteProductById);

router.post("/collections", middleware, controller.createCollections);
router.get("/collections", middleware, controller.getAllCollections);
router.get("/collections/:id", middleware, controller.getCollectionsById);
router.put("/collections/:id", middleware, controller.updateCollectionsById);
router.delete("/collections/:id", middleware, controller.deleteCollectionsById);

router.post("/solutions", middleware, controller.createSolution);
router.get("/solutions", middleware, controller.getAllSolutions);
router.get("/solutions/search", middleware, controller.searchSolutions);
router.get("/solutions/:id", middleware, controller.getSolutionById);
router.put("/solutions/:id", middleware, controller.updateSolutionById);
router.delete("/solutions/:id", middleware, controller.deleteSolutionById);

router.post("/colors", middleware, controller.createColor);
router.get("/colors", middleware, controller.getAllColors);
router.get("/colors/search", middleware, controller.searchColors);
router.get("/colors/:id", middleware, controller.getColorById);
router.put("/colors/:id", middleware, controller.updateColorById);
router.delete("/colors/:id", middleware, controller.deleteColorById);

router.post("/materials", middleware, controller.createMaterial);
router.get("/materials", middleware, controller.getAllMaterials);
router.get("/materials/:id", middleware, controller.getMaterialById);
router.put("/materials/:id", middleware, controller.updateMaterialById);
router.delete("/materials/:id", middleware, controller.deleteMaterialById);

router.post("/dizayns", middleware, controller.createDizayn);
router.get("/dizayns", middleware, controller.getAllDizayns);
router.get("/dizayns/:id", middleware, controller.getDizaynById);
router.put("/dizayns/:id", middleware, controller.updateDizaynById);
router.delete("/dizayns/:id", middleware, controller.deleteDizaynById);

router.post("/poverxnosts", middleware, controller.createPoverxnost);
router.get("/poverxnosts", middleware, controller.getAllPoverxnosts);
router.get("/poverxnosts/:id", middleware, controller.getPoverxnostById);
router.put("/poverxnosts/:id", middleware, controller.updatePoverxnostById);
router.delete("/poverxnosts/:id", middleware, controller.deletePoverxnostById);

router.post("/naznacheniyas", middleware, controller.createNaznacheniya);
router.get("/naznacheniyas", middleware, controller.getAllNaznacheniyas);
router.get("/naznacheniyas/:id", middleware, controller.getNaznacheniyaById);
router.put("/naznacheniyas/:id", middleware, controller.updateNaznacheniyaById);
router.delete("/naznacheniyas/:id", middleware, controller.deleteNaznacheniyaById);

router.post("/primeneniyas", middleware, controller.createPrimeneniya);
router.get("/primeneniyas", middleware, controller.getAllPrimeneniyas);
router.get("/primeneniyas/:id", middleware, controller.getPrimeneniyaById);
router.put("/primeneniyas/:id", middleware, controller.updatePrimeneniyaById);
router.delete("/primeneniyas/:id", middleware, controller.deletePrimeneniyaById);

router.post("/stils", middleware, controller.createStil);
router.get("/stils", middleware, controller.getAllStils);
router.get("/stils/:id", middleware, controller.getStilById);
router.put("/stils/:id", middleware, controller.updateStilById);
router.delete("/stils/:id", middleware, controller.deleteStilById);

router.post("/countries", middleware, controller.createCountry);
router.get("/countries", middleware, controller.getAllCountries);
router.get("/countries/:id", middleware, controller.getCountryById);
router.put("/countries/:id", middleware, controller.updateCountryById);
router.delete("/countries/:id", middleware, controller.deleteCountryById);

router.post("/comments", middleware, controller.createComment);
router.get("/comments", middleware, controller.getAllComments);
router.get("/comments/:id", middleware, controller.getCommentById);
router.put("/comments/:id", middleware, controller.updateCommentById);
router.delete("/comments/:id", middleware, controller.deleteCommentById);

router.post("/infos", middleware, controller.createInfo);
router.get("/infos", middleware, controller.getAllInfos);
router.get("/infos/:id", middleware, controller.getInfoById);
router.put("/infos/:id", middleware, controller.updateInfoById);
router.delete("/infos/:id", middleware, controller.deleteInfoById);

router.get("/orders", middleware, controller.getAllOrders);
router.get("/orders/:id", middleware, controller.getOrderById);
router.put("/orders/done/:id", middleware, controller.submitProductDelivery);
router.put("/orders/cancel/:id", middleware, controller.cancelProductDelivery);
router.put("/orders/submit/:id", middleware, controller.doneOrderDelivery);

router.get("/withdraws", middleware, controller.getAllWithdraws);
router.get("/withdraws/:id", middleware, controller.getWithdrawsById);
router.put("/withdraws/:id", middleware, controller.updateWithdrawInformations);

module.exports = router;
