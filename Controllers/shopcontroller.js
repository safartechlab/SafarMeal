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
    owner: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    address: Joi.string().optional(),
  }),
};

const addshop = async (req, res) => {
  try {
    const { error } = shopSchema.create.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    if (!req.file || !req.file.path)
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });

    // Multer-Cloudinary stores the URL in req.file.path
    req.body.image = req.file.path;

    const shop = new Shop(req.body);
    await shop.save();

    await shop.populate("owner", "username email phone");

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: shop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateshop = async (req, res) => {
  try {
    const { error } = shopSchema.update.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid Shop ID" });

    // If new image uploaded
    if (req.file && req.file.path) {
      req.body.image = req.file.path; // Cloudinary URL
    }

    const updated = await Shop.findByIdAndUpdate(id, req.body, { new: true })
      .populate("owner", "username email phone");

    if (!updated)
      return res.status(404).json({ success: false, message: "Shop not found" });

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getshopbyID = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate(
      "owner",
      "name email"
    );

    if (!shop)
      return res.status(404).json({ success: false, message: "Shop not found" });

    res.status(200).json({ success: true, data: shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getallshop = async (req, res) => {
  try {
    const shops = await Shop.find().populate("owner", "name email");

    res.status(200).json({
      success: true,
      total: shops.length,
      data: shops,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteshop = async (req, res) => {
  try {
    const deleted = await Shop.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Shop not found" });

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
