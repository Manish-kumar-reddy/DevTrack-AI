const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

const PERIODS = ["daily", "weekly", "monthly"];

class Goal extends Model {}

Goal.init(
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
    period: {
      type: DataTypes.ENUM(...PERIODS),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    targetTopic: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: "target_topic",
    },
    targetCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "target_count",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "start_date",
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "end_date",
    },
  },
  {
    sequelize,
    modelName: "Goal",
    tableName: "goals",
    timestamps: true,
    indexes: [{ fields: ["user_id"] }, { fields: ["user_id", "start_date", "end_date"] }],
  }
);

Goal.PERIODS = PERIODS;

module.exports = Goal;
