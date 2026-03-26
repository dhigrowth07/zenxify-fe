export const handleApiError = (error) => {
  const fallback = { success: false, msg: "An error occurred" };

  if (!error?.response?.data) {
    return fallback;
  }

  const data = error.response.data;

  const msg = data.msg || data.message || (typeof data === "string" ? data : undefined) || fallback.msg;

  return {
    ...data,
    msg,
  };
};
