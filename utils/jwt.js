var jwt = require('jsonwebtoken');

const generateToken = email => {
  return jwt.sign(email, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
};

module.exports = {
  generateToken,
};
