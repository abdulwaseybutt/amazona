import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAuth } from "../utils.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(stripeSecretKey);
const stripeRouter = express.Router();

stripeRouter.post(
  "/create-payment-intent",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { totalPrice } = req.body;
    console.log("totalPrice", totalPrice);

    try {
      // Create a PaymentIntent with the total amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100), // Amount in cents
        currency: "usd",
      });

      res.status(201).send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.log("error", error);
      res.status(400).send({ message: error.message });
    }
  })
);

export default stripeRouter;
