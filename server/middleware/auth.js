import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('marina');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Role '${req.user.role}' not authorized` });
  }
  next();
};

export const marinaAccess = (req, res, next) => {
  const marinaId = req.params.marinaId || req.body.marina || req.query.marina;
  if (req.user.role === 'owner' || req.user.marina?._id?.toString() === marinaId?.toString() || req.user.marina?.toString() === marinaId?.toString()) {
    return next();
  }
  if (!marinaId && req.user.marina) {
    return next();
  }
  return res.status(403).json({ message: 'No access to this marina' });
};
