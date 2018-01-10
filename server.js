var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MessageBoard');

var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');

var Schema = mongoose.Schema;
var MessageSchema = mongoose.Schema({
    content: { type: String, minlength: 1 },
    name: { type: String, minlength: 3 },
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
}, { timestamps: true }
)
mongoose.model("Message", MessageSchema);

var CommentSchema = mongoose.Schema({
    content: { type: String, minlength: 1 },
    name: { type: String, minlength: 3 },
    _message: {type: Schema.Types.ObjectId, ref: "Message"},
}, { timestamps: true }
)
mongoose.model("Comment", CommentSchema);

var Comment = mongoose.model("Comment");
var Message = mongoose.model("Message");

app.get('/', function (req, res) {
    Message.find().populate('comments').exec(function (err, allMessages) {
        if (err) {
            console.log("error");
            res.send(err);
        } else {
            console.log("Got all messages");
            res.render("index", { messages: allMessages });
        }
    })
})

app.post('/messages', function (req, res) {
    var newMessage = new Message(req.body);
    newMessage.save(function (err) {
        if (err) {
            console.log('could not save message');
            res.send(err);
        } else { 
            console.log('message added');
            res.redirect("/");
        }
    })
})

app.post('/comments', function (req, res) {  
    var newComment = new Comment(req.body);
    Message.findOne({_id: req.body._message}, function (err, foundMessage) {
        if (err) {
            console.log('could not save comment');
            res.send(err);
        } else {
            console.log('found message, adding comment');
            newComment.save(function (err) {
                if (err) {
                    console.log('could not save comment');
                    res.send(err);
                } else {
                    foundMessage.comments.push(newComment._id);
                    foundMessage.save(function (err) {
                        if (err) {
                            console.log('could not save comment');
                            res.send(err);
                        } else {
                            console.log('comment saved');
                            res.redirect('/');
                        }
                    })
                }    
            })
        }
    })
})
    
app.listen(8000, function() {
    console.log("listening on port 8000");
})