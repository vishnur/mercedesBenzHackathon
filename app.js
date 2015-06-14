var express = require('express');
var http = require('http');
//var url  = require('url');
var mongo = require('mongodb').MongoClient;


var app = express();
var serve = http.createServer(app);
var io = require('socket.io')(serve);

app.set('port', 3000);
app.set('dburl', 'mongodb://admin:admin@ds047812.mongolab.com:47812/mercedezhackathon')
//app.set('dburl', 'mongodb://localhost:27017/test')

app.use(express.static('public'));


serve.listen(3000, function () {
    console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', function(req, res){
  res.send('<h1>Accident Blackbox</h1>');
});

app.get('/vehicle', function(req, res){
  var n = parseInt(req.query.seq || 0) ;
  n = parseInt(n);
  mongo.connect(app.get('dburl'), function(err, db) {
  	var collection = db.collection('vehicle_data');
  	var stream = db.collection('vehicle_data').find({'Extra_SequenceNumber' : {$gt : n}},{'Image_Frame' : 0}).limit(1).stream();
  	//var stream = collection.find().limit(1).stream();
  	stream.on('data', function(s) { 
  		console.log(s); 
  		res.send(s); 
  	});
  });

  //res.send('<h1>Send vehicle data json</h1>');
});


io.on('connection', function (socket) {
    socket.on('vehicle_data', function(req) {
    	console.log(req.seq);
        mongo.connect(app.get('dburl'), function (err, db) {
            var stream = db.collection('vehicle_data').find({'Extra_SequenceNumber' : {$gt : parseInt(req.seq)}},{'Image_Frame' : 0}).limit(1).stream();
  	        stream.on('data', function(s) {
  	        	console.log(s);
                socket.emit('data', s);
            });
  	    });
    });
});



