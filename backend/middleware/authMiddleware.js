import jwt from "jsonwebtoken";
export const protect = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
    return res.redirect("/login");
}
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
    return res.redirect("/login");
}
};