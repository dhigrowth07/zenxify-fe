export const handleApiError = (error) => {
  const fallback = {
    status: "error",
    code: error?.response?.status || 500,
    message: "A network error occurred. Please try again later.",
    data: null,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  if (!error?.response?.data) {
    return fallback;
  }

  const data = error.response.data;

  if (typeof data === "string") {
    return { ...fallback, message: data, msg: data };
  }

  const message =
    data.message ||
    (data.errors?.length > 0 ? data.errors[0].message : null) ||
    fallback.message;

  return {
    ...fallback,
    ...data,
    message,
    msg: message,
  };
};

