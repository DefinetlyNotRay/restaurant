const bcrypt = require("bcryptjs");

const password = "admin123";
const hash = bcrypt.hashSync(password, 10);

console.log("\n=================================");
console.log("Password Hash Generator");
console.log("=================================");
console.log("Password:", password);
console.log("Hash:", hash);
console.log("\nSQL to update admin password:");
console.log(
  `UPDATE admin_users SET password_hash = '${hash}' WHERE email = 'admin@restaurant.com';`
);
console.log("=================================\n");

