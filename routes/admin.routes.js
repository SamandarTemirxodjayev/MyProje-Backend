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

module.exports = router;
