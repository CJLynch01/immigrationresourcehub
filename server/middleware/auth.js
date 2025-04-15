const jwt = require("jsonwebtoken");

function isAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ msg: "Admin access required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") throw new Error();
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ msg: "Admin access required" });
  }
}

module.exports = isAdmin;