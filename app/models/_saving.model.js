module.exports = (sequelize, Sequelize) => {
    const Saving = sequelize.define("Saving", {
        Actions: {
            type: Sequelize.STRING
        },
        Money: {
            type: Sequelize.DECIMAL(10, 2)
        },
        Day: {
            type: Sequelize.DATE
        },
        CreateDate: {
            type: Sequelize.DATE
        },
        CreateBy: {
            type: Sequelize.INTEGER
        },
        UpdateDate: {
            type: Sequelize.DATE
        },
        UpdateBy: {
            type: Sequelize.INTEGER
        },
        Status: {
            type: Sequelize.INTEGER
        },
        Notes: {
            type: Sequelize.STRING
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE,
        },
        AttachedString: {
            type: Sequelize.STRING
        }
    }, {
        timestamps: false
    });

    return Saving;
};