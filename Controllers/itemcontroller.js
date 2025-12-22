const Item = require("../Models/itemmodel");
const Shop = require("../Models/shopmodel");
const Joi = require("joi");
const mongoose = require("mongoose");

const itemSchema = {
  create: Joi.object({
    itemname: Joi.string().required(),
    price: Joi.number().required(),
    category: Joi.string()
      .valid(
        "Snacks",
        "Gujrati Thali",
        "Breakfast",
        "Lunch",
        "Main Course",
        "Desserts",
        "Pizza",
        "Burgers",
        "Sandwiches",
        "South Indian",
        "North Indian",
        "Chinese",
        "Fast Food",
        "Others"
      )
      .required(),
    foodtype: Joi.string().valid("veg", "non-veg").required(),
  }).options({ convert: true }),

  update: Joi.object({
    itemname: Joi.string().optional(),
    price: Joi.number().optional(),
    category: Joi.string().optional(),
    foodtype: Joi.string().optional(),
  }),
};

const addItem = async (req, res) => {
  try {
    const { error } = itemSchema.create.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const { shopId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID",
      });
    }

    const shop = await Shop.findOne({
      _id: shopId,
      owner: req.user._id,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found or unauthorized",
      });
    }

    const item = await Item.create({
      shop: shop._id,
      itemname: req.body.itemname,
      foodimage: req.file.path,
      price: req.body.price,
      category: req.body.category,
      foodtype: req.body.foodtype,
    });

    shop.items.push(item._id);
    await shop.save();

    res.status(201).json({
      success: true,
      message: "Item added successfully",
      data: item,
    });
  } catch (error) {
    console.error("Add Item Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const { error } = itemSchema.update.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Item ID",
      });
    }

    const item = await Item.findById(itemId).populate("shop");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // 🔒 Check ownership
    if (item.shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.file && req.file.path) {
      req.body.foodimage = req.file.path;
    }

    const updatedItem = await Item.findByIdAndUpdate(itemId, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Update Item Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Shop ID",
      });
    }

    const shop = await Shop.findOne({
      _id: shopId,
      owner: req.user._id,
    }).populate("items");

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      data: shop.items,
    });
  } catch (error) {
    console.error("Get Items Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Item ID",
      });
    }

    const item = await Item.findById(itemId).populate("shop");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Get Single Item Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Item ID",
      });
    }

    const item = await Item.findById(itemId).populate("shop");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Shop.findByIdAndUpdate(item.shop._id, {
      $pull: { items: item._id },
    });

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addItem,
  updateItem,
  getItemsByShop,
  getSingleItem,
  deleteItem,
};
