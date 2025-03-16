const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
  const { token } = req?.cookies;
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'session expired. pls login'
    })
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  console.log('user', req.user);
  next();
}

module.exports = isAuthenticated;