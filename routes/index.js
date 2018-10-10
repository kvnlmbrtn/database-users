var express = require('express');
var request = require('request');
var mongoose = require('mongoose');
var router = express.Router();

var options = {
  server: {
    socketOptions: {
      connectTimeoutMS: 5000
    }
  }
};

// // // // // // // // // // // // // // // // // // // //
// Connection avec la base de données liée aux commandes //
// // // // // // // // // // // // // // // // // // // //

mongoose.connect('mongodb://kevin:kevin2018@ds125713.mlab.com:25713/orders', options, function(err) {
  console.log(err);
});

var orderSchema = mongoose.Schema(
  {userID: String,
  totalPrice: Number,
  shippingCosts: Number});

var orderModel = mongoose.model('orders', orderSchema);



// // // // // // // // // // // // // // // // // // // // //
// Connection avec la base de données liée aux utilisateurs //
// // // // // // // // // // // // // // // // // // // // //


mongoose.connect('mongodb://kevin:kevin2018@ds225703.mlab.com:25703/users', options, function(err) {
  console.log(err);
});

var userSchema = mongoose.Schema(
  {firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  address: String,
  zipCode: Number});

var userModel = mongoose.model('users', userSchema);



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Website Test" });
});


router.post('/userLogIn', function(req, res, next) {
  req.session.userName = req.body.userName;
  var title = "Bienvenue "+req.body.userName
  res.render('user', { userName: req.session.userName, title});
});



module.exports = router;
