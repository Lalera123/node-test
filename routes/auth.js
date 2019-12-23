const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../config/config.json');
const authMiddleware = require('../authMiddleware');

const User = require('../models').User;
const Auth = require('../models').Auth;
const BlackList = require('../models').BlackList;

const router = express.Router();

router.get('/signIn/:refreshToken', async (req, res) => {
  const { refreshToken } = req.params;

  const blackListResult = await BlackList.findOne({
    where: {
      refreshToken
    }
  });

  if (blackListResult) {
    return res.status(400).json({
      code: 'ERR_INVALID_TOKEN',
      message: 'Invalid token provided'
    });
  }

  const userAuth = await Auth.findOne({
    where: {
      refreshToken
    }
  });

  if (userAuth) {
    const user = await User.findOne({
      where: {
        id: userAuth.userID
      }
    }).then(res => JSON.parse(JSON.stringify(res)));

    const tokens = generateTokens(user);

    if (tokens) {
      await userAuth.update({
        refreshToken
      });

      res.status(200).json({
        success: true,
        accessToken: `Bearer ${tokens.accessToken}`,
        refreshToken: tokens.refreshToken
      });
    } else {
      return res.status(500).json({
        code: 'ERR_SERVER_ERROR',
        message: 'Unexpected server error'
      });
    }
  } else {
    return res.status(500).json({
      code: 'ERR_SERVER_ERROR',
      message: 'Unexpected server error'
    });
  }
});

router.post('/signUp', async (req, res) => {
  const { id, password } = req.body;

  const user = await User.findOne({
    where: {
      id
    }
  });

  if (user) {
    return res.status(400).json({
      code: 'ERR_USER_EXISTS',
      message: 'The user is already exists'
    });
  }

  const newUser = {
    id,
    password
  };
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(newUser.password, salt);

  newUser.password = hashedPass;

  const createdUser = await User.create({...newUser}).then(res => JSON.parse(JSON.stringify(res)));

  const tokens = generateTokens(createdUser);

  if (tokens) {
    await Auth.create({
      userID: id,
      refreshToken: tokens.refreshToken
    });

    res.status(201).json({
      success: true,
      accessToken: `Bearer ${tokens.accessToken}`,
      refreshToken: tokens.refreshToken,
      ...createdUser
    });
  } else {
    return res.status(500).json({
      code: 'ERR_SERVER_ERROR',
      message: 'Unexpected server error'
    });
  }
});

router.post('/signIn', async (req, res) => {
  const { id, password } = req.body;

  const user = await User.findOne({ id });

  if (!user) {
    return res.status(404).json({
      code: 'ERR_USER_NOT_FOUND',
      message: 'The User\'s not found'
    });
  }

  bcrypt.compare(password, user.password)
    .then((isMatch) => {
      if (isMatch) {
        const { id, password } = user;
        const foundUser = {
          id,
          password
        };

        const tokens = generateTokens(foundUser);

        if (tokens) {
          Auth.upsert({
            userID: id,
            refreshToken: tokens.refreshToken
          });

          res.status(200).json({
            success: true,
            accessToken: `Bearer ${tokens.accessToken}`,
            refreshToken: tokens.refreshToken,
            ...foundUser
          });
        }
      } else {
        return res.status(400).json({
          code: 'ERR_INVALID_PASSWORD',
          message: 'The password is invalid'
        });
      }
    });
});

router.get('/logout', authMiddleware.verifyToken, async (req, res) => {
  const { currentUser } = req;

  const oldTokens = await Auth.findOne({
    where: {
      userID: currentUser.id
    }
  });

  const tokens = generateTokens(currentUser);

  await BlackList.create({
    accessToken: currentUser.accessToken,
    refreshToken: oldTokens.refreshToken
  });

  res.status(200).json({
    ...tokens
  });
});

module.exports = router;

function generateTokens (user) {
  const accessToken = jwt.sign(
    user,
    config['authSecret'],
    {expiresIn: '10m'}
  );

  const refreshToken = jwt.sign(
    user,
    config['authRefreshSecret'],
    {expiresIn: 86400}
  );

  return { accessToken, refreshToken };
}
