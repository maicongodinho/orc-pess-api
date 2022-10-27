const jwt = require('jsonwebtoken');

module.exports = function checkToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Token não informado.' });

  jwt.verify(token, process.env.TOKEN_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ message: 'Token expirado.' });
    req.usuario = usuario;
    next();
  });
};
