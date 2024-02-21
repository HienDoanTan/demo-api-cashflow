module.exports = (sequelize, Sequelize) => {
    return sequelize.define("attached", {
        AttachedString: {
            type: Sequelize.STRING
        },
        FileName: {
            type: Sequelize.STRING
        },
        Status: {
            type: Sequelize.INTEGER
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
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE,
        },
    }, {
        timestamps: false
    });
};