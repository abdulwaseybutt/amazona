import Axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/esm/Card";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import ListGroup from "react-bootstrap/ListGroup";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Store } from "../Store";
import { toast } from "react-toastify";
import { API_URL, getError } from "../utils";
import CheckoutSteps from "../components/CheckoutSteps";
import LoadingBox from "../components/LoadingBox";
import CartItem from "../components/cartItem";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, { loading: false });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrderHandler = async () => {
    const {
      cartItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = cart;
    const orderData = {
      orderItems: cartItems,
      shippingAddress,
      paymentMethod: "stripe",
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    };

    const toastId = toast.loading("Your order is processing....");
    try {
      dispatch({ type: "CREATE_REQUEST" });

      const { data } = await Axios.post(`${API_URL}api/orders`, orderData, {
        headers: {
          authorization: `Bearer ${userInfo.token}`,
        },
      });

      ctxDispatch({ type: "CART_CLEAR" });
      dispatch({ type: "CREATE_SUCCESS" });
      localStorage.removeItem("cartItems");
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      toast.error(getError(err));
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate("/placeorder");
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>

      <div className="container mx-auto px-4">
        {/* <div className="flex min-h-full flex-1 flex-col justify-center pb-6 ">
          <div className="w-full ">
            <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Place Order
            </h2>
          </div>
        </div> */}

        <div className="flex gap-10 py-10">
          <div className="flex flex-col gap-6 w-full">
            <h2 className=" text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Preview Order
            </h2>

            <div className="bg-white p-4 rounded-lg shadow sm:rounded-lg">
              <div className="border-b border-gray-200 bg-white ">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Shipping
                </h3>
              </div>

              <div className="mt-6">
                <dl className="flex flex-col gap-2">
                  <div className="flex align-middle justify-between items-center">
                    <dt className="text-sm font-medium leading-6 text-gray-700">
                      <b>Full Name:</b>
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {cart.shippingAddress.fullName}
                    </dd>
                  </div>
                  <div className="flex align-middle justify-between items-center">
                    <dt className="text-sm font-medium leading-6 text-gray-700">
                      <b>Address:</b>
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {cart.shippingAddress.address},{cart.shippingAddress.city}
                      , {cart.shippingAddress.postalCode},
                      {cart.shippingAddress.country}
                    </dd>
                  </div>
                  <Link className="text-gray-700 font-bold" to="/shipping">
                    Edit
                  </Link>
                </dl>
              </div>
            </div>

            {/* <div className="bg-white p-4 rounded-lg shadow sm:rounded-lg">
              <div className="border-b border-gray-200 bg-white ">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Payment
                </h3>
              </div>

              <div className="mt-6">
                <dl className="flex flex-col gap-2">
                  <div className="flex align-middle justify-between items-center">
                    <dt className="text-sm font-medium leading-6 text-gray-700">
                      <b>Method:</b>
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {cart.paymentMethod}
                    </dd>
                  </div>
                  <Link className="text-gray-700 font-bold" to="/payment">
                    Edit
                  </Link>
                </dl>
              </div>
            </div> */}

            <div className="bg-white p-4 rounded-lg shadow sm:rounded-lg">
              <div className=" bg-white ">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Items
                </h3>
              </div>

              <div className="flex w-full flex-col gap-2">
                <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
                  {cart?.cartItems?.map((product, index) => (
                    <CartItem
                      key={`cart-item-${index}`}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
                <Link to="/cart">Edit</Link>
              </div>
            </div>
          </div>

          <div
            aria-labelledby="summary-heading"
            className="rounded-lg sticky top-4 bg-gray-100 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 lg:w-1/2 w-full h-max"
          >
            <h2
              id="summary-heading"
              className="text-xl font-bold text-gray-900"
            >
              Order summary
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">
                  ${cart.itemsPrice.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="flex items-center text-sm text-gray-600">
                  <span>Shipping estimate</span>
                  <span
                    href="#"
                    className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">
                      Learn more about how shipping is calculated
                    </span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="#ea580c"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  ${cart.shippingPrice.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="flex text-sm text-gray-600">
                  <span>Tax estimate</span>
                  <span
                    href="#"
                    className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">
                      Learn more about how tax is calculated
                    </span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="#ea580c"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  ${cart.taxPrice.toFixed(2)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">
                  Order total
                </dt>
                <dd className="text-base font-medium text-gray-900">
                  ${cart.totalPrice.toFixed(2)}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <button
                type="submit"
                onClick={placeOrderHandler}
                disabled={cart.cartItems.length === 0}
                className={`w-full rounded-md ${
                  cart.cartItems.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "opacity-100 cursor-pointer"
                } border border-transparent bg-orange-600 px-4 py-2 text-base font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50`}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Address: </strong> {cart.shippingAddress.address},
                {cart.shippingAddress.city}, {cart.shippingAddress.postalCode},
                {cart.shippingAddress.country}
              </Card.Text>
              <Link to="/shipping">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{" "}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">Edit</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${cart.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${cart.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${cart.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Place Order
                    </Button>
                  </div>
                  {loading && <LoadingBox />}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
    </div>
  );
}
