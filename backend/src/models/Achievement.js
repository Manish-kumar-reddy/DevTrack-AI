const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Records which badges a user has unlocked and when. The catalog of
 * possible badges (title, description, icon, criteria) is static app config
 * -- see backend/src/services/achievementService.js -- not stored here;
 * this table only ever holds the subset a given user has actually earned.
 */
class Achievement extends Model {}

Achievement.init(
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
    key: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: "Matches a key in achievementService.ACHIEVEMENTS",
    },
    unlockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "unlocked_at",
    },
  },
  {
    sequelize,
    modelName: "Achievement",
    tableName: "achievements",
    timestamps: false,
    indexes: [{ unique: true, fields: ["user_id", "key"] }],
  }
);

module.exports = Achievement;
