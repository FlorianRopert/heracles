const formInputInscription = document.getElementById('form-input-inscription');

const formInscription = document.getElementsByClassName("form-inscription");
const formConnexion = document.getElementsByClassName("form-connexion");


// BOUTONS
const connexionBtn = document.getElementById('connexion-btn');
const inscriptionBtn = document.getElementById('inscription-btn');

const voirInscription = document.getElementById('form-btn-plus');
const voirMoinsInscription = document.getElementById('form-btn-moins');

//INPUT TEXT
const username = document.getElementById('username');
const password = document.getElementById('password');
const prenom = document.getElementById('prenom');
const nom = document.getElementById('nom');
const email = document.getElementById('email');

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



