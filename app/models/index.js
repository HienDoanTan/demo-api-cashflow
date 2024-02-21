const config = require("../config/db.config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        operatorsAliases: 0,

        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./_user.model.js")(sequelize, Sequelize);
db.role = require("./_role.model.js")(sequelize, Sequelize);
db.expense = require("./_expense.model.js")(sequelize, Sequelize);
db.incomes = require("./_incomes.model.js")(sequelize, Sequelize);
db.saving = require("./_saving.model.js")(sequelize, Sequelize);
db.attached = require("./_attached.model")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
    through: "user_roles",
    foreignKey: "roleId",
    otherKey: "userId"
});
db.user.belongsToMany(db.role, {
    through: "user_roles",
    foreignKey: "userId",
    otherKey: "roleId"
});


db.expense.hasMany(db.attached, {as: 'attached_group', foreignKey: 'attachedString'});
db.attached.belongsTo(db.expense, {foreignKey: 'attachedString'});


db.incomes.hasMany(db.attached, {as: 'attached_group', foreignKey: 'attachedString'});
db.attached.belongsTo(db.incomes, {foreignKey: 'attachedString'});

db.saving.hasMany(db.attached, {as: 'attached_group', foreignKey: 'attachedString'});
db.attached.belongsTo(db.saving, {foreignKey: 'attachedString'});
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;