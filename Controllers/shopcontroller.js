const Shop = require("../Models/shopmodel");
const Joi = require("joi");
const mongoose = require("mongoose");

const shopSchema = {
  create: Joi.object({
    shopname: Joi.string().min(2).required(),
    owner: Joi.string().required(),
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

// ✅ ADD SHOP
const addshop = async (req, res) => {
  try {
    const { error } = shopSchema.create.validate(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const shop = new Shop({
      shopname: req.body.shopname,
      owner: req.user._id,
      city: req.body.city,
      state: req.body.state,
      address: req.body.address,
      image: req.file.path,
    });

    await shop.save();
    await shop.populate("owner", "username email");

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE SHOP
const updateshop = async (req, res) => {
  try {
    const { error } = shopSchema.update.validate(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID",
      });

    if (req.file) {
      req.body.image = req.file.path; // ✅ Cloudinary URL
    }

    const updated = await Shop.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("owner", "username email");

    if (!updated)
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET SHOP BY ID
const getshopbyID = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate("owner", "username email phone")
      .populate("items");

    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });

    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ GET ALL SHOPS
const getallshop = async (req, res) => {
  try {
    const shops = await Shop.find().populate("owner", "username email phone");

    res.status(200).json({
      success: true,
      total: shops.length,
      data: shops,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ DELETE SHOP
const deleteshop = async (req, res) => {
  try {
    const deleted = await Shop.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId, // 🔒 secure
    });

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });

    res.status(200).json({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addshop,
  updateshop,
  getshopbyID,
  getallshop,
  deleteshop,
};
