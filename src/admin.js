//This file is not used for anything but includes some code that may be useful later


const express = require('express');
const collection = require('./mongodb');
const router = express.Router();

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).send('Access denied');
}

// route to display users
router.get('/admin', isAdmin, async (req, res) => {
  try {
    const users = await collection.find();
    res.render('admin', { users }); // Render the admin page with the list of users
  } catch (err) {
    res.status(500).send('Error fetching users');
  }
});

//  route to edit a user
router.get('/admin/edit/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render('edit-user', { user }); // Render the edit page for a specific user
  } catch (err) {
    res.status(500).send('Error fetching user data');
  }
});

//  route to update a user
router.post('/admin/edit/:id', isAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      username: req.body.username,
      password: req.body.password, // Ensure to hash the password if updating it
    }, { new: true });

    res.redirect('/admin'); // Redirect back to the admin page
  } catch (err) {
    res.status(500).send('Error updating user');
  }
});

//  route to delete a user
router.post('/admin/delete/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin'); // Redirect to the admin page after deletion
  } catch (err) {
    res.status(500).send('Error deleting user');
  }
});

module.exports = router;


const bcrypt = require('bcrypt');

router.post('/admin/edit/:id', isAdmin, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      username: req.body.username,
      password: hashedPassword, // Save the hashed password
    }, { new: true });

    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Error updating user');
  }
});
