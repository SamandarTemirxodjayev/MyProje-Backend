const adminRouter = require("./admin.routes.js");
const translationsRouter = require("./translations.routes.js");
const usersRouter = require("./users.routes.js");
const paymentsRouter = require("./payments.routes.js");
const {Router} = require("express");
const router = Router();
const middleware = require("../middlewares/working.middleware.js");
const controller = require("../controllers/general.controller.js");

router.use("/admins", adminRouter);
router.use("/translations", middleware, translationsRouter);
router.use("/users", middleware, usersRouter);
router.get("/working", controller.getIsWorking);
router.use("/payments", middleware, paymentsRouter);

module.exports = router;
