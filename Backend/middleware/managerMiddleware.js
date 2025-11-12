// Backend/middleware/managerMiddleware.js

// gate: must be logged in & role=manager
export const verifyManager = (req, res, next) => {
  if (req.session?.user?.role === "manager") return next();
  return res.redirect("/auth/manager/login");
};

// optional: prevent showing login page to already-authenticated managers
export const blockIfManager = (req, res, next) => {
  if (req.session?.user?.role === "manager") {
    return res.redirect("/manager/dashboard");
  }
  return next();
};