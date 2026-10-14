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
  if ([req.body.nom, req.body.prenom, req.body.email, req.body.username, req.body.password].some(v => typeof v !== 'string' || !v.trim())) {
    return res.status(400).json({ message: 'Champs invalides ou manquants' });
  }
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
   if (/[!@#$%^&*(),.?":{}|<>]/.test(req.body.nom) || /[!@#$%^&*(),.?":{}|<>]/.test(req.body.prenom) || /[!@#$%^&*(),.?":{}|<>]/.test(req.body.username)) {
    res.json({ message: 'il ne faut pas de caractere speciaux dans le login /prenom /nom', error: "Carractère spécial" });
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
          if (rows.length > 0) {
            return res.status(409).json({ message: 'Ce login est déjà utilisé' });
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
    'SELECT password,id,login,admin FROM User WHERE login = ?',
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
            { id: resultat.id, login: resultat.login, admin: resultat.admin },
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

function infoUsers(res, req) {
  connection.query(
    'SELECT id,nom,prenom,login,admin FROM User', (err, results) => {
      if (err) {
        console.log("Erreur récupération login " + err);
        return;
      }
      if (results.length == 0) {
        console.log("Erreur récup users");
        res.json({ message: 'Erreur récup users' });
        return;
      }

      res.json({ message: "Connecté", login: req.user.login, admin: req.user.admin, results: results });
    }
  )
}

//Vérifie si il est connecté
app.post('/isConnect', verifToken, (req, res) => {
  console.log('Déjà connecté id : ' + req.user.id + ' login : ' + req.user.login + ' admin : ' + req.user.admin);
  if (req.user.admin == 1) {
    infoUsers(res, req);
  } else if (req.user.admin == 0) {
    res.json({ message: 'Connecté', login: req.user.login, admin: req.user.admin });

  } else {
    res.json({ message: "Erreur Admin identification", login: req.user.login });
  }
})


//Verification token
function verifToken(req, res, next) {
  const token = req.cookies.authtoken;

  if (!token) {
    return res.status(401).json({ message: 'Non connecté' });
  }

  //test si le token est valide
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('authtoken');
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}
function isAdmin(id){
  connection.query(
      'SELECT id,admin FROM User WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.log("Erreur récupération de l'admin " + err);
          return;
        }
        if (results.admin == 0) {
          return false;
        }
        if (results.admin == 1) {
          return true;
        } 
     }
  )
}
app.post('/deconnexion', verifToken, (req, res) => {
  res.clearCookie('authtoken');
  console.log("l'id " + req.user.id + " se déco");
  res.json({ message: 'Déconnecté' });
});

//Route pour la suppression du compte (uniquement pour les admin)
app.post('/suppression', verifToken, (req, res) => {

  if (isAdmin(req.user.id) === true) {
    connection.query(
      'DELETE FROM User WHERE id = ? ',
      [req.body.id], (err) => {
        if (err) { res.json({ message: 'Erreur SQL ' + err }); return; }
        res.json({ message: 'ok' });
      }
    )
  } else if (isAdmin(req.user.id) === false) {
    res.json({ message: "Ne prend pas tes reves pour une réalité, t'es pas admin" });
  }

})

//route pour la modification du compte (uniquement pour les admin)
app.post('/modification', verifToken, (req, res) => {
  if (isAdmin(req.user.id) === true) {
    connection.query(
      'UPDATE User SET admin = ? WHERE id = ? ',
      [req.body.status, req.body.id], (err, results) => {
        if (err) {
          console.log("Erreur " + err);
          return;
        }
        if (results) {
          res.json({message : "ok"});
        }
      }
    )
  } else if (isAdmin(req.user.id) === false) {
    res.json({ message: "Ne prend pas tes reves pour une réalité, t'es pas admin" });
  }
})

//Route pour modifier le mot de passe du compte 
app.post('/modifmdp', verifToken, (req, res) => {

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

  //Hachage mot de passe 
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      //Insertion dans la base
      connection.query(
        'UPDATE User SET password = ? WHERE id = ? ',
        [hash, req.user.id],
        (err, results) => {
          if (err) {
            console.log('Erreur Update dans la base ' + err);
            res.status(500).json({ message: 'Erreur bdd update', erreur: err });
            return;
          }
          console.log('Modification reussi');
          res.json({ message: 'Modification reussi !' });
        }
      )
    })
})