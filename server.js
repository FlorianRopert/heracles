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

})
bcrypt.hash(req.body.password, 10)
    .then(hash => {

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
