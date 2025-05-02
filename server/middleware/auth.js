const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
}


function isAdmin(req, res, next) {
  if (req.user?.role === "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Admin access required" });
  }
}

module.exports = { verifyToken, isAdmin };
