function registerUser(req, res, next) {
  res.status(501).json({ success: false, message: 'ROUTE NOT DEFINED at ctrller!!!' })
}

module.exports = { registerUser }