'use strict';
module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    name: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    size: DataTypes.REAL,
    extension: DataTypes.STRING
  }, {});
  File.associate = function (models) {
    // associations can be defined here
  };
  return File;
};
