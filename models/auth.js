'use strict';
module.exports = (sequelize, DataTypes) => {
  const Auth = sequelize.define('Auth', {
    userID: DataTypes.STRING,
    refreshToken: DataTypes.TEXT
  }, {});
  Auth.associate = function (models) {
    models.User.belongsTo(models.Auth, { foreignKey: 'id' });
  };
  return Auth;
};
