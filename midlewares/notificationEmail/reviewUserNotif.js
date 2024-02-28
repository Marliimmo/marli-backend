require('dotenv').config();
const nodemailer = require("nodemailer");

// Notification nouveau avis client a l'admin.
function reviewUserNotif ( pseudo, stars, description){
    return new Promise((resolve, reject)=>{
        var transporter = nodemailer.createTransport({
            host: 'mail54.lwspanel.com',
            port: 465,
            secure: true,
            auth:{
                user: `${process.env.SEND_MAIL_USER}`,
                pass: `${process.env.SEND_MAIL_PASSWORD}`
            }
        })
        const mail_configs = {
            from: '"Marli - Passeur d\'histoire immobilières" <support@marli-immobilier.com>',
            to: `${process.env.EMAIL_ADMIN}`,
            subject: `Nouveau avis client`,
            html: `
                <div style="font-family: Montserrat, poppins, sans-serif">
                    <p>Nombre d'étoiles : ${stars}</p>
                    <p>Pseudo / Nom : ${pseudo}</p>
                    <p>Description : ${description}</p>
                    <br/>
                    <p>Connectez vous au dashboard pour valider l'avis.</p>
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
    reviewUserNotif
};