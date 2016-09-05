var express = require('express');
var router = express.Router();
var session = require('client-sessions');
var bcrypt = require('bcryptjs');
var csrf = require('csurf');
var User = require('../models/user');

//CSRF(Cross site request forgery) protection
router.use(csrf());

//get home
router.get('/', function (req, res) {
    if (req.session && req.session.user) { //checking for session if had session then serve dashboard else redirect to home page
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (!user) {
                req.session.reset();
                res.render('index');
            } else {
                res.locals.user = req.session.user;
                res.render('index');
            }
        });
    } else {
        res.render('index');
    }
});

//get login
router.get('/login', function (req, res) {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        res.redirect('/');
    } else {
        res.render('login', { csrfToken: req.csrfToken() });
    }
});

//post login
router.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    email = email.toLowerCase();
    User.findOne({ email: email }, function (err, user) {
        if (!user) {
            req.flash('error_msg', 'Your are not registered. please signup first.');
            res.redirect('/signup');
        } else {
            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    requestsIn: user.requestsIn,
                    requestsOut: user.requestsOut,
                    city: user.city,
                    state: user.state,
                    country: user.country,
                    books: user.books
                };
                res.locals.user = req.session.user;
                res.redirect('/');
            } else {
                req.flash('error_msg', 'Incorrect username or password');
                res.redirect('/login');
            }
        }
    });
})

//get signup
router.get('/signup', function (req, res) {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        res.redirect('/');
    } else {
        res.render('signup', { csrfToken: req.csrfToken() });
    }
});

//post signup
router.post('/signup', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    name = name.substring(0, 1).toUpperCase() + name.substring(1, name.length).toLowerCase();
    email = email.toLowerCase();
    var errors;
    User.findOne({ email: email }, function (err, user) { // check if the user with same email already exists if not register else prompt error
        if (user) {
            errors = "The email with which you are trying to signup is already registered try with another email";
            res.render('signup', { error: errors, csrfToken: req.csrfToken() });
        } else {
            if (password === password2) {
                var newUser = new User({
                    name: name,
                    email: email,
                    password: password,
                    city: "City name",
                    state: "State name",
                    country: "Country name"
                });
                User.createUser(newUser, function (err) {
                    if (err) {
                        throw err;
                    }
                });
                req.flash('success_msg', "Your signup is successfull, now you can login");
                res.redirect('/login');
            } else {
                req.flash('error_msg', "Your passwords do not match");
                res.redirect('/login');
            }
        }
    });
});

//get allbooks
router.get('/allbooks', function (req, res) {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        res.render('allbooks', { csrfToken: req.csrfToken() });
    } else {
        req.flash("error_msg", "You are not logged in! Please login first.");
        res.redirect('/login');
    }
});

//get mybooks
router.get('/mybooks', function (req, res) {
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (err) {
                console.error(err);
                req.flash("error_msg", "You are not logged in! Please login first.");
                res.redirect('/login');
                return;
            } else if (user) {
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    requestsIn: user.requestsIn,
                    requestsOut: user.requestsOut,
                    city: user.city,
                    state: user.state,
                    country: user.country,
                    books: user.books
                };
                res.locals.user = req.session.user;
                if (req.session.user.books.length > 0) {
                    res.render('mybooks', { csrfToken: req.csrfToken() });
                } else {
                    res.render('mybooks', { csrfToken: req.csrfToken(), info: "You haven't added any books yet" });
                }
            }
        });
    } else {
        req.flash("error_msg", "You are not logged in! Please login first.");
        res.redirect('/login');
    }
});

//get settings
router.get('/settings', function (req, res) {
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (err) {
                throw err;
            } else if (user) {
                res.locals.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    requestsIn: user.requestsIn,
                    requestsOut: user.requestsOut,
                    city: user.city,
                    state: user.state,
                    country: user.country,
                    books: user.books
                }
                res.render('settings', { csrfToken: req.csrfToken() });
            } else {
                req.flash("error_msg", "You are not logged in! Please login first.");
                res.redirect('/login');
            }
        });
    } else {
        req.flash("error_msg", "You are not logged in! Please login first.");
        res.redirect('/login');
    }
});

