var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(session({ secret: 'this is the secret', resave: false, saveUninitialized: false}));
app.use(cookieParser())
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(function(username, password, done) 
{
	UserModel.findOne({username: username, password: password}, function (err, user){
		if(user) {
			return done(null, user);
		}
		return done(null, false, {message: 'Unable to login'});
		});
}));

//server login response
app.post("/login", passport.authenticate('local'), function(req, res){
	//console.log("/login");
	//console.log(req.body);
	res.json(req.user);
});
//server logout response
app.post("/logout", function(req, res){
	req.logOut();
	res.send(200);
});
//Profile all users

var auth = function(req, res, next)
{
	if(!req.isAuthenticated())
		res.send(401);
	else
		next();
}
app.get("/rest/user",auth, function(req, res){
	UserModel.find(function(err, users){
		res.json(users);
	});
});
app.get("/loggedin", function(req, res){
	res.send(req.isAuthenticated() ? req.user : '0');
});

//Register page
app.post("/register", function(req, res){
	
	UserModel.findOne({username: req.body.username}, function(err, user){
		if(user)
		{
			//ToDo user already exists
			res.json(null);
			return;
		}
		else
		{
			var newUser = new UserModel(req.body);
			newUser.roles=[req.body.roles];
			newUser.save(function(err, user)
			{
				req.login(user, function(err)
				{
						if(err){return next(err);}
						res.json(user);
				});
				
			});
		}
	});
	//var newUser = req.body;
	//console.log(newUser);
});

var mongoose = require('mongoose');
var db = mongoose.connect('ds013579.mlab.com:13579/paikka');
//var db = mongoose.connect('mongodb://localhost/test');
var UserSchema=new mongoose.Schema({
	firstname: String,
	lastname: String,
	email: String,
	city: String,
	username: String,
	password: String,
	roles: [String]
});

var UserModel =mongoose.model("UserModel", UserSchema);
//var admin = new UserModel({username: "alice", password: "alice", firstname:"alice", lastname:"alice", roles: ["admin"] })
//var user = new UserModel({username: "bob", password: "bob", firstname:"bob", lastname:"alice", roles: ["user"] })

//admin.save();
//user.save();


app.use(express.static(__dirname + '/public'));

var port = Number(process.env.Port || 3000);

app.listen(port);