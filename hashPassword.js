import bcrypt from "bcryptjs";

const pwd = process.argv[2];

async function main() {
  if (!pwd) {
    console.error("Kullanım: node hashPassword.js <şifre>");
    process.exit(1);
  }
  const hash = await bcrypt.hash(pwd, 10);
  console.log(hash);
}

main();
