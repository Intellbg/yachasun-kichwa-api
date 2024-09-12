import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import transporter from '../../config/nodemailer.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, device, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ email: email.toLowerCase(), password, device, name });
    await user.save();
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const url = `${process.env.DOMAIN}/email-verification/${token}`;
    transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Verifica tu cuenta de Yachasun Kiwchwa',
      html: `Por favor verifica tu cuenta en el siguiente enlace: <a href="${url}">${url}</a>`
    }, (error, info) => {
      console.error(error)
      console.log(info)
    }
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message });
  }
});


router.get('/confirmation/:token', async (req, res) => {
  try {
    console.log("confirmation")
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid token' });
    }
    user.verified = true;
    await user.save();

    res.status(200).json({ msg: 'Email confirmed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });
    const token = jwt.sign({ id: user.id, app_score: user.app_score, name:user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, app_score:user.app_score });
  })(req, res, next);
});


router.post('/forgot-password', async (req, res) => {
  try{
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user){
      console.log("not found"+email)
      return res.json({ message: 'ok' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = Date.now() + 3600000; 
    user.resetToken = resetToken;
    user.resetTokenExpiration = tokenExpiration;
    await user.save();
    const resetLink = `${process.env.DOMAIN}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: `Para recuperar tu contraseña ingresa en el siguiente: <a href="${resetLink}">enlace</a></p>`,
    });
    return res.json({ message: 'ok' });
  }catch (error){
    console.error('Error in /forgot-password:', error);
    return res.json({ message: 'ok' });
  }
});


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.redirect(`/?token=${token}`);
});

export default router;
