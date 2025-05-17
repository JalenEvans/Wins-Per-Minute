import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.sendStatus(401).json({ error: 'Token not required' });

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) return res.sendStatus(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}