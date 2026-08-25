const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

/**
 * A spaced-repetition reminder for a solved problem. Three rows are created
 * automatically (+3/+7/+30 days from solvedDate) by
 * backend/src/services/revisionService.js whenever a problem is marked
 * Solved -- see problemController.js.
 */
class Revision extends Model {}

Revision.init(
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
    intervalDays: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      field: "interval_days",
    },
    revisionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "revision_date",
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Revision",
    tableName: "revisions",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ["user_id", "revision_date"] },
      { unique: true, fields: ["problem_id", "interval_days"] },
    ],
  }
);

module.exports = Revision;
