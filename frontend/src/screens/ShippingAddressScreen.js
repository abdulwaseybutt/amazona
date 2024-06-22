import { useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Store } from "../Store";
import CheckoutSteps from "../components/CheckoutSteps";
import { Link } from "react-router-dom";
const ShippingAddressScreen = () => {
  const navigate = useNavigate();

  const { fullBox, state, dispatch: ctxDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;

  const [fullName, setFullName] = useState(shippingAddress.fullName || "");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );
  const [country, setCountry] = useState(shippingAddress.country || "");

  const submitDisabled = useMemo(() => {
    return Boolean(!fullName || !address || !city || !postalCode || !country);
  }, [fullName, address, city, postalCode, country]);

  useEffect(() => {
    if (!userInfo) {
      navigate("/signin?redirect=/shipping");
    }
  }, [userInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();

    ctxDispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      },
    });

    localStorage.setItem(
      "shippingAddress",
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      })
    );

    navigate("/payment");
  };

  useEffect(() => {
    ctxDispatch({ type: "SET_FULLBOX_OFF" });
  }, [ctxDispatch, fullBox]);

  return (
    <div>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>

      <CheckoutSteps step1 step2></CheckoutSteps>

      <div className="flex min-h-full flex-1 flex-col justify-center pb-6 sm:px-6 px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Shipping Address
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[500px]">
          <div className="bg-white px-6 py-12 rounded-lg shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" action="#" method="POST">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Full Name*
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Address*
                </label>
                <div className="mt-2">
                  <input
                    id="address"
                    name="address"
                    type="text"
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="address"
                    required
                    value={address}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  City*
                </label>
                <div className="mt-2">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    onChange={(e) => setCity(e.target.value)}
                    autoComplete="address"
                    required
                    value={city}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Postal Code*
                </label>
                <div className="mt-2">
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    onChange={(e) => setPostalCode(e.target.value)}
                    autoComplete="postalCode"
                    required
                    value={postalCode}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="country`"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Country*
                </label>
                <div className="mt-2">
                  <input
                    id="country`"
                    name="country`"
                    type="text"
                    onChange={(e) => setCountry(e.target.value)}
                    autoComplete="country"
                    required
                    value={country}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* <div>
                <Button
                  id="chooseOnMap"
                  type="button"
                  variant="light"
                  onClick={() => navigate("/map")}
                  className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-bold transition-all leading-6 text-white hover:text-orange-600 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Choose Location On Map
                </Button>
                {shippingAddress.location && shippingAddress.location.lat ? (
                  <div>
                    LAT: {shippingAddress.location.lat}
                    LNG:{shippingAddress.location.lng}
                  </div>
                ) : (
                  <div>No location</div>
                )}
              </div> */}
              <div>
                <button
                  onClick={submitHandler}
                  type="submit"
                  disabled={submitDisabled}
                  className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-bold transition-all leading-6 text-white hover:text-orange-600 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressScreen;
