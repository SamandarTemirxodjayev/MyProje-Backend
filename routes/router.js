const adminRouter = require("./admin.routes.js");
const translationsRouter = require("./translations.routes.js");
const {Router} = require("express");
const router = Router();

router.use("/admins", adminRouter);
router.use("/translations", translationsRouter);

module.exports = router;
