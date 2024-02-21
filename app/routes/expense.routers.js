const { authJwt } = require("../middlewares");
const controller = require("../controllers/expense.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "X-Access-Token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/data/year",
        [authJwt.verifyToken],
        controller.get_year
    );

    app.post(
        "/api/data/get_by_year",
        [authJwt.verifyToken],
        controller.get_by_year
    );

    app.post(
        "/api/data/get_all_year",
        [authJwt.verifyToken],
        controller.get_all_year
    );


    app.post(
        "/api/expense/get_history",
        [authJwt.verifyToken],
        controller.get_history
    );

    app.post(
        "/api/expense/insert",
        [authJwt.verifyToken],
        controller.insert
    );

    app.post(
        "/api/expense/delete",
        [authJwt.verifyToken],
        controller.delete
    );
};