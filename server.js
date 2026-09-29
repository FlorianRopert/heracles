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
