const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }
    //destructure the fields
    const { name, description, price, category, stock } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }

    let product = new Product(fields);
    try {
      console.log({ file });
      console.log({ product });

      //handle file here
      if (file.photo) {
        if (file.photo.size > 3000000) {
          return res.status(400).json({
            error: "File size too big!",
          });
        }

        product.photo.data = fs.readFileSync(file.photo.filepath);
        product.photo.contentType = file.photo.type;
      }
    } catch (err) {
      console.log("this is error 1")
      console.log(err);
    }
    //  console.log(product);

    //save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "Saving tshirt in DB failed",
        });
      }
      res.json(product);
    });
  });
};
exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};
//middleware to get photos so that the site loads faster
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

//delete controllers
exports.removeProduct = (req, res) => {
  let product = req.product;
  product.remove((err, removedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "failed to delete the product",
      });
    }
    res.json({
      message: "Removed succefully",
      removedProduct,
    });
  });
};

//update controllers
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }

    let product = req.product;
    product = _.extend(product, fields);
    try {
      console.log({ file });
      console.log({ product });

      //handle file here
      if (file.photo) {
        if (file.photo.size > 3000000) {
          return res.status(400).json({
            error: "File size too big!",
          });
        }

        product.photo.data = fs.readFileSync(file.photo.filepath);
        product.photo.contentType = file.photo.type;
      }
    } catch (err) {
      console.log(err);
    }
    //  console.log(product);

    //save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "updation of product failed",
        });
      }
      res.json(product);
    });
  });
};

//product listing

exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 7;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  Product.find()
    .select("-photo") //minus to tell that we dont want photo from the product schema
    .populate("category")
    .sort([[sortBy, "asc"]]) //asc is ascending ,we can write ascending too
    .limit(limit) //to restrict the number of  products to be shown
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No Product found",
        });
      }
      res.json(products);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "No Category FOUND",
      });
    }
    res.json(category);
  });
};

//to update the values of stock and sold
exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((product) => {
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $inc: { stock: -product.count, sold: +product.count } },
      },
    };
  });

  product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk Op Failed",
      });
    }
    next();
  });
};
