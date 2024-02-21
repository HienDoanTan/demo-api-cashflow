const db = require("../models");
const Sequelize = require('sequelize');
const moment = require("moment");
const Saving = db.saving;
const User = db.user;
const Attached = db.attached;
const path = require('path');
const fs = require("fs");

const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;
const andOp = Op.and;

//--------------- Lấy chi phí theo ngày
exports.get_history = (req, res) => {
    const fromDay = (req.body.fromday === undefined || req.body.fromday === '') ? null : moment(req.body.fromday, 'DD-MM-YYYYTHH:mm:ssZ').add(7, 'hours').format(),
        toDay = (req.body.today === undefined || req.body.today === '') ? null : moment(req.body.today, 'DD-MM-YYYYTHH:mm:ssZ').add(7, 'hours').format(),
        queryString = (req.body.queryString === undefined || req.body.queryString === '') ? null : req.body.queryString;

    User.findOne({
        where: {
            id: jwt.decode(req.headers['x-access-token']).id
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }

        Saving.findAll({
            attributes: [
                'day', 'actions', 'money', 'id', 'notes', 'attachedString'
            ],
            where: getFooConditions(fromDay, toDay, user.id, queryString),
            order: [['day', 'DESC']],
            include: [
                {
                    model: Attached, required: false, as: 'attached_group',
                    on: {
                        attachedString: Sequelize.where(Sequelize.col('Saving.AttachedString'), '=', Sequelize.col('attached_group.AttachedString')),
                    },
                    attributes: ['id', 'FileName', 'AttachedString']
                },
            ]
        }).then((data) => {
            let array = [];
            if (data.length > 0) {
                data.map((value, index) => {
                    if (value.attached_group.length > 0) {
                        value.attached_group.map((da, i) => {
                            const directory = path.join(__dirname, "uploads");
                            da.FileName = 'http://' + req.headers.host + '/uploads/' + da.FileName;
                        })
                    }
                });
            }
            res.status(200).send(data);
        });

    })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
};

exports.insert = (req, res) => {
    User.findOne({
        where: {
            id: jwt.decode(req.headers['x-access-token']).id
        }
    }).then((async (user) => {
        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }

        let xObject = [];
        req.body.forEach((item) => {
            xObject.push({
                CreateBy: user.id,
                CreateDate: moment(moment.now()).add(7, 'hours').format(),
                Status: true,
                Actions: item.actions,
                Day: moment(item.day, 'DD-MM-YYYYTHH:mm:ssZ').add(7, 'hours').format(),
                Money: parseInt(item.money),
                Notes: item.notes,
                AttachedString: item.attachedString
            });
        });
        const jane = await Saving.bulkCreate(
            xObject
        );

        const Ids = jane[0].id;
        if (Ids > 0) {
            let year = 0;
            Saving.findOne({
                attributes: [[Sequelize.fn('YEAR', Sequelize.col('Day')), 'year']],
                where: {
                    Id: Ids
                }
            }).then((data) => {
                year = data.dataValues.year;
            }).then(() => {
                Saving.findAll({
                    attributes: [
                        [Sequelize.fn('SUM', Sequelize.col('Money')), 'totalMoney'],
                        [Sequelize.fn('MONTH', Sequelize.col('Day')), 'period']
                    ],
                    group: ['period'],
                    where: {
                        CreateBy: user.id,
                        Status: 1,
                        andOp: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('CreateDate')), year)
                    },
                }).then((data) => {
                    res.status(200).send(data);
                })
            });
        } else {
            res.status(500);
        }
    }))
        .catch(err => {
            res.status(500).send({message: err.message});
        });
};

exports.delete = (req, res) => {
    User.findOne({
        where: {
            id: jwt.decode(req.headers['x-access-token']).id
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }

        Saving.update({UpdateDate: moment(moment.now()).add(7, 'hours').format(), UpdateBy: user.id, Status: false}, {
            where: {
                Id: req.body
            }
        }).then(() => {
            let year = 0;
            Saving.findOne({
                attributes: [[Sequelize.fn('YEAR', Sequelize.col('Day')), 'year']],
                where: {
                    Id: req.body
                }
            }).then((data) => {
                year = data.dataValues.year;
            }).then(() => {
                Saving.findAll({
                    attributes: [
                        [Sequelize.fn('SUM', Sequelize.col('Money')), 'totalMoney'],
                        [Sequelize.fn('MONTH', Sequelize.col('Day')), 'period']
                    ],
                    group: ['period'],
                    where: {
                        CreateBy: user.id,
                        Status: 1,
                        andOp: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('Day')), year)
                    },
                }).then((data) => {
                    res.status(200).send(data);
                })
            });
        });

    })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
};


function getFooConditions(fromday, today, userId, queryString) {
    let fooConditions = {};
    if (fromday === null && today !== null) {
        fooConditions.Day = {
            [Op.lte]: today
        }
    }
    if (fromday !== null && today === null) {
        fooConditions.Day = {
            [Op.gte]: fromday
        }
    }
    if (fromday !== null && today !== null) {
        fooConditions.Day = {
            [Op.and]: {
                [Op.lte]: today,
                [Op.gte]: fromday,
            },
        }
    }
    if (queryString !== null) {
        fooConditions.Actions = {
            [Op.like]: `%${queryString}%`
        }
    }

    fooConditions.CreateBy = userId;
    fooConditions.Status = true;

    return fooConditions;
}
