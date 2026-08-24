const sequelize = require("../config/database");
const User = require("./User");
const Problem = require("./Problem");
const Contest = require("./Contest");
const Goal = require("./Goal");
const Activity = require("./Activity");
const Favorite = require("./Favorite");

// User <-> Problem
User.hasMany(Problem, { foreignKey: "userId", as: "problems", onDelete: "CASCADE" });
Problem.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> Contest
User.hasMany(Contest, { foreignKey: "userId", as: "contests", onDelete: "CASCADE" });
Contest.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> Goal
User.hasMany(Goal, { foreignKey: "userId", as: "goals", onDelete: "CASCADE" });
Goal.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> Activity
User.hasMany(Activity, { foreignKey: "userId", as: "activities", onDelete: "CASCADE" });
Activity.belongsTo(User, { foreignKey: "userId", as: "user" });

// User <-> Favorite, Problem <-> Favorite (many-to-many join table exposed directly too)
User.hasMany(Favorite, { foreignKey: "userId", as: "favorites", onDelete: "CASCADE" });
Favorite.belongsTo(User, { foreignKey: "userId", as: "user" });

Problem.hasOne(Favorite, { foreignKey: "problemId", as: "favorite", onDelete: "CASCADE" });
Favorite.belongsTo(Problem, { foreignKey: "problemId", as: "problem" });

module.exports = {
  sequelize,
  User,
  Problem,
  Contest,
  Goal,
  Activity,
  Favorite,
};
