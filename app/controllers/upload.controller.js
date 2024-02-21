const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Attached = db.attached;
const jwt = require("jsonwebtoken");
const moment = require("moment");

const Op = db.Sequelize.Op;

exports.upload_files = (req, res) => {
    try {

        if (!req.files) {
            return res.status(400).send({
                status: false,
                message: 'No file uploaded!'
            });
        } else {

            //loop all files
            const obj = Object.assign({}, req.files);

            User.findOne({
                where: {
                    id: jwt.decode(req.headers['x-access-token']).id
                }
            }).then((async (user) => {
                if (!user) {
                    return res.status(404).send({message: "User Not found."});
                }

                // Nếu chỉ có 1 file
                if (!Array.isArray(obj.files)) {
                    const file = obj.files;
                    const attachedString = req.body.attachedString;

                    const extension_file = file.name.split('.').pop().toLowerCase();
                    const file_name = file.name.split('.').shift().toLowerCase();
                    const time_string = new Date();

                    const my_name = file_name.substring(0, 10) + time_string.getUTCDate().toString() + "." + extension_file;

                    file.mv('./uploads/' + my_name);

                    let xObject = [];
                    xObject.push({
                        AttachedString: attachedString,
                        FileName: my_name,
                        Status: true,
                        CreateDate: moment(moment.now()).add(7, 'hours').format(),
                        CreateBy: user.id
                    });
                    await Attached.bulkCreate(
                        xObject
                    );

                    //return response
                    return res.status(200).send({
                        status: true,
                        message: 'Files are uploaded!'
                    });
                }
                // Ngược lại là 1 list file
                else {

                    let xObject = [];
                    obj.files.map(function (my_file, i) {
                        const attachedString = req.body.attachedString[i];
                        //move photo to uploads directory
                        const extension_file = my_file.name.split('.').pop().toLowerCase();
                        const file_name = my_file.name.split('.').shift().toLowerCase();
                        const time_string = new Date();

                        const my_name = file_name.substring(0, 10) + time_string.getTime() + "." + extension_file;

                        my_file.mv('./uploads/' + my_name);

                        xObject.push({
                            AttachedString: attachedString,
                            FileName: my_name,
                            Status: true,
                            CreateDate: moment(moment.now()).add(7, 'hours').format(),
                            CreateBy: user.id
                        });
                    });

                    await Attached.bulkCreate(
                        xObject
                    );

                    //return response
                    return res.status(200).send({
                        status: true,
                        message: 'Files are uploaded!'
                    });
                }

            })).catch(err => {
                res.status(500).send({message: err.message});
            });

        }
    } catch (err) {
        return res.status(500).send(err);
    }
}