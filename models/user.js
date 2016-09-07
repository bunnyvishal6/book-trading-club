var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//Schema for user store in database
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = mongoose.model('User', new Schema({
    id: ObjectId,
    name: String,
    email: { type: String, unique: true },
    password: String,
    number: Number,
    books: [{
        bookName: String,
        author: String,
        ownedBy: String,
        ownedByName: String,
        coverPageUrl: String,
        number: Number,
        traded: Number,
    }],
    requestsIn: [{
        for: String,
        forBookName: String,
        requestedBy: String,
        requestedByName: String,
        author: String
    }],
    requestsOut: [{
        number: Number,
        bookName: String,
        ownedBy: String,
        ownedByName: String,
        author: String
    }],
    city: String,
    state: String,
    country: String
}));

//export User model and a create User function to hash the password
module.exports = User;
module.exports.createUser = function (newUser, callback) {
    if (newUser.password) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                newUser.password = hash;
                newUser.save(callback);
            });
        });
    }
};

//export update old password
module.exports.setUserPassword = function (currUser, oldPass, newPass, callback) {
    User.findOne({ email: currUser.email }, function (err, user) {
        if (err) {
            callback(1);
            throw err;
        } else {
            if (!user) {
                callback(1);
                return;
            } else {
                if (user.password) {
                    if (bcrypt.compareSync(oldPass, user.password)) {
                        bcrypt.genSalt(10, function (err, salt) {
                            bcrypt.hash(newPass, salt, function (err, hash) {
                                user.password = hash;
                                user.save(function (err) {
                                    if (err) { callback(1); return; }
                                });
                                callback(2)
                                return;
                            });
                        });
                    } else {
                        callback(1);
                        return;
                    }
                }
            }
        }
    });
}