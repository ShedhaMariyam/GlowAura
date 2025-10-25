const express = require ('express')
const router = express.Router();
const userController = require('../controllers/user/userController');
console.log('userController:', userController);


router.get('/pageNotFound',userController.pageNotFound);

router.get("/",userController.loadHomepage);


module.exports = router;