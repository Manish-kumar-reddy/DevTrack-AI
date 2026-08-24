const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

const PLATFORMS = ["LeetCode", "GeeksforGeeks", "HackerRank", "CodeForces", "CodeChef", "Other"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUSES = ["Todo", "Attempted", "Solved"];

class Problem extends Model {}

Problem.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    platform: {
      type: DataTypes.ENUM(...PLATFORMS),
      allowNull: false,
      defaultValue: "Other",
    },
    difficulty: {
      type: DataTypes.ENUM(...DIFFICULTIES),
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...STATUSES),
      allowNull: false,
      defaultValue: "Todo",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    solvedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "solved_date",
    },
    timeSpentMinutes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "time_spent_minutes",
    },
  },
  {
    sequelize,
    modelName: "Problem",
    tableName: "problems",
    timestamps: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["user_id", "status"] },
      { fields: ["user_id", "topic"] },
      { fields: ["user_id", "difficulty"] },
    ],
  }
);

Problem.PLATFORMS = PLATFORMS;
Problem.DIFFICULTIES = DIFFICULTIES;
Problem.STATUSES = STATUSES;

module.exports = Problem;
