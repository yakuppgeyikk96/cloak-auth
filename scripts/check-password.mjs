import { hashPassword, verifyPassword } from "../dist/core/password.js";

const passwrd = "Qwerty123";

const hashed = await hashPassword(passwrd);

const isValidPassword = await verifyPassword(hashed, "Qwerty1233");

console.log(isValidPassword);
