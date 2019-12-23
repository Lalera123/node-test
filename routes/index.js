const authMiddleware = require('../authMiddleware');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', authMiddleware.verifyToken, function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
