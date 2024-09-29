import express from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { isAdmin, isAuth, isSellerOrAdmin } from "../utils.js";
import Category from "../models/productCategoryModel.js";
import multer from "multer";
// import csv from "csv-parser";
import { promises as fs } from 'fs';
import { v2 as cloudinary } from "cloudinary";
import AdmZip from "adm-zip";


const productRouter = express.Router();

const upload = multer({ dest: 'uploads/' });

productRouter.get("/", async (req, res) => {
  // const seller = req.query.seller || "";
  //   const sellerFilter = seller ? { seller } : {};

  //   const products = await Product.find({ ...sellerFilter }).populate(
  //     "seller",
  //     "seller.name seller.logo"
  //   );
  try {
    const products = await Product.find({});
    console.log("products are fetched....");
    return res.status(200).send(products);
  }
  catch (err) {
    return res.status(400).send({
      err: err,
      message: "Error in fetching the products.."
    })
  }
});

productRouter.get("/seller", async (req, res) => {
  // const seller = req.query.seller || "";
  //   const sellerFilter = seller ? { seller } : {};
  const sellerId = req.query.id;
  //   const products = await Product.find({ ...sellerFilter }).populate(
  //     "seller",
  //     "seller.name seller.logo"
  //   );
  const products = await Product.find();
  const sellerProduct = products?.filter((item) => item?.userId === sellerId);
  // console.log("sellerProduct ", sellerProduct);
  if (sellerProduct) {
    res.send(sellerProduct);
  } else {
    res.status(404).send({ message: "Products not found for the seller" });
  }
});

productRouter.post(
  "/",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: req.body.product_name,
      userId: req.body.userId,
      seller: req.user._id,
      slug: req.body.product_name.toLowerCase().replaceAll(" ", "_"),
      image: req.body.image,
      price: req.body.product_price,
      category: req.body.product_category,
      brand: req.body.product_brand,
      countInStock: req.body.product_stock,
      rating: 0,
      numReviews: 0,
      description: req.body.product_desc,
    });
    console.log("newProduct ", newProduct);
    try {
      const product = await newProduct.save();
      console.log("product saved", product);
      res.status(200).send({ message: "Product Created", product });
    }
    catch (error) {
      let errorMessage = error?.message;
      if (errorMessage.includes("duplicate key")) errorMessage = "The product name is already taken";
      return res.status(400).send({ message: "Error in creating the product", error: errorMessage });
    }
  })
);

productRouter.put(
  "/:id",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (product) {
      product.name = req.body.name;
      product.userId = req.body.userId;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.images = req.body.images;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;

      await product.save();

      res.send({ message: "Product Updated" });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

productRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    const afterDeletePoduct = await Product.find();
    if (afterDeletePoduct) {
      res.send(afterDeletePoduct);
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

productRouter.post(
  "/:id/reviews",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: "You already submitted a review" });
      }

      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;

      const updatedProduct = await product.save();

      res.status(201).send({
        message: "Review Created",
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

const PAGE_SIZE = 3;

productRouter.get(
  "/admin",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;
    const seller = req.query.seller || "";
    const sellerFilter = seller ? { seller } : {};

    const products = await Product.find({ ...sellerFilter })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments();

    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;

    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || "";
    const price = query.price || "";
    const rating = query.rating || "";
    const order = query.order || "";
    const searchQuery = query.query || "";

    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        }
        : {};
    const categoryFilter = category && category !== "all" ? { category } : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
          rating: {
            $gte: Number(rating),
          },
        }
        : {};
    const priceFilter =
      price && price !== "all"
        ? {
          // 1-50
          price: {
            $gte: Number(price.split("-")[0]),
            $lte: Number(price.split("-")[1]),
          },
        }
        : {};
    const sortOrder =
      order === "featured"
        ? { featured: -1 }
        : order === "lowest"
          ? { price: 1 }
          : order === "highest"
            ? { price: -1 }
            : order === "toprated"
              ? { rating: -1 }
              : order === "newest"
                ? { createdAt: -1 }
                : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });

    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    const categories = await Category.find();

    res.send(categories);
  })
);

productRouter.post(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    // const categories = await Product.find().distinct("category");
    console.log("request ", req.body);
    // const product = await newProduct.save();
    const newCategory = new Category({
      name: req.body.category_name,
      slug: req.body.category_name.toLowerCase().replaceAll(" ", "_"),
    });
    const category = await newCategory.save();
    res.send({ message: "Category Created", category });
  })
);

productRouter.get("/slug/:slug", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    "seller",
    "seller.name seller.logo seller.reviews seller.numReviews"
  );

  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product not found." });
  }
});

productRouter.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "seller",
    "seller.name"
  );

  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product not found." });
  }
});

productRouter.post(
  "/bulk-upload",
  upload.single('zipFile'), // To handle ZIP file upload
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    console.log("landed in bulk upload");

    // Extract ZIP file contents
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();
    console.log("zipEntries", zipEntries);

    let products = [];
    let imageFiles = {};
    let successfulUploads = 0;
    let totalProducts = 0;

    // Process each entry in the ZIP file
    zipEntries.forEach((entry) => {
      if (entry.entryName.endsWith('.csv')) {
        // Parse the CSV file
        const csvFile = zip.readAsText(entry);
        csvFile
          .split('\n')
          .map(row => row.split(',')) // Split CSV into rows and columns
          .forEach(([srNo, name, category, price, stock, description, brand]) => {
            if (srNo && name && category && price && stock && description && brand) {
              products.push({ srNo, name, category, price, stock, description, brand });
            }
            totalProducts++;
          });
        if (totalProducts > 0) {
          totalProducts = totalProducts - 1;
        }
      } else if (entry.entryName.match(/\.(jpg|jpeg|png)$/)) {
        // Collect image files
        const srNo = entry.entryName.split('.')[0]; // Get SrNo from image name
        imageFiles[srNo] = entry;
      }
    });

    console.log("Total No of Products:", totalProducts);

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Iterate over products, upload images, and save to MongoDB
    for (let product of products) {
      let discardedThisProduct = false;
      const imageEntry = imageFiles[product.srNo];

      if (!imageEntry) {
        discardedThisProduct = true; // Mark the product as discarded once
        console.log(`Image missing for product ${product.name}, discarded.`);
      }

      if (!discardedThisProduct) {
        try {
          // Upload image to Cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream((error, result) => {
              if (error) reject(error);
              resolve(result);
            }).end(zip.readFile(imageEntry));
          });

          // Create new product object
          const newProduct = new Product({
            name: product.name,
            seller: req.user._id,
            userId: req.user._id,
            slug: product.name.toLowerCase().replace(/\s+/g, '-'),
            image: result.secure_url, // Cloudinary image URL
            price: product.price,
            category: product.category,
            brand: product.brand,
            countInStock: product.stock,
            description: product.description,
            rating: 0,
            numReviews: 0,
          });

          // Save the product to MongoDB
          await newProduct.save();
          successfulUploads++;
        } catch (error) {
          console.error(`Failed to upload image for product ${product.name}: ${error}`);
        }
      }
    }

    // Clean up ZIP file
    try {
      await fs.unlink(req.file.path); // Delete the file asynchronously
    } catch (fsError) {
      console.error("File Deletion Error:", fsError);
    }

    res.send({
      message: 'Products uploaded successfully!',
      successfulUploads,
      totalProducts,
      failedUploads: totalProducts - successfulUploads,
    });
  })
);


export default productRouter;
