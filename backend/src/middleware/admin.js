// backend/src/middleware/admin.js
const jwt = require('jsonwebtoken');

module.exports = (prisma) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, is_active: true }
      });
      if (!user || !user.is_active) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }
      if (!['admin', 'superadmin'].includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden – Admin access required' });
      }
      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};