//update profile i.e, post to /settings/updateprofile
router.post('/settings/updateProfile', function (req, res) {
    if (req.session, req.session.user) {
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (err) {
                console.error(err);
                req.session.reset();
                req.flash('error_msg', "Oops! something bad happened, Please try logining again.");
                res.redirect('/settings');
            } else if (user) {
                user.city = req.body.city.substring(0, 1).toUpperCase() + req.body.city.substring(1, req.body.city.length).toLowerCase();
                user.state = req.body.state.substring(0, 1).toUpperCase() + req.body.state.substring(1, req.body.state.length).toLowerCase();
                user.country = req.body.country.substring(0, 1).toUpperCase() + req.body.country.substring(1, req.body.country.length).toLowerCase();
                user.save(function (err) {
                    if (err) { throw err; }
                });
                req.flash('success_msg', "Your info updated successfully");
                res.redirect('/settings');
            } else {
                req.session.reset();
                req.flash('error_msg', "Oops! something bad happened, Please try logining again.");
                res.redirect('/settings');
            }
        });
    } else {
        res.redirect('/');
    }
});

//post updatePassword
router.post('/settings/updatePassword', function (req, res) {
    if (req.session && req.session.user) {
        if (req.body.password1 === req.body.password2) {
            User.setUserPassword(req.session.user, req.body.password, req.body.password1, function (num) {
                if (num === 1) {
                    req.flash("error_msg", "Oops! something bad happened, please login again with old password.");
                    res.redirect("/login");
                } else if (num === 2) {
                    req.flash("success_msg", "Your password updated successfully");
                    res.redirect("/settings");
                }
            });
        }
    }
});

//post newbook add
router.post('/mybooks/addNewBook', function (req, res) {
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (err) {
                console.error(err);
            } else if (user) {
                var books = user.books;
                var newbook = {
                    bookName: req.body.bookName,
                    author: req.body.author,
                    ownedBy: req.session.user.email,
                    ownedByName: req.session.user.name,
                    number: req.session.user.books.length + 1
                }
                if (req.body.coverPageUrl) {
                    newbook.coverPageUrl = req.body.coverPageUrl;
                    books.push(newbook);
                } else {
                    newbook.coverPageUrl = "/public/images/img-not-available.jpg";
                    books.push(newbook);
                }
                user.books = books;
                user.save(function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
                req.flash('success_msg', 'You have added a new book successfully');
                res.redirect('/mybooks');
            }
        });
    } else {
        req.session.reset();
        req.flash('error_msg', 'Oops! something bad happened, please login again.');
        res.redirect('/login');
    }
});


router.post('/mybooks/removeBook', function (req, res) {
    console.log(req.body);
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (err) {
                console.error(err);
                req.session.reset();
                req.flash("error_msg", "Oops! something bad happened. please login again");
                res.redirect('/login');
            } else if (user) {
                var books = user.books;
                var checkNum = 0;
                for (var i = 0; i < books.length; i++) {
                    if (books[i].number === +req.body.number) {
                        var removed = books.splice((+req.body.number - 1), 1);
                        user.books = books;
                        user.save(function (err) {
                            if (err) {
                                console.error(err);
                                req.flash("error_msg", "Oops! something bad happened. please login again");
                                res.redirect('/login');
                            }
                        });
                        req.flash("success_msg", "The book: " + removed[0].bookName + " is deleted successfully");
                        res.redirect('/mybooks');
                    } else {
                        checkNum += 1;
                        if (checkNum === books.length) {
                            req.flash("error_msg", "Oops! The book you want to delete is not found!");
                            res.redirect('/mybooks');
                        }
                    }
                }
            } else {
                req.session.reset();
                req.flash("error_msg", "Oops! something bad happened. please login again");
                res.redirect('/login');
            }
        })
    }
});

//logout
router.get('/logout', function (req, res) {
    if (req.session && req.session.user) {
        req.session.reset();
        req.user = {};
        req.flash("success_msg", "You are successfully logged out!");
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});


module.exports = router;