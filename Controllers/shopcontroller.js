const Shop = require("../Models/shopmodel");
const Joi = require("joi");
const mongoose = require("mongoose");

/* ================= VALIDATION ================= */

const shopSchema = {
  create: Joi.object({
    shopname: Joi.string().min(2).required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    address: Joi.string().required(),
  }),
  update: Joi.object({
    shopname: Joi.string().min(2).optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    address: Joi.string().optional(),
  }),
};

/* ================= ADD SHOP ================= */

const addshop = async (req, res) => {
  try {
    const { error } = shopSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({ success: false, message: error.message });

    if (!req.file)
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });

    if (!req.user)
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    const shop = await Shop.create({
      shopname: req.body.shopname,
      owner: req.user._id,
      city: req.body.city,
      state: req.body.state,
      address: req.body.address,
      image: req.file.path,
    });

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: shop,
    });
  } catch (err) {
    console.error("ADD SHOP ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= UPDATE SHOP ================= */

const updateshop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid shop ID" });

    if (req.file) req.body.image = req.file.path;

    const updated = await Shop.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("UPDATE SHOP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= GET SHOP BY ID ================= */

const getshopbyID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid shop ID" });

    const shop = await Shop.findById(id).populate(
      "owner",
      "username email phone"
    );

    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });

    res.status(200).json({ success: true, data: shop });
  } catch (err) {
    console.error("GET SHOP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= GET ALL SHOPS ================= */

const getallshop = async (req, res) => {
  try {
    const shops = await Shop.find().populate(
      "owner",
      "username email phone"
    );

    res.status(200).json({
      success: true,
      total: shops.length,
      data: shops,
    });
  } catch (err) {
    console.error("GET ALL SHOPS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= DELETE SHOP ================= */

const deleteshop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid shop ID" });

    const deleted = await Shop.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    });

    if (!deleted)
      return res.status(404).json({
        success: false,
        message: "Shop not found or not owned by you",
      });

    res.status(200).json({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (err) {
    console.error("DELETE SHOP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addshop,
  updateshop,
  getshopbyID,
  getallshop,
  deleteshop,
};
