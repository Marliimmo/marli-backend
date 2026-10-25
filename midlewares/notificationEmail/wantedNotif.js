require('dotenv').config();
const { createTransport } = require("./mailer");

// Notification avis de recherche a l'admin.
function wantedUser ( localisation, typeBien, superficie, pieces, budget, name, email, phone, message){
    return new Promise((resolve, reject)=>{
        var transporter = createTransport()
        const mail_configs = {
            from: '"Marli, passeur d\'histoires immobilières" <support@marli-immobilier.com>',
            to: `${process.env.EMAIL_ADMIN}`,
            subject: `Avis de recherche de ${name}`,
            // « Répondre » dans la messagerie écrit directement à l'internaute
            replyTo: email,
            html: `
                <div style="font-family: Montserrat, poppins, sans-serif">
                    <p>Emplacement / Localisation : ${localisation}</p>
                    <p>Type de bien : ${typeBien}</p>
                    <p>Superficie : ${superficie} m²</p>
                    <p>Nombre de pièces : ${pieces}</p>
                    <p>Budgets : ${budget.toLocaleString('fr-FR')} €</p>
                    <p>Nom complet : ${name}</p>
                    <p>E-mail : ${email}</p>
                    <p>Téléphone : ${phone}</p>
                    <p>Message :</p>
                    <p style="white-space: pre-line;">${message}</p>
                </div>
            `
        }
        transporter.sendMail(mail_configs, function(error, info){
            if(error){
                console.log(error);
                return reject({message: `An error has occured`});
            }
            return(resolve({message: "Email send succesfuly"}));
        })
    })
}

// Notification à envoyer à l'auteur du message.
function notifForUserWanted (email, name) {
    return new Promise((resolve, reject)=>{
        var transporter = createTransport()
        const mail_configs = {
            from: '"Marli, passeur d\'histoires immobilières" <support@marli-immobilier.com>',
            to: email,
            subject: "Marli Immobilier : nous avons bien reçu votre recherche",
            html: `
                <div style="font-family: Montserrat, Poppins, Arial, sans-serif; color: #222; line-height: 1.6">
                    <p>Bonjour ${name},</p>
                    <p>Merci pour votre avis de recherche. Nous l'avons bien reçu et nous revenons vers vous dans les plus brefs délais.</p>
                    <p>Pour toute question urgente, vous pouvez joindre Néné Mar au 06 88 74 06 21.</p>
                    <p>Ce message est envoyé automatiquement, merci de ne pas y répondre.</p>
                    <p>Marli Immobilier, passeur d'histoires immobilières<br>
                    <a href="https://marli-immobilier.com">marli-immobilier.com</a></p>
                </div>
            `
        }
        transporter.sendMail(mail_configs, function(error, info){
            if(error){
                console.log(error);
                return reject({message: `An error has occured`});
            }
            return(resolve({message: "Email send succesfuly"}));
        })
    })
}

module.exports = {
    wantedUser,
    notifForUserWanted
};