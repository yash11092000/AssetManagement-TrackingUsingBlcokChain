const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

})

UserSchema.methods.generateAuthToken2 = async function () {
    try {
        console.log(this.name);
        const token = jwt.sign({ _id: this.name.toString() }, process.env.SECRETE_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        res.send("Some Error Occured " + error);
        console.log("The Error Part " + error);
    }
}

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.cpassword = await bcrypt.hash(this.password, 10);
    }

    next();
})

const Registeruser = new mongoose.model("Registeruser", UserSchema);
module.exports = Registeruser;