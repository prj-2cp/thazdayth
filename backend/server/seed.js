//here to seed the data into the data base (the shipping rates / percentage /olive categories)

//we run this file only one time to seed the data
const mongoose = require('mongoose') ;
const dotenv = require('dotenv') ; 
const ShippingRate= require('./models/shippingRateModel') ;
const Settings = require('./models/settingsModel' ) ;
const OliveCategory = require('./models/oliveCategoryModel' ) ;
const PressingService  = require('./models/pressingServiceModel');

dotenv.config() ;

//the shipping rate by default at the begging then able to change later from the admin dashboard
const wilayas = [
    { wilaya_code: 1, wilaya: "Adrar", price: 1200 },
    { wilaya_code: 2, wilaya: "Chlef", price: 600 },
    { wilaya_code: 3, wilaya: "Laghouat", price: 900 },
    { wilaya_code: 4, wilaya: "Oum El Bouaghi", price: 700 },
    { wilaya_code: 5, wilaya: "Batna", price: 700 },
    { wilaya_code: 6, wilaya: "Béjaïa", price: 400 },
    { wilaya_code: 7, wilaya: "Biskra", price: 800 },
    { wilaya_code: 8, wilaya: "Béchar", price: 1200 },
    { wilaya_code: 9, wilaya: "Blida", price: 500 },
    { wilaya_code: 10, wilaya: "Bouira", price: 400 },
    { wilaya_code: 11, wilaya: "Tamanrasset", price: 1500 },
    { wilaya_code: 12, wilaya: "Tébessa", price: 800 },
    { wilaya_code: 13, wilaya: "Tlemcen", price: 800 },
    { wilaya_code: 14, wilaya: "Tiaret", price: 700 },
    { wilaya_code: 15, wilaya: "Tizi Ouzou", price: 300 },
    { wilaya_code: 16, wilaya: "Alger", price: 500 },
    { wilaya_code: 17, wilaya: "Djelfa", price: 800 },
    { wilaya_code: 18, wilaya: "Jijel", price: 500 },
    { wilaya_code: 19, wilaya: "Sétif", price: 600 },
    { wilaya_code: 20, wilaya: "Saïda", price: 800 },
    { wilaya_code: 21, wilaya: "Skikda", price: 600 },
    { wilaya_code: 22, wilaya: "Sidi Bel Abbès", price: 800 },
    { wilaya_code: 23, wilaya: "Annaba", price: 700 },
    { wilaya_code: 24, wilaya: "Guelma", price: 700 },
    { wilaya_code: 25, wilaya: "Constantine", price: 600 },
    { wilaya_code: 26, wilaya: "Médéa", price: 500 },
    { wilaya_code: 27, wilaya: "Mostaganem", price: 700 },
    { wilaya_code: 28, wilaya: "M'Sila", price: 700 },
    { wilaya_code: 29, wilaya: "Mascara", price: 700 },
    { wilaya_code: 30, wilaya: "Ouargla", price: 1000 },
    { wilaya_code: 31, wilaya: "Oran", price: 700 },
    { wilaya_code: 32, wilaya: "El Bayadh", price: 1000 },
    { wilaya_code: 33, wilaya: "Illizi", price: 1500 },
    { wilaya_code: 34, wilaya: "Bordj Bou Arréridj", price: 600 },
    { wilaya_code: 35, wilaya: "Boumerdès", price: 400 },
    { wilaya_code: 36, wilaya: "El Tarf", price: 700 },
    { wilaya_code: 37, wilaya: "Tindouf", price: 1500 },
    { wilaya_code: 38, wilaya: "Tissemsilt", price: 700 },
    { wilaya_code: 39, wilaya: "El Oued", price: 900 },
    { wilaya_code: 40, wilaya: "Khenchela", price: 800 },
    { wilaya_code: 41, wilaya: "Souk Ahras", price: 700 },
    { wilaya_code: 42, wilaya: "Tipaza", price: 500 },
    { wilaya_code: 43, wilaya: "Mila", price: 600 },
    { wilaya_code: 44, wilaya: "Aïn Defla", price: 600 },
    { wilaya_code: 45, wilaya: "Naâma", price: 1000 },
    { wilaya_code: 46, wilaya: "Aïn Témouchent", price: 800 },
    { wilaya_code: 47, wilaya: "Ghardaïa", price: 1000 },
    { wilaya_code: 48, wilaya: "Relizane", price: 700 },
    { wilaya_code: 49, wilaya: "El M'Ghair", price: 1000 },
    { wilaya_code: 50, wilaya: "El Meniaa", price: 1200 },
    { wilaya_code: 51, wilaya: "Ouled Djellal", price: 900 },
    { wilaya_code: 52, wilaya: "Bordj Badji Mokhtar", price: 1500 },
    { wilaya_code: 53, wilaya: "Béni Abbès", price: 1200 },
    { wilaya_code: 54, wilaya: "Timimoun", price: 1500 },
    { wilaya_code: 55, wilaya: "Touggourt", price: 1000 },
    { wilaya_code: 56, wilaya: "Djanet", price: 1500 },
    { wilaya_code: 57, wilaya: "In Salah", price: 1500 },
    { wilaya_code: 58, wilaya: "In Guezzam", price: 1500 }
];

//here the olive categories with the pricz per litter
const oliveCategories = [
    { name: 'Récolte Précoce (Vert)', price_per_liter: 1200 },
    { name: 'Récolte Standard (Noir)', price_per_liter: 800 },
    { name: 'Biologique Certifié', price_per_liter: 1500 },
];

const pressingServices = [
    { name: 'Service de Trituration (Semi-Automatique)', category: 'extra_virgin', fee: 35 },
];


async function seed() {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Shipping rates
    await ShippingRate.deleteMany({});

    await ShippingRate.insertMany(wilayas);
    console.log('Shipping rates seeded');


    // Olive Categories 
    await OliveCategory.deleteMany({});
    await OliveCategory.insertMany(oliveCategories);
    console.log('Olive categories seeded');

    // Pressing Services 
    await PressingService.deleteMany({});
    await PressingService.insertMany(pressingServices);
    console.log('Pressing services seeded');

    // Global settings
    await Settings.deleteMany({});
    await Settings.create({ pressing_percentage_taken: 30 });
    console.log(' Global settings seeded');

    await mongoose.disconnect();
    console.log(' Seeding complete!');
}

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
