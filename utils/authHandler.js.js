let jwt = require("jsonwebtoken");
let userModel = require("../schemas/users");

module.exports = {
  checkLogin: async function (req, res, next) {
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer")) {
      res.status(403).send("ban chua dang nhap");
      return;
    }
    token = token.split(" ")[1];
    try {
      let result = jwt.verify(token, "secret");
      if (result && result.exp * 1000 > Date.now()) {
        req.userId = result.id;
        // Lấy thông tin user và role
        let user = await userModel.findById(result.id).populate("role");
        if (!user || user.isDeleted) {
          res.status(403).send("ban chua dang nhap");
          return;
        }
        req.user = user;
        req.userRole = user.role;
        next();
      } else {
        res.status(403).send("ban chua dang nhap");
      }
    } catch (error) {
      res.status(403).send("ban chua dang nhap");
    }
  },

  checkRole: function (allowedRoles = []) {
    return async function (req, res, next) {
      if (!req.userRole) {
        return res.status(403).send("khong co quyen truy cap");
      }

      const roleName = req.userRole.name.toLowerCase();
      const method = req.method;

      // Admin có full quyền
      if (roleName === "admin") {
        return next();
      }

      // Mod chỉ có quyền đọc (GET)
      if (roleName === "mod") {
        if (method === "GET") {
          return next();
        } else {
          return res
            .status(403)
            .send("ban khong co quyen thuc hien hanh dong nay");
        }
      }

      // Các role khác
      if (allowedRoles.length === 0 || allowedRoles.includes(roleName)) {
        return next();
      }

      res.status(403).send("ban khong co quyen truy cap");
    };
  },

  checkRoleSpecific: function (allowedRoles = []) {
    return async function (req, res, next) {
      if (!req.userRole) {
        return res.status(403).send("khong co quyen truy cap");
      }

      const roleName = req.userRole.name.toLowerCase();

      // Kiểm tra xem role có trong danh sách cho phép không
      if (allowedRoles.includes(roleName)) {
        return next();
      }

      res.status(403).send("ban khong co quyen thuc hien hanh dong nay");
    };
  },
};
