const express = require("express");
const upload = require("../Utls/upload");
const router = express.Router();

const {
  addshop,
  updateshop,
  getshopbyID,
  getallshop,
  deleteshop,
} = require("../Controllers/shopcontroller");

// Create Shop (with image upload)
router.post("/addshop", upload.single("image"), addshop);

// Update Shop (with image upload)
router.put("/updateshop/:id", upload.single("image"), updateshop);

// Get Shop by ID
router.get("/getshopbyID/:id", getshopbyID);

// Get All Shops
router.get("/getallshop", getallshop);

// Delete Shop by ID
router.delete("/deleteshop/:id", deleteshop);

module.exports = router;
