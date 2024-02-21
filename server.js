const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require('express-fileupload');
const app = express();
const path = require("path");

const whitelist = [
    'http://localhost:3000'
]

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOptionsDelegate));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
    res.send(200).json({ message: "Welcome to cash flow application." });
});


//
// const db = require("./app/models");
//  const Role = db.role;
// //
// db.sequelize.sync({force: true}).then(() => {
//     console.log('Drop and Resync Db');
//     initial();
// });

const directory = path.join(__dirname, "uploads");
app.use("/uploads", express.static(directory));

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/expense.routers')(app);
require('./app/routes/incomes.routers')(app);
require('./app/routes/saving.routers')(app);
require('./app/routes/upload.routers')(app);

// function initial() {
//     Role.create({
//         id: 1,
//         name: "user"
//     });
//
//     Role.create({
//         id: 2,
//         name: "moderator"
//     });
//
//     Role.create({
//         id: 3,
//         name: "admin"
//     });
// }


// set port, listen for requests
const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});