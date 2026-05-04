export const responseFormatter = {
  success: (data, message = "Success") => ({
    success: true,
    message,
    data,
  }),
  error: (message, errors = null) => ({
    success: false,
    message,
    errors,
  }),
};