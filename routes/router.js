const adminRouter = require("./admin.routes.js");
const translationsRouter = require("./translations.routes.js");
const usersRouter = require("./users.routes.js");
const paymentsRouter = require("./payments.routes.js");
const {Router} = require("express");
const router = Router();

router.use("/admins", adminRouter);
router.use("/translations", translationsRouter);
router.use("/users", usersRouter);
router.use("/payments", paymentsRouter);

module.exports = router;
