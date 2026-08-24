const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

const PLATFORMS = ["LeetCode", "CodeForces", "CodeChef", "HackerRank", "AtCoder", "Other"];

class Contest extends Model {}

Contest.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    platform: {
      type: DataTypes.ENUM(...PLATFORMS),
      allowNull: false,
      defaultValue: "Other",
    },
    contestDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "contest_date",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rank: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    problemsSolved: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "problems_solved",
    },
  },
  {
    sequelize,
    modelName: "Contest",
    tableName: "contests",
    timestamps: true,
    indexes: [{ fields: ["user_id"] }, { fields: ["user_id", "contest_date"] }],
  }
);

Contest.PLATFORMS = PLATFORMS;

module.exports = Contest;
