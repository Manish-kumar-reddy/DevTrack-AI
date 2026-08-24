const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Rich per-problem notes, kept in a separate 1:1 table rather than columns
 * on `problems` so the (potentially large) Markdown content never has to be
 * fetched/serialized on every `GET /problems` list-view request -- only when
 * a single problem's detail is actually opened.
 */
class ProblemNote extends Model {}

ProblemNote.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    problemId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      field: "problem_id",
    },
    notes: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      comment: "Markdown",
    },
    mistakes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timeComplexity: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "time_complexity",
    },
    spaceComplexity: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "space_complexity",
    },
  },
  {
    sequelize,
    modelName: "ProblemNote",
    tableName: "problem_notes",
    timestamps: true,
  }
);

module.exports = ProblemNote;
