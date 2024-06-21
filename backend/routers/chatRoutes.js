import { Router } from "express";
import Product from "../models/productModel.js";
import Chat from "../models/chatModel.js";
import mongoose from "mongoose";
import { isAuth, isSellerOrAdmin } from "../utils.js";

const chatRouter = Router();

chatRouter.post('/send', isAuth, async (req, res) => {

  let { productId, message, receiverId,isOffer=false } = req.body;
  const user = req.user;

  try {

    if (!receiverId) {
      const product = await Product.findById(productId);
      console.log("product===>", product);
      receiverId = product.seller;
    }
    const chat = new Chat({
      senderId: user?._id,
      productId,
      message,
      receiverId,
      isOffer
    });
    await chat.save();
    res.status(200).send('Message sent');
  } catch (error) {
    res.status(500).send('Error sending message: ' + error.message);
  }

});

chatRouter.get('/messages', isAuth, async (req, res) => {

  const { productId, senderId } = req.query;
  const user = req.user;

  if (!senderId && !productId) return res.status(400).send("Please provide both sender and product id");

  try {
    const messages = await Chat.find({ productId, senderId: { $in: [senderId, user?._id] } });
    return res.status(200).send(messages || []);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).send('Error getting messages: ' + error.message);
  }
});

chatRouter.get('/messages/buyer', isAuth, async (req, res) => {

  const { productId } = req.query;
  const user = req.user;

  if (!productId) return res.status(400).send("Please provide  product id");

  try {
    const product = await Product.findById(productId);
    const sellerId = product?.seller;

    console.log(user?._id, sellerId);

    const messages = await Chat.find({
      productId,
      $or: [
        { senderId: sellerId, receiverId: user?._id },
        { senderId: user?._id, receiverId: sellerId }
      ]
    });
    return res.status(200).send(messages || []);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).send('Error getting messages: ' + error.message);
  }
});


chatRouter.get("/buyer/list", isAuth, async (req, res) => {
  try {

    const user = req.user;

    const products = await Product.find({ seller: user?._id || "" }, "_id");
    const productIds = products?.map(product => product?._id);


    const chatList = await Chat.aggregate([{
      $match: {
        senderId: new mongoose.Types.ObjectId(user?._id || ""),
        productId: { $nin: productIds }
      }
    }, {
      $group: {
        _id: {
          productId: "$productId",
          senderId: "$senderId"
        }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id.productId',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    {
      $unwind: '$productDetails'
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.senderId',
        foreignField: '_id',
        as: 'senderDetails'
      }
    },
    {
      $unwind: '$senderDetails'
    },
    {
      $sort: {
        'senderDetails.name': 1
      }
    }
    ]);

    return res.status(200).json(chatList);
  }
  catch (error) {
    return res.status(200).send("Error in getting seller chat list" + error?.message);
  }

});

chatRouter.get("/seller/list", isAuth, isSellerOrAdmin, async (req, res) => {
  try {

    const user = req.user;

    const products = await Product.find({ seller: user?._id || "" }, "_id");
    const productIds = products?.map(product => product?._id);

    console.log(user?._id);

    let chatList = await Chat.aggregate([{
      $match: {
        productId: { $in: productIds }, senderId: { $ne: new mongoose.Types.ObjectId(user?._id || "") }
      }
    }, {
      $group: {
        _id: {
          productId: "$productId",
          senderId: "$senderId"
        }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id.productId',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    {
      $unwind: '$productDetails'
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.senderId',
        foreignField: '_id',
        as: 'senderDetails'
      }
    },
    {
      $unwind: '$senderDetails'
    },
    {
      $sort: {
        'senderDetails.name': 1
      }
    }
    ]);

    return res.status(200).json(chatList);
  }
  catch (error) {
    return res.status(200).send("Error in getting seller chat list" + error?.message);
  }

});


export default chatRouter;