var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var multer = require('multer');

//keep uploaded picture orinigal name

var storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
})

// for parsing multipart/form-data

var upload = multer({ storage: storage }); 

 // for parsing application/json

app.use(bodyParser.json());

// for parsing application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true })); 

//passport module for authenticating user

var passport = require('passport'); 

//passport strategy for authentication

var LocalStrategy = require('passport-local').Strategy; 

//cookie parser for cookie creation

var cookieParser = require('cookie-parser'); 

//for session creation

var session = require('express-session');

app.use(session({ secret: 'this is the secret', resave: false, saveUninitialized: false}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use('/user', bodyParser.json());

//serialize user instance

passport.serializeUser(function(user, done) {
  done(null, user);
});

//deserialize user instance

passport.deserializeUser(function(user, done) {
  done(null, user);
});


//Setting up strategy for authentication
passport.use(new LocalStrategy(function(username, password, done) 
{
	UserModel.findOne({username: username, password: password}, function (err, user){
		if(user) {
			return done(null, user);
		}
		if(err){
		return done(null, false, {message: 'Unable to login'});
		}
		});
}));

//server login response
app.post("/login", passport.authenticate('local'), function(req, res){
	res.json(req.user);
});

//server logout response

app.post("/logout", function(req, res){
	req.logOut();
	res.send(200);
});

//check if authenticated

var auth = function(req, res, next)
{
	if(!req.isAuthenticated())
		res.send(401);
	else
		next();
}

//Upload picture in server

app.post("/upload", upload.array('file'), function(req, res, next) {
    console.log(req.body) // this contains all text data
    console.log(req.files) // this is always an empty array
});



//MongoDb call to get all users

app.get("/user", function(req, res){
	UserModel.find(function(err, users){
		res.json(users);
	});
});

//MongoDb call to get all users and check is authenticated

app.get("/rest/user",auth, function(req, res){
	UserModel.find(function(err, users){
		res.json(users);
	});
});

//Get loggedIn user

app.get("/loggedin", function(req, res){
	res.send(req.isAuthenticated() ? req.user : '0');
});

//Register new user in db

app.post("/register", function(req, res){
	
	//check if username is already in User db document- If not creates one
	
	UserModel.findOne({username: req.body.username}, function(err, user){
		if(user)
		{
			/*ToDo user already exists*/
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
});

//****Company-Http-calls****************************************

//Db call get all companies

app.get('/rest/company', function(req, res){
	CompanyModel.find(function(err, response){
		res.json(response);
	});
});

//Db call for getting logedin user company info

app.get('/rest/company/:id', function(req, res){
	var user = req.params.id;
	console.log(user);
	
	//Find company information from company db document in order of loggedin user
	
	CompanyModel.find({userid: user}, function(err, response){
		res.json(response);
	});
});

//Db add logedin user company

app.post("/add", function(req, res){
	
	//check if company name already is in company document 
	//If not create new one with re.body form data
	
	CompanyModel.findOne({name: req.body.name}, function(err, company){
		if(company)
		{
			/*ToDo user already exists*/
			res.json(null);
			return;
		}
		else
		{
			var newCompany = new CompanyModel(req.body);
					
			newCompany.save(function(err, company)
			{
						res.json(company);
				
			});
		}
	});
});

//Db call for deleting company from db

app.delete('/company/:id',function(req, res){
	var Removeid = req.params.id;
	console.log(Removeid);
	
	//Find one from company db document in order of company id
	
	CompanyModel.findOne({_id: Removeid}, function (error, company){
        console.log("This object will get deleted " + company);
        company.remove();
		res.json(company);
    });
})

//Db call for getting getting company fields in order of current user :id

app.get('/company/:id',function(req, res){
		var Editid = req.params.id;
		console.log(Editid);
		
		//Find one from company db document in order of company id
		
		CompanyModel.findOne({_id: Editid}, function (error, company){
			res.json(company);
    });
})

//Db call for updating company info in db

app.put('/company/:id',function(req, res){
		var Editid = req.params.id;
		
		//Find one from company db document in order of company id
		
        CompanyModel.findById(Editid, function(err, company) {

            if (err)
                res.send(err);

            company.name = req.body.name;  // update the bears info
			company.street = req.body.street;
			company.postalCode = req.body.postalCode;
			company.city = req.body.city;
			company.phone = req.body.phone;
			company.email = req.body.email;
			company.logo = req.body.logo;
			company.brandId = req.body.brandId;
			
            // save the bear
            company.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'company updated!' });
            });

        });
})

//****Brand-Http-calls****************************************

//Db call for getting all companies of current brand

app.get('/brandCompanies/:id',function(req, res){
		var Editid = req.params.id;
		console.log(Editid);
		
		//Find one from company db document in order of brand id
		
		CompanyModel.find({brandId: Editid}, function (error, response){
			res.json(response);
    });
});

//Db call for getting all brands

app.get('/rest/brand', function(req, res){
	BrandModel.find(function(err, response){
		res.json(response);
	});
});

//Db call for getting brand in order of brand creator user

app.get('/rest/brand/:id', function(req, res){
	var user = req.params.id;
	console.log(user);
	
	//Find one from brand db document in order of brand creator user id
	
	BrandModel.find({userid: user}, function(err, response){
		res.json(response);
	});
});

//Db call for adding new brand in Db

app.post("/addBrand", function(req, res){
	
	//Find one from brand db document in order of brand name
	//If not found then create one
	
	BrandModel.findOne({name: req.body.name}, function(err, brand){
		if(brand)
		{
			/*ToDo user already exists*/
			res.json(null);
			return;
		}
		else
		{
			var newBrand = new BrandModel(req.body);
			
			newBrand.save(function(err, brand)
			{
				
						res.json(brand);
				
			});
		}
	});
});

//Db call for deleting brand in Db

app.delete('/brand/:id',function(req, res){
	var Removeid = req.params.id;
	console.log(Removeid);
	
	//Find one from brand db document in order of brand id
	
	BrandModel.findOne({_id: Removeid}, function (error, brand){
        console.log("This object will get deleted " + brand);
        brand.remove();
		res.json(brand);
    });
})

//Db call for getting brand in order of brand creator user

app.get('/brand/:id',function(req, res){
		var Editid = req.params.id;
		console.log(Editid);
		
		//Find one from brand db document in order of brand id
		
		BrandModel.findOne({_id: Editid}, function (error, brand){
			res.json(brand);
    });
})

//Db call for updating brand fields

app.put('/brand/:id',function(req, res){
		var Editid = req.params.id;
		
		//Find one from brand db document in order of brand id
		
        BrandModel.findById(Editid, function(err, brand) {

            if (err)
                res.send(err);

            brand.name = req.body.name;  // update the bears info
			brand.street = req.body.street;
			brand.postalCode = req.body.postalCode;
			brand.city = req.body.city;
			brand.phone = req.body.phone;
			brand.email = req.body.email;
			brand.logo = req.body.logo;
			
            // save the bear
            brand.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'brand updated!' });
            });

        });
})

