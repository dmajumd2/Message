var express = require('express'),
    app = express(),
    mongoose = require('mongoose');

    var bodyParser = require('body-parser');
    var cors = require('cors')  

    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));

    mongoose.Promise = require('q').Promise;

    mongoose.connect('mongodb://localhost:27017/users', function(err){
    if(err){
        console.log("Connection not established");
    }
    else{
        console.log("Connection established");
    }
    });

    var Schema = mongoose.Schema;

    var users_schema = new Schema({
        username: String,
        password: String,
        firstname: String,
        lastname: String,
        email: String,
        phone: String,
        location: String,
       // array: [{jobtitle: String, jobDescription: String, location: String}],
        //appliedjobs: [{jobtitle: String, jobDescription: String, location: String}]
    });

    var messages_schema = new Schema({
        recipient: String,
        recipient_img: String,
        sender: String,
        sender_img: String,
        title: String,
        description: String,
        important: String
    });

    var reply_schema = new Schema({
        replyId: String,
        reply: String
    });

var user = mongoose.model('user_signup', users_schema);
var message = mongoose.model('messages_lists', messages_schema);
var repqly = mongoose.model('reply_list', reply_schema);
//var dbo = db.db("users");


//////////////////Reply//////////////////////
app.post('/reply', function(req, res){
    console.log("In the reply part" );
    console.log(req.body);
    var id = req.body.id;
    var reply =  req.body.reply;
    var replymessage = new repqly({
        replyId: id,
        reply: reply
    });

    replymessage.save(function(err, user){
        if (!err){
            console.log("Reply saved");
            res.send({
                 isReplied: true,
                 message: 'replied',
                 data: user
             });
         }
         else{
             res.send({
                 isReplied:false,
                 message: 'replied error'
             })
         } 
    });

});

    //////////////////Register users in the db/////////////////////////////////////
app.post('/register', function(req, res){
   // console.log("In the registration server");
        //console.log(req.body);
        // console.log(req.body.user);
    
        var userRegistration = new user({
            username: req.body.username,
            password: req.body.password,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            phone: req.body.phone,
            location: req.body.location
        });
        
        userRegistration.save(function(err) {
            if (!err){
               console.log("Document saved");
               res.send({
                    isRegistered: true,
                    message: 'registered'
                });
            }
            else{
                res.send({
                    isRegistered:false,
                    message: 'Registration error'
                })
            } 
        });
    });

/////////////////////loginuser////////////////////////////////
app.post('/loginuser', function(req, res){
    //console.log("In the login");
    var username =  req.body.username;
    var password = req.body.password;
    //console.log("sdsd"+ username);
    
    user.findOne({username: username, password: password}, function(err, user){
       if(err){
           return res.status(500).send();
       }
       if(!user){
           return res.send({
               isLoggedIn: false,
               message: "Not Registered"
           });
       }
       return res.send({
           isLoggedIn: true,
           message: "Registered",
           data: user
       });
    });
});

/////////////////////PROFILE UPDATE//////////////////////////////////
app.post('/profile', function(req, res){
    var username = req.body.user;
    var newUsername = req.body.userdetails.username;
    var newpassword = req.body.userdetails.password;
    var newfirstname = req.body.userdetails.firstname;
    var newlastname = req.body.userdetails.lastname;
    var newemail = req.body.userdetails.email;
    var newphone = req.body.userdetails.phone;
    var newlocation = req.body.userdetails.location;

    //console.log(newUsername);

    user.update({username: username}, {"$set": {username: newUsername, password:newpassword, firstname: newfirstname, lastname: newlastname, email: newemail, phone: newphone, location: newlocation}}, function(err, user){
        if(err){
            return res.send({
                reset: false,
                message: "not updated"
            });
        }
        if(!user){
            return res.send({
                reset: false,
                message: "not updated"
            });
        } 
        return res.send({
            reset: true,
            message: "Updated Successfully",
            data: user
        });
    });
});

///////////////////////////////MESSAGE SAVED/////////////////////////////
app.post('/messagesave', function(req, res){
    console.log('In the message server');
    console.log(req.body.user);
    var username = req.body.user;
    message.find({recipient : username}, function(err, msg){
        if(err){
            return res.status(500).send();
        }
        if(!msg){
            return res.send({
                messages: false,
                message: "No messages"
            });
        }
        return res.send({
            messages: true,
            message: "Have messages",
            data: msg
        });

    });
});

/////////////////////////////////IMPORTANT COUNT////////////////////////

app.post('/important', function(req, res){
    console.log('In the imp server');
    console.log(req.body.count);
    console.log(req.body.id);
    var important = req.body.count;
    var id =  req.body.id;
   
    message.update({_id: id}, {"$set": {important: important}}, function(err, user){
        if(err){
            return res.send({
                reset: false,
                message: "not updated"
            });
        }
        if(!user){
            return res.send({
                reset: false,
                message: "not updated"
            });
        } 
        return res.send({
            reset: true,
            message: "Updated Successfully",
            data: user
        });
    });

});

///////////////////////DELETE MESSAGE//////////////////////////
app.post('/deletemsg', function(req, res){
    console.log(req.body.id);
    var id = req.body.id;
    message.remove({_id: id}, function(err, user){
        if(err){
            return res.send({
                delete: false,
                message: "not deleted"
            });
        }
        if(!user){
            return res.send({
                delete: false,
                message: "not deleted"
            });
        } 
        return res.send({
            reset: true,
            message: "Deleted Successfully",
        });
    })
 

});


    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/public/index.html');
    });
    
    app.listen(3000, function () {
        console.log('Server running at local host @3000');
    });