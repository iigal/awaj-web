const express = require('express');
const router = express.Router();
const { allPublicComplaints,getOneComplaints,saveComplaint,login,signup,findTotal, forgotPassword,getOwnComplaints, 
    getProfile, saveComments, getComments, getComplaints, saveReplies, getAreas, reportComment,delete_account} = require('../controller/mobileController');

// router.use(express.json());
const authenticate = require('../middleware/authenticate')

router.route('/allPublicComplaints').get(allPublicComplaints);
router.route('/getOneComplaints/:id').get(getOneComplaints);
router.route('/saveComplaints').post(authenticate,saveComplaint);
router.route('/login').post(login);
router.route('/signup').post(signup);
router.route('/findTotal').get(findTotal);

router.route('/forgot-password').post(forgotPassword);
router.route('/getOwnComplaints/:id').get(getOwnComplaints);
router.route('/getProfile/:id').get(getProfile);
router.route('/saveComments').post(saveComments);
router.route('/getComments/:id').get(getComments);
router.route('/getComplaints/:id').get(getComplaints);
router.route('/saveReplies/:id').post(saveReplies);
router.route('/getAreas').get(getAreas);
router.route('/reportComment/:user/:complaint/:comment').get(reportComment);
router.route('/delete_account/:id').delete(delete_account);



module.exports = router ;