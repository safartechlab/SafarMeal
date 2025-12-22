const express = require("express");
const upload = require("../Utls/upload");
const router = express.Router();
const {Auth} = require("../Middleware/requireauth");

const {
  addshop,
  updateshop,
  getshopbyID,
  getallshop,
  deleteshop,
} = require("../Controllers/shopcontroller");

// Create Shop (with image upload)
router.post("/addshop", upload.single("image"),Auth, addshop);

// Update Shop (with image upload)
router.put("/updateshop/:id", upload.single("image"),Auth, updateshop);

// Get Shop by ID
router.get("/getshopbyID/:id", getshopbyID);

// Get All Shops
router.get("/getallshop", getallshop);

// Delete Shop by ID
router.delete("/deleteshop/:id", Auth,deleteshop);

module.exports = router;
