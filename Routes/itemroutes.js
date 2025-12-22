const express = require("express");
const upload = require("../Utls/upload");
const router = express.Router();
const { Auth } = require("../Middleware/requireauth");

const {
  addItem,
  updateItem,
  getItemsByShop,
  getSingleItem,
  deleteItem,
} = require("../Controllers/itemcontroller");

router.post("/addItem/:shopId", Auth, upload.single("foodimage"), addItem);

router.put("/updateItem/:itemId", Auth, upload.single("foodimage"), updateItem);

router.get("/getItems/:shopId", Auth, getItemsByShop);

router.get("/getItem/:itemId", Auth, getSingleItem);

router.delete("/deleteItem/:itemId", Auth, deleteItem);

module.exports = router;