//****End-Brand-Http-calls************************************


//Get all quest and populate quest created company document inside same .json
//return retrieved data as .json

app.get("/allquest", function(req, res){
	QuestModel
	.find({})
	.populate('companyId')
	.exec(function (err, response) {
	  if (err){
	  }	
		res.json(response);
	})
});

//Get all quests
//return retrieved data as .json

app.get("/quest", function(req, res){
	QuestModel.find(function(err, quests){
		res.json(quests);
	});
});

//Get all quests in order od company objectId
//return retrieved data as .json

app.get('/rest/quest/:id', function(req, res){
	var company = req.params.id;
	console.log(company);
	QuestModel.find({companyId: company}, function(err, response){
		res.json(response);
	});
});

//Check if quest name is in quest document. If not create one
//return retrieved data as .json

app.post("/addQuest", function(req, res){
	
	QuestModel.findOne({name: req.body.quest.name}, function(err, response){
		if(response)
		{
			//ToDo user already exists
			res.json(null);
			return;
		}
		else
		{
			var newQuest = new QuestModel(req.body.quest);
			
			//Loop clues array from req.body and push data in quest document questClues fields
			
			for(i=0;i < req.body.clues.length; i++){
				newQuest.questClues.push({name: req.body.clues[i].name, clue: req.body.clues[i].clue, icon: req.body.clues[i].icon, endCode: req.body.clues[i].endCode});

			}
			newQuest.save(function(err, response)
			{
						//if(err){return next(err);}
						res.json(response);
				
			});
		}
	});
});

