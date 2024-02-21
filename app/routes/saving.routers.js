const { authJwt } = require("../middlewares");
const controller = require("../controllers/saving.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "X-Access-Token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/saving/get_history",
        [authJwt.verifyToken],
        controller.get_history
    );

    app.post(
        "/api/saving/insert",
        [authJwt.verifyToken],
        controller.insert
    );

    app.post(
        "/api/saving/delete",
        [authJwt.verifyToken],
        controller.delete
    );
};