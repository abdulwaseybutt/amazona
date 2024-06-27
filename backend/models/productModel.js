import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: false },
    seller: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
    userId: { type: String, required: true },
    slug: { type: String, required: false, unique: false },
    image: { type: String, required: true },
    images: [String],
    brand: { type: String, required: false },
    category: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: false },
    numReviews: { type: Number, required: false },
    reviews: [reviewSchema],
  },
  {
    timestamp: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
