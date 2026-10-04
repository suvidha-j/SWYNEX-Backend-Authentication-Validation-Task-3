function authenticate(req, res, next) {
  const API_KEY = process.env.API_KEY;
  const providedKey = req.headers["x-api-key"];

  if (!providedKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: "AUTH_REQUIRED",
        message: "API key is required"
      }
    });
  }

  if (providedKey !== API_KEY) {
    return res.status(403).json({
      success: false,
      error: {
        code: "INVALID_API_KEY",
        message: "Invalid API key"
      }
    });
  }

  next();
}

module.exports = authenticate;