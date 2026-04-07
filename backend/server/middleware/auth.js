const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Accès non autorisé. Veuillez vous \er.' });
        return;
    }
    const jwt = require("jsonwebtoken");
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.log(err) ;
        res.status(401).json({ message: 'Token invalide ou expiré. Veuillez vous reconnecter.' });
    }
};

exports.authenticate = authenticate;

const ownerOnly = (req, res, next) => {
    if (req.user?.role !== 'owner') {
        res.status(403).json({ message: 'Accès réservé au propriétaire.' });
        return;
    }
    next();
};
exports.ownerOnly = ownerOnly;