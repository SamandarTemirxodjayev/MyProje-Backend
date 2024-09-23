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

router.post("/brands", middleware, controller.createBrand);
router.get("/brands", middleware, controller.getAllBrands);
router.get("/brands/:id", middleware, controller.getBrandById);
router.put("/brands/:id", middleware, controller.updateBrandById);
router.delete("/brands/:id", middleware, controller.deleteBrandById);

router.get("/usage-rules", middleware, controller.getUsage);
router.post("/usage-rules", middleware, controller.updateUsage)

module.exports = router;
