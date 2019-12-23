const express = require('express');
const multer = require('multer');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

const authMiddleware = require('../authMiddleware');
const config = require('../config/config.json');

const File = require('../models').File;

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config['filesStorage']);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({storage: storage});

router.post(
  '/upload',
  authMiddleware.verifyToken,
  upload.single('filedata'),
  async (req, res, next) => {
    const file = getFileInfo(req.file);

    const createdFile = await File.create({
      id: uuidv4(),
      ...file
    }).then(res => JSON.parse(JSON.stringify(res)));

    if (createdFile) {
      res.status(201).json({
        success: true,
        ...createdFile
      });
    }
  }
);

router.get('/list', authMiddleware.verifyToken, async (req, res) => {
  const { page = 1, listSize = 10 } = req.query;

  const offset = (page - 1) * listSize;

  const files = await File.findAll({
    limit: parseInt(listSize),
    offset,
    where: {}
  });

  res.status(200).json({
    data: files,
    count: files.length
  });
});

router.delete('/delete/:id', authMiddleware.verifyToken, async (req, res) => {
  const { id } = req.params;

  const file = await File.findOne({
    where: {
      id
    }
  });

  fs.unlink(getFilePath(file), (err) => {
    if (err) throw err;
    console.log(`${file.name}.${file.extension} was deleted`);
    file.destroy();
  });

  if (!file) {
    return res.status(400).json({
      code: 'ERR_NOT_FOUND',
      message: 'File not found'
    });
  }

  return res.status(200).json({
    code: 'DELETED',
    message: 'Deleted successfully'
  });
});

router.get('/download/:id', authMiddleware.verifyToken, async (req, res) => {
  const { id } = req.params;

  const file = await File.findOne({
    where: {
      id
    }
  });

  const filePath = getFilePath(file);

  res.download(filePath);
});

router.put(
  '/update/:id',
  authMiddleware.verifyToken,
  upload.single('filedata'),
  async (req, res) => {
    const { id } = req.params;

    const file = getFileInfo(req.file);

    const oldFile = await File.findOne({
      where: { id }
    });

    if (oldFile) {
      fs.unlink(getFilePath(oldFile), (err) => {
        if (err) throw err;
      });

      const updatedFile = await oldFile.update({
        ...file
      });

      return res.send(updatedFile);
    }

    return res.status(404).json({
      code: 'ERR_NOT_FOUND',
      message: 'File not found'
    });
  }
);

router.get('/:id', authMiddleware.verifyToken, async (req, res) => {
  const { id } = req.params;

  const file = await File.findOne({
    where: { id }
  });

  if (!file) {
    return res.status(404).json({
      code: 'ERR_NOT_FOUND',
      message: 'File not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: file
  });
});

function getFilePath (file) {
  return `${config['filesStorage']}/${file.name}.${file.extension}`;
}

function getFileInfo (file) {
  const { size, mimetype: mimeType, originalname } = file;

  const regExp = /(?:\.([^.]+))?$/;

  const fileExt = regExp.exec(originalname)[1];
  const fileName = originalname.replace(regExp, '');

  return {
    name: fileName,
    mimeType,
    size,
    extension: fileExt
  };
}

module.exports = router;
