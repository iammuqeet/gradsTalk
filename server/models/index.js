// server/models/index.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust path based on your folder structure

// Define models
const Group = sequelize.define("Group", { name: DataTypes.STRING });
const Message = sequelize.define("Message", {
  content: DataTypes.STRING,
  groupId: DataTypes.INTEGER,
  sender: DataTypes.STRING,
});
const User = sequelize.define("User", {
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  confirmationCode: DataTypes.STRING,
});
const UserGroup = sequelize.define("UserGroup", {
  userId: DataTypes.INTEGER,
  groupId: DataTypes.INTEGER,
});

// Export models
module.exports = {
  Group,
  Message,
  User,
  UserGroup,
  sequelize // Export sequelize if needed elsewhere
};
