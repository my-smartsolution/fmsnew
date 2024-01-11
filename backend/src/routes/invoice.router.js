const express = require("express");
const upload = require("../middleware/fileupload");
const { createInvoice, getInvoices } = require("../controller/invoice/invoice");

const router = express.Router();

router.post("/", upload.single("consignment"), createInvoice);
router.get("/",  getInvoices);


module.exports = router;
