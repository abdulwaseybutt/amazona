import React from "react";
import { Link } from "react-router-dom";
import {
  Navbar,
  Container,
  Button,
  Nav,
  NavDropdown,
  Badge,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { IoChatbubbleOutline } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";

import SearchBox from "../SearchBox";

function NavBar({
  sidebarIsOpen,
  setSidebarIsOpen,
  cart,
  userInfo,
  signoutHandler,
  categories,
}) {
  return (
    <Navbar bg="light" variant="light" className="py-3 shadow-lg " expand="lg">
      <Container>
        <Button
          variant="light"
          onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
          className="text-orange-600 border-orange-600 p-0  min-w-9 min-h-9  hover:border-orange-600 border-1 hover:bg-transparent mr-1 hover:text-orange-600"
        >
          <i className="fas fa-bars "></i>
        </Button>

        <LinkContainer to="/">
          <Navbar.Brand className="text-orange-600 flex align-middle items-center justify-center hover:text-orange-600 transition-all">
            <img src="/logo.png" className="w-10 h-auto" alt="" />
            <span className="-mx-1">Turkfy</span>
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle
          className="text-orange-600 border-orange-600 p-0 min-w-9 min-h-9 flex align-middle justify-center items-center hover:border-orange-600 border-1 bg-orange-600 mr-1 hover:text-orange-600"
          aria-controls="basic-navbar-nav"
        >
          {/* <i className="fas fa-bars "></i> */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_1962_4074"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="24"
              height="24"
              style={{ maskType: "luminance" }}
            >
              <path d="M24 0H0V24H24V0Z" fill="white"></path>
            </mask>
            <g mask="url(#mask0_1962_4074)">
              <path
                d="M10.2008 16.6C6.70078 16.6 3.80078 13.7 3.80078 10.2C3.80078 6.70005 6.70078 3.80005 10.2008 3.80005C13.7008 3.80005 16.6008 6.70005 16.6008 10.2C16.6008 13.7 13.7008 16.6 10.2008 16.6ZM10.2008 5.70005C7.70078 5.70005 5.70078 7.70005 5.70078 10.2C5.70078 12.7 7.70078 14.7 10.2008 14.7C12.7008 14.7 14.7008 12.7 14.7008 10.2C14.7008 7.70005 12.7008 5.70005 10.2008 5.70005Z"
                fill="white"
              ></path>
              <path
                d="M16.3259 15.0614L14.9824 16.4049L18.8715 20.294L20.215 18.9505L16.3259 15.0614Z"
                fill="white"
              ></path>
            </g>
          </svg>
        </Navbar.Toggle>
        <Navbar.Collapse id="">
          <div className="container mx-auto w-full">
            <SearchBox />
          </div>

          <Nav className="sm:justify-content-end justify-center sm:items-center items-start flex-row sm:pt-0 pt-6 sm:w-40 min-w-40 w-full">

            <Link
              to="/chat"
              className="nav-link text-sm font-semibold leading-6 relative w-max text-[#212529] cursor-pointer flex align-middle items-center"
            >
              <IoChatbubbleOutline size="20px" />
            </Link>

            <Link
              to="/cart"
              className="nav-link text-sm font-semibold leading-6 relative w-max text-[#212529] cursor-pointer flex align-middle items-center"
            >
              <FiShoppingCart size="20px"/>
              {cart.cartItems.length > 0 && (
                <Badge pill bg="danger" className="absolute -top-1 -right-1">
                  {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                </Badge>
              )}
            </Link>

            {userInfo && !userInfo.isSeller && !userInfo.isAdmin ? (
              <NavDropdown
                className="text-sm font-semibold leading-6 text-[#212529] cursor-pointer"
                title={userInfo.name}
                style={{ color: "white" }}
                id="basic-nav-dropdown"
              >
                <LinkContainer to="/profile">
                  <NavDropdown.Item className="text-sm font-semibold leading-6 text-gray-800 cursor-pointer">
                    User Profile
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/orderhistory">
                  <NavDropdown.Item className="text-sm font-semibold leading-6 text-gray-800 cursor-pointer">
                    Order History
                  </NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <Link
                  className="dropdown-item text-sm font-semibold leading-6 text-gray-800 cursor-pointer "
                  to="#signout"
                  onClick={signoutHandler}
                >
                  Sign Out
                </Link>
              </NavDropdown>
            ) : null}
            {userInfo && userInfo.isSeller && !userInfo.isAdmin && (
              <NavDropdown
                title="Seller"
                id="admin-nav-dropdown"
                className="text-orange-600"
              >
                <LinkContainer to={`/seller/${userInfo._id}`}>
                  <NavDropdown.Item>Dashboard</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/seller/products">
                  <NavDropdown.Item>Products</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/seller/orders">
                  <NavDropdown.Item>Orders</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/chat/seller/" >
                  <NavDropdown.Item>Chat</NavDropdown.Item>
                </LinkContainer>
                <Link
                  className="dropdown-item text-sm font-semibold leading-6 text-gray-800 cursor-pointer "
                  to="#signout"
                  onClick={signoutHandler}
                >
                  Sign Out
                </Link>
              </NavDropdown>
            )}
            {userInfo && userInfo.isAdmin && (
              <NavDropdown
                title="Admin"
                id="admin-nav-dropdown"
                className="text-orange-600"
              >
                <LinkContainer to="/admin/dashboard">
                  <NavDropdown.Item>Dashboard</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/products">
                  <NavDropdown.Item>Products</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/category">
                  <NavDropdown.Item>Categories</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/orders">
                  <NavDropdown.Item>Orders</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/admin/users">
                  <NavDropdown.Item>Users</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/support">
                  <NavDropdown.Item>Support</NavDropdown.Item>
                </LinkContainer>
                <Link
                  className="dropdown-item text-sm font-semibold leading-6 text-gray-800 cursor-pointer "
                  to="#signout"
                  onClick={signoutHandler}
                >
                  Sign Out
                </Link>
              </NavDropdown>
            )}
            {!userInfo ? (
              <Link
                className="nav-link text-sm font-semibold leading-6 text-[#212529] cursor-pointer flex align-middle items-center"
                to="/signin"
              >
                Sign In
              </Link>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
