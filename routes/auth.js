const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../model/user'); 
const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    req.session.user = newUser;
    res.render("login");
  } catch (error) {
    console.error("Error during sign up:", error.message);
    res.status(500).render("error");
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    const hash = await bcrypt.hash(password, 10);
    if (!user || !bcrypt.compare(hash, user.password)) {
      return res
        .status(401)
        .render("login", { error: "Invalid username or password" });
    }
    req.session.user = user;
    res.redirect("/items");
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).render("error");
  }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
});

module.exports = router;
