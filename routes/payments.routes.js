const {Router} = require("express");
const translationController = require("../controllers/payments.controller.js");
const router = Router();

router.post("/payme", translationController.PaymeHandler);

module.exports = router;
