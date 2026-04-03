const admin = (req, res, next) => {
  // req.user is already provided by the 'protect' middleware that runs before this
  if (req.user && req.user.role === "admin") {
    next(); // They are an admin, let them through
  } else {
    res
      .status(403)
      .json({ message: "Access denied. Not authorized as an admin." });
  }
};

exports.admin = admin;
