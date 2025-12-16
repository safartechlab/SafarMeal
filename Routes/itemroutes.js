const express = require("express");
const upload = require("../Utls/upload");
const router = express.Router();
const {Auth} =  require("../Middleware/requireauth");

const {
  addItem
} = require("../Controllers/itemcontroller");

router.post("/addItem", upload.single("image"), Auth, addItem);


module.exports = router;
