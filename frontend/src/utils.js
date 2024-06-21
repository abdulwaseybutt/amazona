export const getError = (error) => {
  return error.response && error.response.data.message
    ? error.response.data.message
    : error.message;
};

export const API_URL = "http://192.168.137.121:5001/";
export const PRODUCT_QUERY_MESSAGE="Hi, I want to know about this product.";

// export const API_URL = "http://localhost:5001/";

export function timeAgo(date) {
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);
  const minutesAgo = Math.floor(secondsAgo / 60);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);
  const weeksAgo = Math.floor(daysAgo / 7);
  const monthsAgo = Math.floor(daysAgo / 30);
  const yearsAgo = Math.floor(daysAgo / 365);

  if (secondsAgo < 60) {
    return 'Now';
  } else if (minutesAgo < 60) {
    return minutesAgo === 1 ? '1 minute ago' : `${minutesAgo} minutes ago`;
  } else if (hoursAgo < 24) {
    return hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`;
  } else if (daysAgo < 7) {
    return daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
  } else if (weeksAgo < 5) {
    return weeksAgo === 1 ? '1 week ago' : `${weeksAgo} weeks ago`;
  } else if (monthsAgo < 12) {
    return monthsAgo === 1 ? '1 month ago' : `${monthsAgo} months ago`;
  } else {
    return yearsAgo === 1 ? '1 year ago' : `${yearsAgo} years ago`;
  }
}