const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Create the transporter using Gmail SMTP settings from .env
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: process.env.EMAIL_SECURE === "true", // Use SSL/TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendVerification(email, code) {
    try {
        const info = await transporter.sendMail({
            from: `"TAZDAYTH Huilerie" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Votre Code de Vérification - TAZDAYTH",
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Bienvenue chez TAZDAYTH</h2>
                    <p>Votre code de vérification est :</p>
                    <div style="background: #f4f4f4; padding: 20px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 10px; letter-spacing: 5px;">
                        ${code}
                    </div>
                    <p>Ce code est valable pour quelques minutes.</p>
                </div>
            `,
        });
        console.log("Email sent successfully: ", info.messageId);
    } catch (error) {
        console.error("Error sending email: ", error);
        throw new Error("Échec de l'envoi de l'email de vérification.");
    }
}

exports.sendVerification = sendVerification;