//http call for getting user in order of id: phoneidentifier
//return .json

app.get('/rest/phoneUser/:id', function(req, res){
	var user = req.params.id;
	 PhoneUserModel.findOne({identifier: user}, function(err, response){
		res.json(response);
	});
});

//Check if phoneuser document has identifier = :id
//If not create new one
//return .json

app.get('/phoneUser/:id', function(req, res){
	var PhoneId = req.params.id;
	PhoneUserModel.findOne({identifier: PhoneId}, function(err, response){
		if(response)
		{
			/*ToDo user already exists*/
			res.json(null);
			return;
		}
		else
		{
			var newPhoneUser = new PhoneUserModel(req.body);
			newPhoneUser.identifier = req.params.id;
			newPhoneUser.save(function(err, response)
			{
						/*if(err){return next(err);}*/
						res.json(response);
				
			});
		}
	});
});

//Create phone user quest when user start quest in phone
//id:phone identifier
//questId: selected quest objectId
//clueId: selected quest first clue or phase objectId
//check if quest already in phoneUserQuest document in order of qusetId
//return .json

app.get('/phoneUserQuest/:id/:questId/:clueId', function(req, res){
	var questId = req.params.questId;
	UserQuestModel.findOne({questId: questId}, function(err, response){
		if(response)
		{
			/*ToDo user already exists*/
			res.json(null);
			return;
		}
		else
		{
			var newUserQuest = new UserQuestModel(req.body);
			newUserQuest.phoneId = req.params.id;
			newUserQuest.questId = req.params.questId;
			newUserQuest.currentClue = req.params.clueId;
			newUserQuest.questState = "accepted";
			newUserQuest.save(function(err, response)
			{
					console.log("läpi:" + response);
						/*if(err){return next(err);}*/
						res.json(response);
			});
		}
	});
});

//Update phone user quest when user start quest in phone
//id: phoneUserQuest document instance objectId
//clueId: selected quest next clue or phase objectId
//find user in order of questId
//return .json

app.get('/userQuestUpdate/:id/:clueId/:questState',function(req, res){
		var Editid = req.params.id;
		
        UserQuestModel.findById(Editid, function(err, response) {

            if (err)
                res.send(err);

			response.currentClue = req.params.clueId;
			response.questState = req.params.questState;
			
            response.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'quest updated!' });
            });

        });
})

//http call get all users quest
//:id = phoneUser document instance objectId

app.get('/rest/userQuest/:id', function(req, res){
	var user = req.params.id;
	UserQuestModel.find({phoneId: user}, function(err, response){
		res.json(response);
	});
});

//Delete quest from QuestModel document
//:id quest objectId

app.delete('/quest/:id',function(req, res){
	var Removeid = req.params.id;
	console.log(Removeid);
	QuestModel.findOne({_id: Removeid}, function (error, response){
        console.log("This object will get deleted " + response);
        response.remove();
		res.json(response);
    });
})

//Delete quest from QuestModel document
//:id quest objectId

app.delete('/removeQuest/:id',function(req, res){
	var companyId = req.params.id;
	console.log(companyId);
	QuestModel.find({company: companyId}, function (error, response){
        console.log("This object will get deleted " + response);
        response.remove();
		res.json(response);
    });
})

//find quest in order of quest id
//id: quest objectId
//return single quest .json

app.get('/quest/:id',function(req, res){
		var Editid = req.params.id;
		console.log(Editid);
		QuestModel.findOne({_id: Editid}, function (error, response){
		res.json(response);
    });
})

//Update quest in QuestModel db document
//:id = quest objectId


