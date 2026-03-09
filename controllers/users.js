let userModel = require("../schemas/users");
let bcrypt = require("bcrypt");

module.exports = {
  CreateAnUser: async function (
    username,
    password,
    email,
    role,
    avatarUrl,
    fullName,
    status,
    loginCount,
  ) {
    let newUser = new userModel({
      username: username,
      password: password,
      email: email,
      role: role,
      avatarUrl: avatarUrl,
      fullName: fullName,
      status: status,
      loginCount: loginCount,
    });
    await newUser.save();
    return newUser;
  },
  QueryByUserNameAndPassword: async function (username, password) {
    let getUser = await userModel.findOne({ username: username });
    if (!getUser) {
      return false;
    }
    return getUser;
  },
  FindUserById: async function (id) {
    return await userModel.findOne({
      _id: id,
      isDeleted: false,
    });
  },
  ChangePassword: async function (userId, oldPassword, newPassword) {
    // Tìm user theo ID
    let user = await userModel.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Kiểm tra oldPassword có đúng không
    let isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    // Cập nhật password mới (sẽ tự động hash do pre-save hook)
    user.password = newPassword;
    await user.save();

    return user;
  },
};
