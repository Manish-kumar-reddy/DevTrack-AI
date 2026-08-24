const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Favorite extends Model {}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "user_id",
    },
    problemId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "problem_id",
    },
  },
  {
    sequelize,
    modelName: "Favorite",
    tableName: "favorites",
    timestamps: true,
    updatedAt: false,
    indexes: [{ unique: true, fields: ["user_id", "problem_id"] }],
  }
);

module.exports = Favorite;
