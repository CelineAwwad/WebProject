// Backend/middleware/clientMiddleware.js

// Gate: must be logged in & role=client
export const verifyClient = (req, res, next) => {
  if (req.session?.user?.role === "client") return next();
  return res.redirect("/auth/client/login");
};

// Prevent showing login page to already-authenticated clients
export const blockIfClient = (req, res, next) => {
  if (req.session?.user?.role === "client") {
    return res.redirect("/client/dashboard");
  }
  return next();
};