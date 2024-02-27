function requireLogin(req, res, next) {
    if (!req.session.userId) {
      res.redirect('/login');
    } else {
      next();
    }
  }
  
  function requireRole(role) {
    return (req, res, next) => {
      if (req.session.role !== role) {
        res.status(403).send('Not authorized');
      } else {
        next();
      }
    };
  }
  
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.redirect('/items');
  }
};

module.exports = { requireLogin, requireRole, isAdmin };
  