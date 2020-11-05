const mongoose = require('mongoose');

var url = "mongodb://127.0.0.1:27017/zsg";
mongoose.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => console.log("Connection Successful"))
.catch(err => console.log(err));

let personSchema = new mongoose.Schema({
    name: String,
    age: Number,
    sex: {
        type: String,
        default: "男"
    },

    chat: String
});

let pwdSchema = new mongoose.Schema({
    newpwd: String,
    oldpwd: String
});

module.exports.infoModel = mongoose.model("info",personSchema);
module.exports.infosModel = mongoose.model("infos",pwdSchema);