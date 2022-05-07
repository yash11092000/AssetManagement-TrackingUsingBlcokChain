const jwt = require("jsonwebtoken");
const Registeruser = require("../models/user");

const authuser = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRETE_KEY);
        // console.log(verifyUser);

        const user = await Registeruser.findOne({ name: verifyUser.name });
        // console.log(user.name);

        req.token = token;
        req.user = user;

        next();

    } catch (error) {
        res.render("buyer");
        // res.status(401).send(error);
    }
}

module.exports = authuser;