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
      message: 'invalid token'
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

      res.json({
        success: true,
        accessToken: `Bearer ${tokens.accessToken}`,
        refreshToken: tokens.refreshToken
      });
    } else {
      return res.status(500).json({
        message: 'Unexpected server error'
      });
    }
  } else {
    return res.status(500).json({
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

    res.json({
      success: true,
      accessToken: `Bearer ${tokens.accessToken}`,
      refreshToken: tokens.refreshToken,
      ...createdUser
    });
  } else {
    return res.status(500).json({
      message: 'Unexpected server error'
    });
  }
});

router.post('/signIn', async (req, res) => {
  const { id, password } = req.body;

  const user = await User.findOne({ id });

  if (!user) {
    return res.status(404).json('User\'s not found');
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

          res.json({
            success: true,
            accessToken: `Bearer ${tokens.accessToken}`,
            refreshToken: tokens.refreshToken,
            ...foundUser
          });
        }
      } else {
        res.status(400).json('Incorrect Password');
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

  res.json({
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
