const formInputInscription = document.getElementById('form-input-inscription');

const formInscription = document.getElementsByClassName("form-inscription");
const formConnexion = document.getElementsByClassName("form-connexion");

const panel = document.getElementById('panel');
const acceuil = document.getElementById('acceuil');
const panelUsers = document.getElementById('panel-users');
//const usersListe = document.getElementById('users');
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

//FONCTION
function affichageUsers(users, data) {
    //console.log(users);
    if (document.getElementById('users') == null) {

    } else {
        document.getElementById('users').remove();
    }
    const usersListe = document.createElement('ul');
    usersListe.id = 'users';
    users.forEach(element => {
        if (data.login == element.login) return;//Eviter d'afficher ses propres infos

        //console.log(element);
        //usersListe
        //users

        const li = document.createElement('li');
        const ul = document.createElement('ul');
        const id = document.createElement('li');
        const nom = document.createElement('li');
        const prenom = document.createElement('li');
        const login = document.createElement('li');

        const suppBtn = document.createElement('input');
        suppBtn.type = 'button';
        suppBtn.value = 'supp';
        suppBtn.addEventListener('click', () => {

            fetch('/suppression', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: element.id })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message == 'ok') {
                        isConnect();
                    }
                })

        })

        const powerBtn = document.createElement('input');
        powerBtn.type = 'button';
        powerBtn.addEventListener('click', () => {
            let status = 0;

            if (element.admin == 1) {
                status = 0;
            } else if (element.admin == 0) {
                status = 1;
            } else {
                status = 0;
            }

            fetch('/modification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: element.id, status: status })
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message);
                    if (data.message == "ok") {
                        isConnect();
                    }
                })

        })

        id.innerHTML = element.id;
        nom.innerHTML = element.nom;
        prenom.innerHTML = element.prenom;
        login.innerHTML = element.login;

        ul.appendChild(id);
        ul.appendChild(nom);
        ul.appendChild(prenom);
        ul.appendChild(login);

        ul.appendChild(suppBtn);
        if (element.admin == 1) {
            powerBtn.value = 'rétrograder';
        } else if (element.admin == 0) {
            powerBtn.value = 'promouvoir';
        }
        ul.appendChild(powerBtn);

        li.appendChild(ul);

        usersListe.appendChild(li);
    });
    panelUsers.appendChild(usersListe);
}

function isConnect() {
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
                localStorage.setItem('admin', data.admin);

                //Gerer affichage
                panel.style.display = 'none';
                acceuil.style.display = 'flex';
                nomUtilisateur.innerHTML = data.login;

                if (data.admin == 1) {
                    affichageUsers(data.results, data);
                } else {
                    panelUsers.style.display = 'none';
                }

            } else {
                //Gerer affichage
            }
        })
        .catch(erreur => {
            console.log('Impossible de vérifier la connexion :', erreur);
            //Gerer afficahge
        });
}

// LOAD DE LA PAGE 
window.addEventListener('DOMContentLoaded', () => {

    isConnect();

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
    console.log('clic modif');
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