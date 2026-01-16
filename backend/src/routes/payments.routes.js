const express = require("express");
const paymentsController = require("../controllers/payments.controller");

const router = express.Router();

router.post("/", paymentsController.createPayment);
router.get("/", paymentsController.listPayments);
router.get("/:id", paymentsController.getPaymentStatus);
router.post("/:id/retry", paymentsController.triggerRetry);
router.get("/:id/retries", paymentsController.getRetries);
router.delete("/:id", paymentsController.deletePayment);

module.exports = router;
