import React, { useContext, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Store } from "../Store";
import { toast } from "react-toastify";
import { API_URL, getError } from "../utils";
import axios from "axios";

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };

    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerLogo, setSellerLogo] = useState("");
  const [sellerDescription, setSellerDescription] = useState("");

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(userInfo?.videoUrl || "");

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  console.log("userInfo", userInfo);

  const submitHandler = async (e) => {
    e.preventDefault();

    const updatedData = {
      name,
      email,
      password,
      sellerName,
      sellerLogo,
      sellerDescription,
    };

    try {
      const { data } = await axios.put(
        `${API_URL}api/users/profile`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({ type: "UPDATE_SUCCESS" });

      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
      toast.success("User updated successfully");
    } catch (err) {
      dispatch({ type: "FETCH_FAIL" });
      toast.error(getError(err));
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast.error("Please select a video file.");
      return;
    }

    // Get video duration to check if it's between 60 and 90 seconds
    let videoDuration = await new Promise((resolve) => {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        resolve(videoElement.duration);
      };
      videoElement.src = URL.createObjectURL(videoFile);
    });
    videoDuration = Math.floor(videoDuration);
    // Check if the video duration is valid
    if (videoDuration < 60 || videoDuration > 90) {
      toast.error("The video must be between 60 and 90 seconds.");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    const toastId = toast.loading("Uploading Video...");
    try {
      const { data } = await axios.post(`${API_URL}api/upload/uservideo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      toast.dismiss(toastId);
      if (data && data.url) {
        setVideoURL(data.url);
        toast.success("Video uploaded successfully");
        setShowVideoModal(false);
      } else {
        toast.error("Video upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 400) {
          toast.error("Invalid video upload. Please check the file and try again.");
        } else if (err.response.status === 401) {
          toast.error("Unauthorized. Please log in again.");
        } else if (err.response.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(`Unexpected error`);
        }
      } else if (err.request) {
        toast.error("No response from the server. Please check your internet connection.");
      } else {
        toast.error(`Error: ${err.message}`);
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            User Profile
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
                  Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={submitHandler}
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-bold transition-all leading-6 text-white hover:text-orange-600 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Update
                </button>
              </div>
              <button
                className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-bold transition-all leading-6 text-white hover:text-orange-600 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                type="button"
                onClick={() => setShowVideoModal(true)}
              >
                Upload Video
              </button>

              {videoURL && (
                <div className="video-section bg-orange-600 p-6 rounded-lg shadow-lg mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 text-white">Profile Video</h3>
                  <video src={videoURL} controls className="w-full rounded-lg shadow-md" />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Choose Video</Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
            <Form.Text>
              The video must be between 60-90 seconds.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowVideoModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleVideoUpload}>
            Upload Video
          </Button>
        </Modal.Footer>
      </Modal>
      {/* <div className="container small-container">
        <Helmet>
          <title>User Profile</title>
        </Helmet>
        <h1 className="my-3">User Profile</h1>
        <form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
          {userInfo.isSeller && (
            <>
              <h2>Seller</h2>
              <Form.Group className="mb-3" controlId="sellerName">
                <Form.Label>Seller Name</Form.Label>
                <Form.Control
                  id="sellerName"
                  type="text"
                  placeholder="Enter Seller Name"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="sellerLogo">
                <Form.Label>Seller Logo</Form.Label>
                <Form.Control
                  id="sellerLogo"
                  type="url"
                  placeholder="Enter Seller Logo"
                  value={sellerLogo}
                  onChange={(e) => setSellerLogo(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="sellerDescription">
                <Form.Label>Seller Description</Form.Label>
                <Form.Control
                  id="sellerDescription"
                  type="text"
                  placeholder="Enter Seller Description"
                  value={sellerDescription}
                  onChange={(e) => setSellerDescription(e.target.value)}
                />
              </Form.Group>
            </>
          )}
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
          </div>
        </form>
      </div> */}
    </>
  );
}
