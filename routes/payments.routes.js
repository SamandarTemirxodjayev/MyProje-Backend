const {Router} = require("express");
const translationController = require("../controllers/payments.controller.js");
const router = Router();

router.get("/payme", translationController.PaymeHandler);

module.exports = router;
