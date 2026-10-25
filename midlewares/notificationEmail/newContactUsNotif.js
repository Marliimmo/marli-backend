require('dotenv').config();
const { createTransport } = require("./mailer");

// Notification nouveau message envoyer a l'admin.
function NewContactUser (titleMessage, motif, name, email, phone, contenu) {
    return new Promise((resolve, reject)=>{
        var transporter = createTransport()
        const mail_configs = {
            from: '"Marli, passeur d\'histoires immobilières" <support@marli-immobilier.com>',
            to: `${process.env.EMAIL_ADMIN}`,
            subject: `Nouveau message de ${name} (Nous contacter)`,
            // « Répondre » dans la messagerie écrit directement à l'internaute
            replyTo: email,
            html: `
                <div style="font-family: Montserrat, poppins, sans-serif">
                    <p>Titre du message : ${titleMessage}</p>
                    <p>Motif du message : ${motif}</p>
                    <p>Nom complet : ${name}</p>
                    <p>E-mail : ${email}</p>
                    <p>Téléphone : ${phone}</p>
                    <p>Contenu du message :</p>
                    <p style="white-space: pre-line;">${contenu}</p>
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
function notifForUser (email, name) {
    return new Promise((resolve, reject)=>{
        var transporter = createTransport()
        const mail_configs = {
            from: '"Marli, passeur d\'histoires immobilières" <support@marli-immobilier.com>',
            to: email,
            subject: "Marli Immobilier : nous avons bien reçu votre message",
            html: `
                <div style="font-family: Montserrat, Poppins, Arial, sans-serif; color: #222; line-height: 1.6">
                    <p>Bonjour ${name},</p>
                    <p>Merci pour votre message. Nous l'avons bien reçu et nous revenons vers vous dans les plus brefs délais.</p>
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
    notifForUser,
    NewContactUser
};