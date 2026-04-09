const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

//this creats the transporter that with use our email to send codes to the users
//we creat this transporter ones we use every time
let transporter = null;
async function getTransporter() {
    if (transporter) return transporter;

    const hasRealCredentials =
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS;

    if (hasRealCredentials) {
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: (process.env.EMAIL_PASS || '').trim(),
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        console.log('[MAIL] Secure SMTP Transporter initialized:', process.env.EMAIL_USER);
    } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log('\n[MAIL] Mode TEST activé (Ethereal Email)');
        console.log(`   Compte: ${testAccount.user}\n`);
    }

    return transporter;
}

/**
 * Sends a professional welcome email to new users.
 */
const sendWelcomeEmail = async (email, name) => {
    const adminEmail = (process.env.ADMIN_EMAIL || 'thazdaythhuilerie@gmail.com').toLowerCase();
    if (email.toLowerCase() === adminEmail) {
        console.log(`[MAIL] Skipping welcome email for admin: ${email}`);
        return;
    }

    console.log(`[MAIL] Sending welcome email to: ${email}...`);
    const transport = await getTransporter();

    const mailOptions = {
        from: `"Huilerie TAZDAYTH" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Bienvenue chez TAZDAYTH ! 🌿',
        attachments: [{
            filename: 'logo.png',
            path: path.join(__dirname, '../../../public/logo.png'),
            cid: 'tazdayth_logo'
        }],
        html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="color-scheme" content="light only">
                <meta name="supported-color-schemes" content="light">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
                    :root {
                        color-scheme: light;
                        supported-color-schemes: light;
                    }
                </style>
            </head>
            <body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: 'DM Sans', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background: linear-gradient(#f1ece3, #f1ece3); border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(41, 20, 0, 0.04);">
                    
                    <tr>
                        <td style="padding-top: 40px;"></td>
                    </tr>

                    <tr>
                        <td style="text-align: center; padding: 0 40px;">
                            <img src="cid:tazdayth_logo" alt="TAZDAYTH" style="max-width: 160px; height: auto; display: block; margin: 0 auto;" />
                            <div style="width: 40px; height: 2px; background-color: #f5da78; margin: 25px auto 15px auto;"></div>
                            <p style="margin: 0; color: #8a7d6d; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;">
                                L'excellence de Kabylie
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 50px 20px; text-align: center;">
                            <h1 style="margin: 0 0 20px; color: #291400; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                Bienvenue, ${name}.
                            </h1>
                            <p style="margin: 0; color: #5c4e3d; font-size: 16px; line-height: 1.8; font-weight: 400;">
                                Nous sommes honorés de vous compter parmi nos membres privilégiés. 
                                Votre espace d'exception est désormais actif.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 10px 50px 30px;">
                            <div style="background-color: #ffffff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 15px rgba(41, 20, 0, 0.02);">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="padding-bottom: 12px;">
                                            <span style="color: #6f8d20; font-size: 18px; margin-right: 10px;">✦</span>
                                            <span style="color: #291400; font-size: 15px; font-weight: 500;">Boutique en ligne artisanale</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 12px;">
                                            <span style="color: #6f8d20; font-size: 18px; margin-right: 10px;">✦</span>
                                            <span style="color: #291400; font-size: 15px; font-weight: 500;">Réservation de trituration</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span style="color: #6f8d20; font-size: 18px; margin-right: 10px;">✦</span>
                                            <span style="color: #291400; font-size: 15px; font-weight: 500;">Suivi de livraison en temps réel</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="text-align: center; padding: 10px 50px 40px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                               style="display: inline-block; background-color: #6f8d20; color: #ffffff; padding: 16px 42px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                                Découvrir TAZDAYTH
                            </a>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #e8dfcf; padding: 30px 40px; text-align: center;">
                            <p style="margin: 0 0 8px; color: #291400; font-size: 14px; font-weight: 700;">
                                Pure. Artisanale. Authentique.
                            </p>
                            <p style="margin: 0; color: #786a58; font-size: 12px; line-height: 1.6;">
                                © ${new Date().getFullYear()} TAZDAYTH. Tous droits réservés.<br>
                                Cet e-mail est généré automatiquement.
                            </p>
                        </td>
                    </tr>

                </table>
                
                <div style="text-align: center; padding-top: 20px;">
                    <p style="color: #a89a87; font-size: 11px;">
                        Pour vous désabonner, veuillez configurer vos préférences sur le site.
                    </p>
                </div>

            </body>
            </html>
        `,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        logEmailSent(email, info);
    } catch (error) {
        console.error(`[MAIL] Échec d'envoi à ${email}:`, error.message);
    }
};

/**
 * Sends password reset codes.
 */
