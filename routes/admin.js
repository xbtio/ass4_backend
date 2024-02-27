const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/user'); 
const Item = require('../model/item');
const bcrypt = require('bcrypt');

const mongoUri = 'mongodb+srv://yernar:thyfh123@cluster0.uey4bw8.mongodb.net/';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
      next();
    } else {
      res.redirect('/items');
    }
  };

router.get("/admin", isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        const items = await Item.find();
        res.render("admin", { users: users, items: items });
    } catch (error) {
        console.error("Error retrieving users:", error.message);
        res.status(500).render("error");
    }
});

router.post("/admin/user/add", async (req, res) => {
const { username, password, isAdmin } = req.body;
try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, isAdmin });
    await newUser.save();
    res.redirect("/admin");
} catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).render("error");
}
});

router.get("/admin/user/edit/:userId", async (req, res) => {
const { userId } = req.params;
try {
    const user = await User.findById(userId);
    if (!user) {
    return res.status(404).render("error", { message: "User not found" });
    }
    res.render("edit_user", { user: user });
} catch (error) {
    console.error("Error retrieving user for editing:", error.message);
    res.status(500).render("error");
}
});

router.post("/admin/user/edit/:userId", async (req, res) => {
const { username, password, isAdmin } = req.body;
const { userId } = req.params;
try {
    const user = await User.findById(userId);
    if (!user) {
    return res.status(404).render("error", { message: "User not found" });
    }
    user.username = username;
    user.password = await bcrypt.hash(password, 10);
    user.isAdmin = isAdmin;
    user.updatedAt = Date.now();
    await user.save();
    res.redirect("/admin");
} catch (error) {
    console.error("Error editing user:", error.message);
    res.status(500).render("error");
}
});

router.post("/admin/user/delete/:userId", async (req, res) => {
const { userId } = req.params;
try {
    await User.findByIdAndDelete(userId);
    res.redirect("/admin");
} catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).render("error");
}
});


router.post("/admin/item/add", async (req, res) => {
    try {
      const {
        itemName,
        itemNameLocalized,
        description,
        descriptionLocalized,
        image1,
        image2,
        image3,
      } = req.body;
      const newItem = new Item({
        itemName,
        itemNameLocalized,
        description,
        descriptionLocalized,
        image1,
        image2,
        image3,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await newItem.save();
      res.redirect("/admin");
    } catch (error) {
      console.error("Error adding item:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
router.get("/admin/item/edit/:itemId", async (req, res) => {
const { itemId } = req.params;
try {
    const item = await Item.findById(itemId);
    if (!item) {
    return res.status(404).render("error", { message: "Item not found" });
    }
    res.render("edit_item", { item: item });
} catch (error) {
    console.error("Error retrieving item for editing:", error.message);
    res.status(500).render("error");
}
});

router.post("/admin/item/edit/:itemId", async (req, res) => {
const {
    itemName,
    itemNameLocalized,
    description,
    descriptionLocalized,
    image1,
    image2,
    image3,
} = req.body;
const { itemId } = req.params;
try {
    const item = await Item.findById(itemId);
    if (!item) {
    return res.status(404).render("error", { message: "Item not found" });
    }
    item.itemName = itemName;
    item.itemNameLocalized = itemNameLocalized;
    item.description = description;
    item.descriptionLocalized = descriptionLocalized;
    item.image1 = image1;
    item.image2 = image2;
    item.image3 = image3;
    item.updatedAt = Date.now();
    await item.save();
    res.redirect("/items");
} catch (error) {
    console.error("Error editing item:", error.message);
    res.status(500).render("error");
}
});

router.post("/admin/item/delete/:id", async (req, res) => {
try {
    const itemId = req.params.id;
    await Item.findByIdAndDelete(itemId);
    res.redirect("/admin");
} catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).send("Internal Server Error");
}
});


module.exports = router;
