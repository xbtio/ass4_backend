const express = require('express');
const axios = require('axios');

const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth'); 
const productsRouter = require('./routes/kaspi');
const adminRouter = require('./routes/admin');
const User = require('./model/user'); 
const Item = require('./model/item');
const isAdmin = require('./middleware/authmiddlware');


// MongoDB URI
const mongoUri = 'mongodb+srv://yernar:thyfh123@cluster0.uey4bw8.mongodb.net/';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');


// Session configuration
app.use(session({
  secret: 'supersecretkey', 
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: mongoUri }),
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } 
}));

// Use the routes
app.use(authRoutes);
app.use(productsRouter);
app.use(adminRouter);

app.get('/', (req, res) => {
  res.redirect('login')
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get("/items", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  try {
    const items = await Item.find();
    res.render("main", { items: items });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).send("Internal Server Error");
  }
});


const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
