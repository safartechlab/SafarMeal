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
  }),

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

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found for this user",
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

module.exports = { addItem };
