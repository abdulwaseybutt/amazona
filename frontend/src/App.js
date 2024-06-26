import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import Navbar from "react-bootstrap/Navbar";
import Badge from "react-bootstrap/Badge";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Container from "react-bootstrap/Container";
import { LinkContainer } from "react-router-bootstrap";
import { useContext, useEffect, useRef, useState } from "react";
import { Store } from "./Store";
import CartScreen from "./screens/CartScreen";
import SigninScreen from "./screens/SigninScreen";
import ShippingAddressScreen from "./screens/ShippingAddressScreen";
import SignupScreen from "./screens/SignupScreen";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { API_URL, getError } from "./utils";
import SearchBox from "./components/SearchBox";
import SearchScreen from "./screens/SearchScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardScreen from "./screens/DashboardScreen";
import ProductListScreen from "./screens/ProductListScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import OrderListScreen from "./screens/OrderListScreen";
import UserListScreen from "./screens/UserListScreen";
import UserEditScreen from "./screens/UserEditScreen";
import SupportScreen from "./screens/SupportScreen";
import SearchByCategoryScreen from "./screens/SearchByCategoryScreen";
import MapScreen from "./screens/MapScreen";
import SellerScreen from "./screens/SellerScreen";
import SellerRoute from "./components/SellerRoute";
import ChatBox from "./components/ChatBox";
import CategoryMenu from "./components/Categories";
import StoreFront from "./components/Store-Front";
import NavBar from "./components/Nav-Bar";
import CategoryScreen from "./screens/CategoryScreen";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const sideBarRef = useRef(null);

  const signoutHandler = () => {
    ctxDispatch({ type: "USER_SIGNOUT" });
    localStorage.removeItem("userInfo");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("paymentMethod");
    window.location.href = "/signin";
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sideBarRef.current && !sideBarRef.current.contains(event.target)) {
        // Click occurred outside of the menu, so close the menu
        setSidebarIsOpen(false);
      }
    };

    // Add event listener to handle clicks outside of the menu
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      // Remove event listener when component unmounts
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <div
          className={
            sidebarIsOpen
              ? fullBox
                ? "site-container active-cont d-flex flex-column full-box"
                : "site-container active-cont d-flex flex-column"
              : fullBox
              ? "site-container d-flex flex-column full-box"
              : "site-container d-flex flex-column"
          }
        >
          <ToastContainer position="bottom-center" limit={1} />
          <header>
            <NavBar
              sidebarIsOpen={sidebarIsOpen}
              setSidebarIsOpen={setSidebarIsOpen}
              cart={cart}
              userInfo={userInfo}
              signoutHandler={signoutHandler}
              categories={categories}
            />
          </header>
          <div
            ref={sideBarRef}
            className={
              sidebarIsOpen
                ? "active-nav fixed side-navbar d-flex justify-content-between flex-wrap flex-column shadow-xl"
                : "side-navbar fixed d-flex justify-content-between flex-wrap flex-column"
            }
          >
            <Nav className="flex-column text-[#212529] w-100 py-4">
              <Nav.Item className="mb-3 px-3">
                <strong className="text-2xl font-bold text-[#212529] ">
                  Categories
                </strong>
              </Nav.Item>
              {categories?.map((category) => (
                <Nav.Item key={category?._id}>
                  <LinkContainer
                    to={{
                      pathname: "/search",
                      search: `?category=${category?.name}`,
                    }}
                    onClick={() => setSidebarIsOpen(false)}
                  >
                    <Nav.Link className="text-sm font-semibold leading-6 text-[#212529] cursor-pointer px-3 py-2 transition-all hover:shadow-xl hover:bg-orange-600 hover:text-white">
                      {category?.name}
                    </Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              ))}
            </Nav>
          </div>
          <main>
            <Routes>
              <Route path="/seller/:id" element={<SellerScreen />}></Route>
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    {" "}
                    <ProfileScreen />{" "}
                  </ProtectedRoute>
                }
              />
              <Route path="/shipping" element={<ShippingAddressScreen />} />
              <Route path="/payment" element={<PaymentMethodScreen />} />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    {" "}
                    <MapScreen />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <ProtectedRoute>
                    {" "}
                    <OrderScreen />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orderhistory"
                element={
                  <ProtectedRoute>
                    {" "}
                    <OrderHistoryScreen />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    {" "}
                    <DashboardScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/category"
                element={
                  <AdminRoute>
                    <CategoryScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    {" "}
                    <OrderListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    {" "}
                    <ProductListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/support"
                element={
                  <AdminRoute>
                    {" "}
                    <SupportScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/product/:id"
                element={
                  <AdminRoute>
                    {" "}
                    <ProductEditScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    {" "}
                    <UserListScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    {" "}
                    <UserEditScreen />
                  </AdminRoute>
                }
              />
              <Route
                path="/seller/products"
                element={
                  <SellerRoute>
                    {" "}
                    <ProductListScreen />
                  </SellerRoute>
                }
              />
              <Route
                path="/seller/product/:id"
                element={
                  <SellerRoute>
                    {" "}
                    <ProductEditScreen />
                  </SellerRoute>
                }
              />
              <Route
                path="/seller/orders"
                element={
                  <SellerRoute>
                    {" "}
                    <OrderListScreen />
                  </SellerRoute>
                }
              />
              <Route path="/" element={<StoreFront />} />
              <Route
                path="/search-by-category"
                element={<SearchByCategoryScreen />}
              ></Route>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </Elements>
  );
}

export default App;
