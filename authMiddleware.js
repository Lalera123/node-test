const jwt = require('jsonwebtoken');
const config = require('./config/config.json');

const BlackList = require('./models').BlackList;

const verifyToken = async (req, res, next) => {
  const authHeaderValue = req.headers['x-access-token'] || req.headers['authorization'];

  if (authHeaderValue) {
    const authToken = authHeaderValue.replace(/Bearer /gim, '');

    const blackListResult = await BlackList.findOne({
      where: {
        accessToken: authToken
      }
    });

    if (blackListResult) {
      return res.status(400).json({
        succes: false,
        message: 'invalid token'
      });
    }

    jwt.verify(authToken, config['authSecret'], (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: err.message
        });
      }

      req.decoded = decoded;
      req.currentUser = {
        id: decoded.id,
        password: decoded.password,
        accessToken: authToken
      };

      next();
    });
  } else {
    return res.json({
      succes: false,
      message: 'Auth token is not provided'
    });
  }
};

module.exports = {
  verifyToken
};
