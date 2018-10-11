var express = require('express');
var request = require('request');
var mongoose = require('mongoose');
var router = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

var options = {
  server: {
    socketOptions: {
      connectTimeoutMS: 5000
    }
  }
};

mongoose.connect('mongodb://kevin:kevin2018@ds225703.mlab.com:25703/users', options, function(err) {
  console.log(err);
});

// // // // // // // // // // // // // // // // // // // //
// Connection avec la base de données liée aux commandes //
// // // // // // // // // // // // // // // // // // // //

var orderSchema = mongoose.Schema(
  {pseudoUser: String,
  totalPrice: Number,
  shippingCosts: Number});

var orderModel = mongoose.model('orders', orderSchema);



// // // // // // // // // // // // // // // // // // // // //
// Connection avec la base de données liée aux utilisateurs //
// // // // // // // // // // // // // // // // // // // // //

var userSchema = mongoose.Schema(
  {firstName: String,
  lastName: String,
  pseudo: String,
  password: String,
  phoneNumber: String,
  address: String,
  zipCode: String});

var userModel = mongoose.model('users', userSchema);



// // // // // // // // // // // // // // // // // // // // // // //
// Gestion des routes et des redirections selon log in et sign up //
// // // // // // // // // // // // // // // // // // // // // // //



// Page d'accueil avec le double formulaire

router.get('/', function(req, res, next) {
  res.render('index', { title: "Website Test" });
});


// Redirection vers la page User lorsqu'on se log in


router.post('/userLogIn', function(req, res, next) {
  req.session.pseudo = req.body.pseudoLogIn;


  userModel.find( {
    pseudo: req.body.pseudoLogIn,
    password: req.body.passwordLogIn
  }, function (err, users) {
      if (users.length == 0) {
        console.log("il y a une erreur de saisie");
        res.render('logInError', {title: "Redirection"});
      }
      else {
        console.log("normalement on devrait pouvoir être redirigé");
        var title = "Welcome back "+req.session.pseudo;
        res.render('userDetails', {title, pseudo: req.session.pseudo, user: users[0]});
      }
  });
});


// // // // // // // // // // // // // // // // // // // // // //
// Redirection vers la page UserDetails lorsqu'on se sign up   //
// // // // // // // // // // // // // // // // // // // // // //


router.post('/userSignUp', function(req, res, next) {
  req.session.pseudo = req.body.pseudoSignUp;
  var title = "Bienvenue "+req.body.pseudoSignUp;

  // Ajout de l'utilisateur à la base de données

  bcrypt.hash(req.body.passwordSignUp, saltRounds, function(err, hash) {
    console.log(hash);

    var newUser = new userModel ({
      firstName: req.body.firstNameSignUp,
      lastName: req.body.lastNameSignUp,
      pseudo: req.body.pseudoSignUp,
      password: hash,
      phoneNumber: req.body.phoneNumberSignUp,
      address: req.body.addressSignUp,
      zipCode: req.body.zipCodeSignUp});

      newUser.save(
        function (error, user) {
          res.render('userDetails', {title, pseudo: req.session.pseudo, user})
        }
      );
  });
});


// // // // // // // // // // // // // // // // // // // // // // // //
// Redirection vers la page UserOrders lorsque l'on demande la page  //
// // // // // // // // // // // // // // // // // // // // // // // //

router.get('/userOrders', function(req, res, next) {

  var title = "Bienvenue "+req.session.pseudo;

  orderModel.find(
    { pseudoUser: req.session.pseudo } ,
    function (err, orders) {
        res.render('userOrders', { title, orders, pseudo: req.session.pseudo });
    }
  )
});


// // // // // // // // // // // // // // // // // // // // // // // //
// Redirection vers les détails du compte sur le lien "My Account"   //
// // // // // // // // // // // // // // // // // // // // // // // //

router.get('/myaccount', function(req, res, next) {

  var title = "Bienvenue "+req.session.pseudo;

  userModel.find(
    { pseudo: req.session.pseudo } ,
    function (err, user) {
        console.log(user);
        res.render('userDetails', { title, user: user[0], pseudo: req.session.pseudo });
    }
  )
});



// // // // // // // // // // // // // // // // // //
// Gestion de la création de commandes aléatoires  //
// // // // // // // // // // // // // // // // // //


router.get('/add-order', function(req, res, next) {

  var title = "Commandes de  "+req.session.pseudo;

  var newOrder = new orderModel ({
    pseudoUser: req.session.pseudo,
    totalPrice: Math.round(100*Math.random()),
    shippingCosts: Math.round(10*Math.random())
  });

    newOrder.save(
      function (error, order) {
        orderModel.find(
          { pseudoUser: req.session.pseudo } ,
          function (err, orders) {
              res.render('userOrders', { title, orders: orders, pseudo: req.session.pseudo });
          }
        )
      }
    );


});



// // // // // // // // // // // // // // // // // // // // // // // //
// Redirection vers la page d'accueil si déconnexion. Effacement     //
// variables de session rattachées à notre utilisateur               //
// // // // // // // // // // // // // // // // // // // // // // // //


router.get('/logout', function(req, res, next) {
  if (req.session) {
    console.log("Le pseudo connecté est : "+req.session.pseudo);
    // Suppression de tous les objets liés à notre variable de session
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        res.render('index', { });
      }
    });
  }
});



module.exports = router;
