const express = require('express');

const authMiddleware = require('../authMiddleware');

const router = express.Router();

router.get('/info', authMiddleware.verifyToken, (req, res) => {
  const { currentUser } = req;

  res.status(200).json({
    currentUser: currentUser.id
  });
});

module.exports = router;
