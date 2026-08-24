const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

/**
 * One row per user per calendar day that had any solving activity.
 * Powers the streak calculation and the activity heatmap without
 * re-scanning the full problems table on every request.
 */
class Activity extends Model {}

Activity.init(
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
    activityDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "activity_date",
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
    modelName: "Activity",
    tableName: "activities",
    timestamps: true,
    indexes: [{ unique: true, fields: ["user_id", "activity_date"] }],
  }
);

module.exports = Activity;
