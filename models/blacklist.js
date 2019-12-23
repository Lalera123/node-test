'use strict';
module.exports = (sequelize, DataTypes) => {
  const BlackList = sequelize.define('BlackList', {
    accessToken: DataTypes.TEXT,
    refreshToken: DataTypes.TEXT
  }, {});
  BlackList.associate = function (models) {
    // associations can be defined here
  };
  return BlackList;
};
