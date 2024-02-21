const { authJwt } = require("../middlewares");
const controller = require("../controllers/upload.controller");


module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "X-Access-Token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/upload/upload_files",
        [authJwt.verifyToken],
        controller.upload_files
    );

};