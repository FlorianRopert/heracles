const formInputInscription = document.getElementById('form-input-inscription');

const formInscription = document.getElementsByClassName("form-inscription");
const formConnexion = document.getElementsByClassName("form-connexion");

const panel = document.getElementById('panel');
const acceuil = document.getElementById('acceuil');
// BOUTONS
const connexionBtn = document.getElementById('connexion-btn');
const inscriptionBtn = document.getElementById('inscription-btn');

const voirInscription = document.getElementById('form-btn-plus');
const voirMoinsInscription = document.getElementById('form-btn-moins');

const btnDeco = document.getElementById('deconnexion');

const modifierBtn = document.getElementById('modifier-btn');
//INPUT TEXT
const username = document.getElementById('username');
const password = document.getElementById('password');
const prenom = document.getElementById('prenom');
const nom = document.getElementById('nom');
const email = document.getElementById('email');
const inputModifierPassword = document.getElementById('input-modifier-password');


//MODIFIER TEXT
const nomUtilisateur = document.getElementById('nomUtilisateur');

// LOAD DE LA PAGE 
window.addEventListener('DOMContentLoaded', () => {


    fetch('/isConnect', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                console.log(response.message);
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'Connecté') {
                // Rafraîchir la classe depuis le serveur (plus fiable que le localStorage seul)
                localStorage.setItem('idUsers', data.idUsers);
                localStorage.setItem('login', data.login);

                //Gerer affichage
                panel.style.display = 'none';
                acceuil.style.display = 'flex';
                nomUtilisateur.innerHTML = data.login;

            } else {
                //Gerer affichage
            }
        })
        .catch(erreur => {
            console.log('Impossible de vérifier la connexion :', erreur);
            //Gerer afficahge
        });


    for (let i = 0; i < formInscription.length; i++) {
        formInscription[i].style.display = 'none';
    }


})


voirInscription.addEventListener('click', () => {

    for (let i = 0; i < formInscription.length; i++) {
        formInscription[i].style.display = 'flex';
    }

    for (let i = 0; i < formConnexion.length; i++) {
        formConnexion[i].style.display = 'none';
    }

})

voirMoinsInscription.addEventListener('click', () => {

    for (let i = 0; i < formInscription.length; i++) {
        formInscription[i].style.display = 'none';
    }

    for (let i = 0; i < formConnexion.length; i++) {
        formConnexion[i].style.display = 'flex';
    }

})

//INSCRIPTION

inscriptionBtn.addEventListener('click', () => {

    // Vérification simple côté client
    if (username.value === '') {
        alert('le username est obligatoire !');
        return;
    }

    fetch('/inscription', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nom: nom.value,
            prenom: prenom.value,
            email: email.value,
            password: password.value,
            username: username.value
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.erreur) {
                alert(data.erreur.sqlMessage); // Ex: "Mot de passe invalide" ou "Inscription reussie !"
            } else {
                alert(data.message);
                location.reload();
            }
            console.log(data);
        });
});

//CONNEXION
connexionBtn.addEventListener('click', () => {
    fetch('/connexion', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            login: username.value,
            password: password.value
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message != 'connexion reussi') { // Connexion échouée
                alert(data.message);
                console.log(data.message);
            } else { // Connexion réussie, on sauvegarde la classe dans le localStorage

                //GERER L'AFFICHAGE
                alert("T'es connecté gros");
                //Remplissage du local storage
                localStorage.setItem('idUsers', data.idUsers);
                //Mettre la page d'acceuile dans le local storage
                localStorage.setItem('login', data.login);

                ///GERER L'AFFICHAGE
                location.reload();

            }
        })
})

btnDeco.addEventListener('click', () => {
    fetch('/deconnexion', { method: 'POST' })
        .then(() => {
            location.reload();
        })
})

modifierBtn.addEventListener('click', () => {
    console.log('clicl modif');
    fetch('/modifmdp', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: inputModifierPassword.value
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.erreur) {
                alert(data.erreur.sqlMessage); // Ex: "Mot de passe invalide" ou "Inscription reussie !"
            } else {
                alert(data.message);
                location.reload();
            }
        })
})