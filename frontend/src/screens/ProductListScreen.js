import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { Store } from "../Store";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { API_URL, delay, getError } from "../utils";
import ListGroup from "react-bootstrap/ListGroup";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "CREATE_REQUEST":
      return { ...state, loadingCreate: true };
    case "CREATE_SUCCESS":
      return {
        ...state,
        loadingCreate: false,
      };
    case "CREATE_FAIL":
      return { ...state, loadingCreate: false };
    case "DELETE_REQUEST":
      return { ...state, loadingDelete: true, successDelete: false };
    case "DELETE_SUCCESS":
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case "DELETE_FAIL":
      return { ...state, loadingDelete: false, successDelete: false };
    case "DELETE_RESET":
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};

export default function ProductListScreen(props) {
  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: "",
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get("page") || 1;

  const location = useLocation();
  const sellerMode = location.pathname.includes("/seller");

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [categoriesList, setCategoriesList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [produdtImageUrl, setProductImageUrl] = useState([]);

  const submitDisabled = useMemo(() => {
    const {
      product_name,
      product_brand,
      product_category,
      product_desc,
      product_stock,
      product_price,
    } = formData;
    return Boolean(
      !product_name ||
        !product_brand ||
        !product_category ||
        !product_desc ||
        !product_stock ||
        !product_price ||
        !produdtImageUrl
    );
  }, [formData, produdtImageUrl]);

  useEffect(() => {
    fetchCategories();
    const fetchData = async (seller) => {
      try {
        const data = await axios.get(
          // `${API_URL}api/products/admin?page=${page}&seller=${
          `${API_URL}api/products/`,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        if (userInfo && userInfo?.isAdmin) {
          setProductList(data?.data);
        } else if (userInfo && userInfo?.isSeller) {
          const sellerId = userInfo?._id;
          const sellerProducts = data?.data?.filter(
            (item) => item?.userId === sellerId
          );
          setProductList(sellerProducts);
        }
        dispatch({ type: "FETCH_SUCCESS", payload: data?.data });
      } catch (err) {}
    };

    if (successDelete) {
      dispatch({ type: "DELETE_RESET" });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete, sellerMode, showForm]);

  const createHandler = async () => {
    if (window.confirm("Are you sure to create?")) {
      try {
        dispatch({ type: "CREATE_REQUEST" });
        const { data } = await axios.post(
          `${API_URL}api/products`,
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success("product created successfully");
        dispatch({ type: "CREATE_SUCCESS" });
        navigate(`/admin/product/${data.product._id}`);
      } catch (err) {
        toast.error(getError(error));
        dispatch({ type: "CREATE_FAIL" });
      }
    }
  };

  const deleteHandler = async (product) => {
    try {
      const data = await axios.delete(`${API_URL}api/products/${product._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (userInfo && userInfo?.isAdmin) {
        setProductList(data?.data);
      } else if (userInfo && userInfo?.isSeller) {
        const sellerId = userInfo?._id;
        const sellerProducts = data?.data?.filter(
          (item) => item?.userId == sellerId
        );
        setProductList(sellerProducts);
      }
      toast.success("product deleted successfully");
      dispatch({ type: "DELETE_SUCCESS" });
    } catch (err) {
      toast.error(getError(error));
      dispatch({ type: "DELETE_FAIL" });
    }
  };

  const fetchCategories = async () => {
    const result = await fetch(`${API_URL}api/products/categories`);
    const categories = await result.json();
    setCategoriesList(categories);
    setFormData({ ...formData, product_category: categories[0] });
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      setProductImageUrl(result);
    };

    reader.readAsDataURL(file);
    // const file = e.target.files[0];
    // const bodyFormData = new FormData();
    // bodyFormData.append("file", file);

    // try {
    //   const data = await axios.post(`${API_URL}api/upload`, bodyFormData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //       authorization: `Bearer ${userInfo.token}`,
    //     },
    //   });
    //   console.log("data ", data);

    //   if (forImages) {
    //     setFormData({
    //       ...formData,
    //       images: [...formData.images, data.secure_url],
    //     });
    //   } else {
    //     setFormData({
    //       ...formData,
    //       image: data.secure_url,
    //     });
    //   }
    //   toast.success("Image uploaded successfully. click Update to apply it");
    // } catch (err) {
    //   toast.error(getError(err));
    // }
  };

  const deleteFileHandler = async (fileName, f) => {
    console.log(fileName, f);
    setFormData({
      ...formData,
      images: [
        ...formData.images,
        formData.images.filter((x) => x !== fileName),
      ],
    });
    toast.success("Image removed successfully. click Update to apply it");
  };

  const submitHandler = async (event) => {
    event?.preventDefault();

    formData.image = produdtImageUrl;
    formData.userId = userInfo?._id;
    const toastId= toast.loading("The product is being created..");
    const result = await fetch(`${API_URL}api/products`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${userInfo.token}`,
      },
      body: JSON.stringify(formData), // body data type must match "Content-Type" header
    }).then((response) => response.json()).catch((err)=>{
      toast.dismiss(toastId);
      toast.error("The product cannot be created");
    });

    await delay(2000);
    toast.dismiss(toastId);
    console.log("request resukt ", result);
    if(result.error){
      toast.error(result.error);
      return;
    }
    if (result.message) {
      setFormData({});
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className="container py-6">
        <div className="flex align-middle justify-between items-center w-full">
          <h1 className="text-3xl font-bold text-gray-700">Products</h1>
          <button
            className="block rounded-md bg-orange-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-500  outline-none "
            type="button"
            onClick={() => {
              setShowForm(true);
            }}
          >
            Create Product
          </button>
        </div>

        {loadingCreate && <LoadingBox />}
        {loadingDelete && <LoadingBox />}
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : !showForm ? (
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Id
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Brand
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    >
                      <span className="">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productList?.map((item) => {
                    return (
                      <tr key="{person.email}">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          <div className="min-w-20 min-h-20 h-20 w-20 relative">
                            <img
                              src={item?.image}
                              className="absolute inset-0 object-cover w-full h-full"
                              alt={item?.name}
                            />
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {item?._id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item?.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item?.price}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item?.category}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item?.brand}
                        </td>
                        <td className="relative cursor-pointer whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm flex alinmi items-center gap-3 font-medium sm:pr-0">
                          <Button
                            type="button"
                            variant="light"
                            onClick={
                              userInfo
                                ? userInfo?.isAdmin
                                  ? () => {
                                      navigate(`/admin/product/${item._id}`);
                                    }
                                  : userInfo?.isSeller
                                  ? () => {
                                      navigate(`/seller/product/${item._id}`);
                                    }
                                  : () => {
                                      return true;
                                    }
                                : null
                            }
                          >
                            <i className="fas fa-edit text-primary"></i>
                          </Button>
                          &nbsp;
                          <Button
                            type="button"
                            variant="light"
                            onClick={() => deleteHandler(item)}
                          >
                            <i
                              className="fa fa-trash text-danger"
                              aria-hidden="true"
                            ></i>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[500px]">
              <div className="bg-white px-6 py-12 rounded-lg shadow sm:rounded-lg sm:px-12">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="p_name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Product Name*
                    </label>
                    <div className="mt-2">
                      <input
                        id="p_name"
                        name="p_name"
                        type="text"
                        autoComplete="p_name"
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            product_name: e.target.value,
                          });
                        }}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="p_price"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Product Price*
                    </label>
                    <div className="mt-2">
                      <input
                        id="p_price"
                        name="p_price"
                        type="text"
                        autoComplete="p_price"
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            product_price: e.target.value,
                          });
                        }}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="p_cat"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Product Category*
                    </label>
                    <div className="mt-2">
                      <select
                        id="p_cat"
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            product_category: e.target.value,
                          });
                        }}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        {categoriesList?.map((item) => {
                          return (
                            <option value={item?.name}>{item?.name}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="p_image"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Product Image*
                    </label>
                    <div className="mt-2">
                      <input
                        id="p_image"
                        name="p_image"
                        type="file"
                        autoComplete="p_image"
                        onChange={(e) => {
                          uploadFileHandler(e);
                        }}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  {/* <div>
                      <label
                        htmlFor="p_images"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Product Additional Image
                      </label>
                      <div className="mt-2">
                        <input
                          id="p_images"
                          name="p_images"
                          multiple
                          type="file"
                          autoComplete="p_images"
                          onChange={(e) => {
                            uploadFileHandler(e, true);
                          }}
                          required
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>

                      {formData?.images?.length === 0 && (
                        <MessageBox>No image</MessageBox>
                      )}

                      <ListGroup variant="flush">
                        {formData?.images?.map((x) => (
                          <ListGroup.Item key={x}>
                            {x}
                            <Button
                              variant="light"
                              onClick={() => deleteFileHandler(x)}
                            >
                              <i className="fa fa-times-circle"></i>
                            </Button>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div> */}

                  <div>
                    <label
                      htmlFor="p_brand"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Product Brand*
                    </label>
                    <div className="mt-2">
                      <input
                        id="p_brand"
                        name="p_brand"
                        type="text"
                        autoComplete="p_brand"
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            product_brand: e.target.value,
                          });
                        }}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="p_stock"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Count in Stock*
                    </label>
                    <div className="mt-2">
                      <input
                        id="p_stock"
                        name="p_stock"
                        type="text"
                        autoComplete="p_stock"
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            product_stock: e.target.value,
                          });
                        }}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="p_description"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Description*
                    </label>
                    <div className="mt-2">
                      <input
                        id="p_description"
                        name="p_description"
                        type="text"
                        autoComplete="p_description"
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            product_desc: e.target.value,
                          });
                        }}
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={submitHandler}
                      type="submit"
                      disabled={submitDisabled}
                      className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm font-bold transition-all leading-6 text-white hover:text-orange-600 shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
