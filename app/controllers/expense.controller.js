const db = require("../models");
const Sequelize = require('sequelize');
const moment = require("moment");
const Expense = db.expense;
const Incomes = db.incomes;
const Saving = db.saving;
const User = db.user;
const Attached = db.attached;
const path = require('path');
const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;
const andOp = Op.and;
const fs = require("fs");

//--------------- Lấy ra list năm
exports.get_year = (req, res) => {
    User.findOne({
        where: {
            id: jwt.decode(req.headers['x-access-token']).id
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }

        let _leagueIds = [];

        Expense.findAll({
            attributes: [[Sequelize.fn('YEAR', Sequelize.col('Day')), 'year']],
            group: ['year'],
            where: {
                CreateBy: user.id,
                Status: 1
            },
        }).each(function (data) {
            _leagueIds.push(data);

        }).then(() => {
            Incomes.findAll({
                attributes: [[Sequelize.fn('YEAR', Sequelize.col('Day')), 'year']],
                group: ['year'],
                where: {
                    CreateBy: user.id,
                    Status: 1
                }
            }).each(function (data) {
                _leagueIds.push(data);
            }).then(() => {
                Saving.findAll({
                    attributes: [[Sequelize.fn('YEAR', Sequelize.col('Day')), 'year']],
                    group: ['year'],
                    where: {
                        CreateBy: user.id,
                        Status: 1
                    }
                }).each(function (data) {
                    _leagueIds.push(data);
                }).then(() => {
                    let resArr = [];
                    _leagueIds.forEach(function (item) {
                        let i = resArr.findIndex(x => x.year === item.dataValues.year);
                        if (i <= -1) {
                            resArr.push({year: item.dataValues.year});
                        }
                    });
                    res.status(200).send(resArr);
                });
            });
        });
    })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
};

//--------------- Lấy ra data theo năm
exports.get_by_year = (req, res) => {
    const Years = req.body.year;
    User.findOne({
        where: {
            id: jwt.decode(req.headers['x-access-token']).id
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }

        let xObject = {expenseDto: [], incomeDto: [], savingDto: [], year: Years};
        Expense.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('Money')), 'totalMoney'],
                [Sequelize.fn('MONTH', Sequelize.col('Day')), 'period']
            ],
            group: ['period'],
            where: {
                CreateBy: user.id,
                Status: 1,
                andOp: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('Day')), Years)
            },
        }).then((data) => {
            xObject.expenseDto = data;

            Incomes.findAll({
                attributes: [
                    [Sequelize.fn('SUM', Sequelize.col('Money')), 'totalMoney'],
                    [Sequelize.fn('MONTH', Sequelize.col('Day')), 'period']
                ],
                group: ['period'],
                where: {
                    CreateBy: user.id,
                    Status: 1,
                    andOp: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('Day')), Years)
                },
            }).then((data) => {
                xObject.incomeDto = data;
                Saving.findAll({
                    attributes: [
                        [Sequelize.fn('SUM', Sequelize.col('Money')), 'totalMoney'],
                        [Sequelize.fn('MONTH', Sequelize.col('Day')), 'period']
                    ],
                    group: ['period'],
                    where: {
                        CreateBy: user.id,
                        Status: 1,
                        andOp: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('Day')), Years)
                    },
                }).then((data) => {
                    xObject.savingDto = data;
                    res.status(200).send(xObject);
                });
            });
        });

    })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
};

//--------------- Lấy tất cả data
exports.get_all_year = (req, res) => {
    User.findOne({
        where: {
            id: jwt.decode(req.headers['x-access-token']).id
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }

        let xObject = {expenseDto: [], incomeDto: [], savingDto: [], listYear: []}, arrYear = [];
        Expense.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('Money')), 'totalMoney'],
                [Sequelize.fn('MONTH', Sequelize.col('Day')), 'period'],
                [Sequelize.fn('YEAR', Sequelize.col('Day')), 'year']
            ],
            group: ['period', 'year'],
            where: {
                CreateBy: user.id,
                Status: 1
            },
        }).each((data) => {
            arrYear.push({
                year: data.dataValues.year
            })
        }).then((data) => {
            xObject.expenseDto = data;

            Incomes.findAll({
                attributes: [
                    [Sequelize.fn('SUM', Sequelize.col('Money')), 'totalMoney'],
                    [Sequelize.fn('MONTH', Sequelize.col('Day')), 'period'],
                    [Sequelize.fn('YEAR', Sequelize.col('Day')), 'year']
                ],
                group: ['period', 'year'],
                where: {
                    CreateBy: user.id,
                    Status: 1
                },
            }).each((data) => {
                arrYear.push({
                    year: data.dataValues.year
                })
            }).then((data) => {
                xObject.incomeDto = data;
                Saving.findAll({
                    attributes: [
                        [Sequelize.fn('SUM', Sequelize.col('Money')), 'totalMoney'],
                        [Sequelize.fn('MONTH', Sequelize.col('Day')), 'period'],
                        [Sequelize.fn('YEAR', Sequelize.col('Day')), 'year']
                    ],
                    group: ['period', 'year'],
                    where: {
                        CreateBy: user.id,
                        Status: 1
                    },
                }).each((data) => {
                    arrYear.push({
                        year: data.dataValues.year
                    })
                }).then((data) => {
                    xObject.savingDto = data;
                    let resArr = [];
                    arrYear.forEach(function (item) {
                        let i = resArr.findIndex(x => x.year === item.year);
                        if (i <= -1) {
                            resArr.push({year: item.year});
                        }
                    });

                    xObject.listYear = resArr;

                    res.status(200).send(xObject);
                });
            });
        });

    })
        .catch(err => {
            res.status(500).send({message: err.message});
        });
};

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

        Expense.findAll({
            attributes: [
                'day', 'actions', 'money', 'id', 'notes', 'attachedString'
            ],
            where: getFooConditions(fromDay, toDay, user.id, queryString),
            order: [['day', 'DESC']],
            include: [
                {
                    model: Attached, required: false, as: 'attached_group',
                    on: {
                        attachedString: Sequelize.where(Sequelize.col('Expense.AttachedString'), '=', Sequelize.col('attached_group.AttachedString')),
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
        const jane = await Expense.bulkCreate(
            xObject
        ).then(() => {
            res.status(200).send({
                status: true
            });
        }).catch((err) => {
            res.status(500).send({status: false, message: err.message});
        });
    }))
        .catch(err => {
            res.status(500).send({status: false, message: err.message});
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

        Expense.update({UpdateDate: moment(moment.now()).add(7, 'hours').format(), UpdateBy: user.id, Status: false}, {
            where: {
                Id: req.body
            }
        }).then(() => {
            let year = 0;
            Expense.findOne({
                attributes: [[Sequelize.fn('YEAR', Sequelize.col('Day')), 'year']],
                where: {
                    Id: req.body
                }
            }).then((data) => {
                year = data.dataValues.year;
            }).then(() => {
                Expense.findAll({
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

function removeParamsForServer(requestData, excludeParamsToRemove = [], param_remove = null) {
    Object.keys(requestData).forEach(propName => {
        const isExistedParam = excludeParamsToRemove.includes(propName);
        if (!isExistedParam) {
            if (isEmpty(requestData[propName]) || requestData[propName] === param_remove) {
                delete requestData[propName];
            }
        }
    });
    return requestData;
}