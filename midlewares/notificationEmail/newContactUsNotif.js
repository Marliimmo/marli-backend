require('dotenv').config();
const { createTransport } = require("./mailer");

// Notification nouveau message envoyer a l'admin.
function NewContactUser (titleMessage, motif, name, email, phone, contenu) {
    return new Promise((resolve, reject)=>{
        var transporter = createTransport()
        const mail_configs = {
            from: '"Marli, passeur d\'histoires immobilières" <support@marli-immobilier.com>',
            to: `${process.env.EMAIL_ADMIN}`,
            subject: `Nouveau mail nous-contacter`,
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
            subject: "no-reply",
            html: `
                <div style="font-family: Montserrat, poppins, sans-serif">
                    <p>Bonjour ${name}</p>

                    <p>Nous vous confirmons avoir bien reçu votre mail, nous prendons contact avec vous dans un plus bref délais.</p>
                    <p>Ceci est un mail automatique, merci de ne pas y répondre.</p>

                    <p>Marli - Passeur d'histoire immobilières</p>
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