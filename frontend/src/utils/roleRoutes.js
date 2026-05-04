export const getHomeRouteByRole = (role) => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "AGENT":
      return "/agent/dashboard";
    case "CUSTOMER":
    default:
      return "/customer/dashboard";
  }
};