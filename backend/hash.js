const bcrypt = require("bcryptjs")

async function hashPassword() {

  const hashed = await bcrypt.hash(
    "Admin@123",
    10
  )

  console.log(hashed)
}

hashPassword()