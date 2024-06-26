export const getError = (error) => {
  return error.response && error.response.data.message;
  return error?.response && error.response.data?.message
    ? error.response.data.message
    : error.message;
};

// export const API_URL = "http://77.37.51.85:5001/";
export const API_URL = "http://localhost:5001/";
