//.env
require('dotenv').config();

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');//POUR HASH
const mysql = require('mysql2');//Mysql
//Token
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.static('html')); //Selection du dossier html
app.use(express.json()); //Sert a utiliser json

//Connexion a la base de donner
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connecté à la base de données MySQL.');
});

//Lire sur le port 3000
app.listen(3000, () => {
  console.log('Server is running on :3000');
})

//Gestion Inscription Utilisateur
app.post('/inscription', (req, res) => {
  //console.log(req.body);
  //Verification insertion
  if (req.body.password.length < 8) {
    res.json({ message: 'Mot de passe invalide', error: "length" });
    return;
  }
  if (!/[A-Z]/.test(req.body.password)) {
    res.json({ message: 'Mot de passe invalide', error: "Majuscule" });
    return;
  }
  if (!/[a-z]/.test(req.body.password)) {
    res.json({ message: 'Mot de passe invalide', error: "Minuscule" });
    return;
  }
  if (!/[0-9]/.test(req.body.password)) {
    res.json({ message: 'Mot de passe invalide', error: "Chiffre" });
    return;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(req.body.password)) {
    res.json({ message: 'Mot de passe invalide', error: "Carractère spécial" });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    res.json({ message: 'Email invalide' });
    return;
  }

  //Hachage mot de passe 
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      //Insertion dans la base
      connection.query(
        'INSERT INTO User(nom,prenom,mail,password,login,admin) VALUES(?,?,?,?,?,false)',
        [req.body.nom, req.body.prenom, req.body.email, hash, req.body.username],
        (err, results) => {
          if (err) {
            console.log('Erreur Insertion dans la base ' + err);
            res.status(500).json({ message: 'Erreur bdd insertion', erreur: err });
            return;
          }
          console.log('Insertion réussi');
          res.json({ message: 'Inscription reussie !' });
        }
      )
    })

})

//CONNEXION
app.post('/connexion', (req, res) => {
  //console.log(req.body);

  //Récupération password dans la base pour la comparaison
  connection.query(
    'SELECT password,id,login FROM User WHERE login = ?',
    [req.body.login], (err, results) => {
      if (err) {
        console.log("Erreur récupération login " + err);
        return;
      }
      if (results.length == 0) {
        console.log("Erreur identifiant");
        res.json({ message: 'Identifiant ou mot de passe invalides' });
        return;
      }
      //console.log(results[0]);
      //res.json({ message: 'login trouvé' });
      let resultat = results[0];
      bcrypt.compare(req.body.password, resultat.password, (err, results) => {
        if (err) {
          console.log('Erreur compare' + err);
          res.json({ message: 'err hash' });
          return;
        }
        if (results) {
          console.log('Connexion réussi id : ' + resultat.id + ' Login : ' + resultat.login);

          //Creation du token
          const token = jwt.sign(
            { id: resultat.id, login: resultat.login },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
          );

          res.cookie('authtoken', token, {
            httpOnly: true, //empêche le JavaScript d'accéder au cookie, donc protège contre le XSS
            secure: false, // force le cookie à passer uniquement en HTTPS si true                         !!! attention à mettre true en production !!!
            sameSite: 'strict', //protège contre les attaques CSRF.
            maxAge: 30 * 24 * 60 * 60 * 1000
            //maxAge : 10 * 1000
          })

          res.json({ message: "connexion reussi", login: resultat.login, idUsers: resultat.id });


        } else {
          res.json({ message: 'connexion echoué' });
          return;
        }
      })
    }
  )
})


//Vérifie si il est connecté
app.post('/isConnect', verifToken, (req, res) => {

})

//Verification token
function verifToken(req, res, next) {
}

app.post('/deconnexion', verifToken, (req, res) => {

})

//Route pour la suppression du compte (uniquement pour les admin)
app.post('/suppression', verifToken, (req, res) => {

})

//route pour la modification du compte (uniquement pour les admin)
app.post('/modification', verifToken, (req, res) => {

})
