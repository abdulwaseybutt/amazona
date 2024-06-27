import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { API_URL } from "../utils";

const StripePaymentForm = ({
  totalPrice = 0,
  name,
  onSuccess,
  userInfo,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post(
        `${API_URL}api/stripe/create-payment-intent`,
        { totalPrice },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      )
      .then(async (response) => {
        await stripe
          .confirmCardPayment(response.data.clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name,
              },
            },
          })
          .then((res) => {
            onSuccess(res.paymentIntent);
          })
          .catch((err) => onError(err));
      })
      .catch((error) => {
        return;
      });
  };
  return (
    <form onSubmit={handleSubmit}>
      <CardElement options={{ hidePostalCode: true }} />

      <button
        className="mt-3 opacity-100 cursor-pointer w-full rounded-md border border-transparent bg-orange-600 px-4 py-2 text-base font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
        type="submit"
        disabled={!stripe || loading}
      >
        Pay
      </button>
    </form>
  );
};
export default StripePaymentForm;