const sendResetEmail = async (email, code) => {
    const transport = await getTransporter();

    const mailOptions = {
        from: `"Sécurité TAZDAYTH" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - TAZDAYTH',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');</style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1ece3; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; color: #291400;">
                <div style="max-width: 500px; margin: 50px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(41, 20, 0, 0.05);">
                    <div style="padding: 40px 30px; text-align: center;">
                        <h2 style="margin: 0 0 10px; color: #6f8d20; font-size: 18px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                            Sécurité TAZDAYTH
                        </h2>
                        <h1 style="color: #291400; font-size: 24px; margin: 0 0 15px; font-weight: 700;">Code de connexion</h1>
                        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
                            Veuillez utiliser ce code pour vérifier votre identité :
                        </p>
                        
                        <div style="background-color: #f1ece3; border: 2px solid #f5da78; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                            <span style="font-size: 40px; font-weight: 700; letter-spacing: 10px; color: #6f8d20;">
                                ${code}
                            </span>
                        </div>
                        
                        <p style="color: #6d6459; font-size: 13px; margin: 0;">
                            Ce code expirera dans <strong>15 minutes</strong>.<br>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        logEmailSent(email, info);
    } catch (error) {
        console.error(`[MAIL] Échec d'envoi reset:`, error.message);
        throw error;
    }
};

/**
 * Sends platform notifications (Orders, Status updates).
 */
const sendNotificationEmail = async (to, title, message) => {
    const transport = await getTransporter();

    const mailOptions = {
        from: `"Notifications TAZDAYTH" <${process.env.EMAIL_USER}>`,
        to,
        subject: title,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4a6741; border-bottom: 2px solid #f9f9f9; padding-bottom: 10px;">${title}</h2>
                <p style="line-height: 1.6; color: #333; font-size: 16px;">${message}</p>
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/suivi" style="color: #4a6741; font-weight: bold; text-decoration: underline;">Voir les détails sur mon compte</a>
                </div>
            </div>
        `,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        logEmailSent(to, info);
    } catch (error) {
        console.error(`[MAIL] Échec d'envoi notification:`, error.message);
    }
};

/**
 * Sends a detailed order confirmation/receipt.
 */
const sendOrderConfirmationEmail = async (email, orderData) => {
    const transport = await getTransporter();

    const itemsHtml = orderData.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.subtotal} DA</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"Boutique TAZDAYTH" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Confirmation de commande #${orderData.tracking_code} 🌿`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4a6741;">Merci pour votre commande !</h2>
                <p>Nous avons bien reçu votre commande <strong>#${orderData.tracking_code}</strong>.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #f9f9f9;">
                            <th style="padding: 10px; text-align: left;">Article</th>
                            <th style="padding: 10px; text-align: center;">Qté</th>
                            <th style="padding: 10px; text-align: right;">Prix</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 10px; font-weight: bold; text-align: right;">Total</td>
                            <td style="padding: 10px; font-weight: bold; text-align: right; color: #4a6741; font-size: 18px;">${orderData.total_price} DA</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="background-color: #fcfcfc; padding: 15px; border-radius: 8px; border-left: 4px solid #4a6741; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Code de suivi :</strong> ${orderData.tracking_code}</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Utilisez ce code pour suivre l'état de votre livraison sur notre site.</p>
                </div>

                <p style="font-size: 14px; color: #888;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            </div>
        `,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        logEmailSent(email, info);
    } catch (error) {
        console.error(`[MAIL] Échec d'envoi confirmation commande:`, error.message);
    }
};

/**
 * Sends a confirmation for olive pressing requests.
 */
const sendPressingConfirmationEmail = async (email, data) => {
    const transport = await getTransporter();

    const mailOptions = {
        from: `"Moulin TAZDAYTH" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Demande de pressage reçue #${data.tracking_code} `,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4a6741;">Demande de pressage enregistrée</h2>
                <p>Votre demande pour le pressage de <strong>${data.quantity} kg</strong> d'olives a été reçue.</p>
                
                <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                    <p style="margin: 0;"><strong>Référence :</strong> #${data.tracking_code}</p>
                    <p style="margin: 10px 0;"><strong>Qualité visée :</strong> ${data.quality === 'extra_virgin' ? 'Extra Vierge' : 'Vierge'}</p>
                </div>

                <p>Un administrateur va examiner votre demande et vous proposera prochainement une date pour apporter vos olives au moulin.</p>
                
                <p style="font-size: 14px; color: #888;">Vous recevrez une notification dès qu'un créneau sera disponible.</p>
            </div>
        `,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        logEmailSent(email, info);
    } catch (error) {
        console.error(`[MAIL] Échec d'envoi confirmation pressage:`, error.message);
    }
};

const logEmailSent = (email, info) => {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log(`[MAIL] Aperçu (Test): ${previewUrl}`);
    } else {
        console.log(`[MAIL] Email envoyé avec succès à: ${email}`);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendResetEmail,
    sendNotificationEmail,
    sendOrderConfirmationEmail,
    sendPressingConfirmationEmail,
};