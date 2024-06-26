import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function CheckoutSteps(props) {
  return (
    <>
      <div className="container mx-auto px-4 py-10 flex flex-col gap-10">
        <Row className="checkout-steps">
          <Col
            className={
              props.step1
                ? "active font-bold"
                : "text-gray-800 sm:text-base text-sm"
            }
          >
            Sign-In
          </Col>
          <Col
            className={
              props.step2
                ? "active font-bold"
                : "text-gray-800 sm:text-base text-sm"
            }
          >
            Shipping
          </Col>
          {/* <Col className={props.step3 ? "active font-bold" : "text-gray-800 sm:text-base text-sm"}>
            Payment
          </Col> */}
          <Col
            className={
              props.step4
                ? "active font-bold"
                : "text-gray-800 sm:text-base text-sm"
            }
          >
            Place Order
          </Col>
        </Row>
      </div>
    </>
  );
}