app.put('/quest/:id',function(req, res){
		var Editid = req.params.id;
		
        QuestModel.findById(Editid, function(err, response) {

            if (err)
                res.send(err);
			
			response.questType = [req.body.quest.questType];  
            response.name = req.body.quest.name;
			response.description = req.body.quest.description;
			response.prizeDescription = req.body.quest.prizeDescription;
			response.questIcon = req.body.quest.questIcon;
			response.prizeAmount = req.body.quest.prizeAmount;
			response.questDuration = req.body.quest.questDuration;
			response.questStartTime = req.body.quest.questStartTime;
			response.questEndTime = req.body.quest.questEndTime;
			response.questEndCode = req.body.quest.questEndCode;
			
			//check if clues array not empty and reset questClues field in db document. Then add new array data
			
			if(req.body.clues[0]){
				response.update({questClues:[]}, { $set: { questClues: [] }}, function(err, affected){
				});
				for(i=0;i < req.body.clues.length; i++){
					response.questClues.push({name: req.body.clues[i].name, clue: req.body.clues[i].clue, icon: req.body.clues[i].icon, endCode: req.body.clues[i].endCode});
				}
			}
			response.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'quest updated!' });
            });
        });
})
//****End-Quest-Http-calls**************************************

var mongoose = require('mongoose'), Schema = mongoose.Schema;

//set mongodb database connection

var db = mongoose.connect('mongodb://localhost/test');

//User document schema

var UserSchema=new mongoose.Schema({
	firstname: String,
	lastname: String,
	email: String,
	city: String,
	username: String,
	password: String,
	roles: [String],
	company: String
});

//PhoneUsers document schema

var PhoneUserSchema=new mongoose.Schema({
	identifier: String
});

//UserQuest document schema

var UserQuestSchema=new mongoose.Schema({
	phoneId: {type: db.Schema.Types.ObjectId, ref: 'PhoneUserSchema'},
	questId: String,
	currentClue: String,
	questState: String
});

//Company document schema

var CompanySchema=new mongoose.Schema({
	name: String,
	street: String,
	postalCode: String,
	city: String,
	phone:	String,
	email:	String,
	logo: String,
	lat: String,
    lng: String,
	loc: [{
        latitude: String,
        longitude: String
    }],
	userid: String,
	brandId: {type: db.Schema.Types.ObjectId, ref: 'BrandModel'}
});

mongoose.model('Company', CompanySchema);

//Brand document schema

var BrandSchema=new mongoose.Schema({
	name: String,
	street: String,
	postalCode: String,
	city: String,
	phone:	String,
	email:	String,
	logo: String,
	lat: String,
    lng: String,
	loc: [{
        latitude: String,
        longitude: String
    }],
	userid: String,
});

//Quest document schema

var QuestSchema=new mongoose.Schema({
	company: {type: db.Schema.Types.ObjectId, ref: 'CompanyModel'},
	companyId: {type: db.Schema.Types.ObjectId, ref: 'CompanyModel'},
	name: String,
	description: String,
	prizeDescription: String,
	prizeAmount: Number,
	questType: [String],
	questClues:[{
        name: String,
        clue: String,
		icon: String,
		endCode: String
    }],
	questIcon: String,
	questDone: Boolean,
	questDuration: Number,
	questStartTime: String,
	questEndTime: String,
	questEndCode: String,
	qrCode: String
});

mongoose.model('Quest', QuestSchema);

//Mongoose models

var UserModel =mongoose.model("UserModel", UserSchema);
var CompanyModel =mongoose.model("CompanyModel", CompanySchema);
var BrandModel =mongoose.model("BrandModel", BrandSchema);
var QuestModel =mongoose.model("QuestModel", QuestSchema);
var PhoneUserModel =mongoose.model("PhoneUserModel", PhoneUserSchema);
var UserQuestModel =mongoose.model("UserQuestModel", UserQuestSchema);

/*var company = new CompanyModel({name: "K-rauta",  address:"jokukatu", city:"Tampere"})
var admin = new UserModel({username: "alice", password: "alice", firstname:"alice", lastname:"alice", roles: ["admin"] })
var user = new UserModel({username: "bob", password: "bob", firstname:"bob", lastname:"alice", roles: ["user"] })

admin.save();
user.save();
company.save();*/


app.use(express.static(__dirname + '/public'));

var port = Number(process.env.Port || 3000);

app.listen(port);