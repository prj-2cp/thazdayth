const express = require("express") ;
const User = require("../models/userModel") ;
const auth = require("../middleware/auth");
const router = express.Router() ;

//here we get the list of the customers only for the owner 
router.get('/',auth.authenticate,auth.ownerOnly,async(req,res)/*the request will pass first from authen the only owner then the async function  */ =>{
    try{
        const user = await User.find({role:'customer'})
        .select('first_name last_name email phone address is_blacklisted created_at')//here we select only the fields we want to print ,for ex the pw no 
        .sort({created_at : -1 }) ;//we print the list from the recent client to the oldest
        res.json(user) ;//we print the list of users 
    }catch(error){
        console.error('Error fetching users : ' , error ) ;
        res.status(500).json({message : 'Erreur serveur '}) ;
    } 
});

//here the owner can block or unblock a customr
router.patch('/:id/blacklist',auth.authenticate,auth.ownerOnly,async(req,res) => {
//we used patch because we change only one field
    try{
        const user = await User.findById(req.params.id);//we find the user by his id 

        if (!user) { // if that id is not found we say 
            res.status(404).json({message : 'Utilisateur non trouvé.'}) ;
            return ;
        }

        //here's the toggle logic 
        user.is_blacklisted = !user.is_blacklisted  ;
        await user.save() ;//we save the new status
        //return the new status
        res.json({is_blacklisted : user.is_blacklisted }) ;
    } catch(error) {
        console.log(error) ;
        console.error('Error toggling blacklist status: ' , error) ;
        res.status(500).json({message : 'Erreur serveur '}) ;
    }
}) ;
exports.default = router ;