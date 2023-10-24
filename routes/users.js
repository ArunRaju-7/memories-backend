import express from 'express';
import { signin, signup, googlesignin, verify_signup, forget_password , reset_password} from '../controllers/users.js';


const router = express.Router();


router.post('/signin', signin);
router.post('/signup', signup);
router.get('/:id/verify/:token', verify_signup);
router.post('/googlesigin', googlesignin);
router.get('/forget_password/:email', forget_password);
router.post('/reset_password', reset_password);

export default router;