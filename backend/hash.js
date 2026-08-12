const bcrypt = require("bcryptjs")

async function hashPassword() {

  const hashed = await bcrypt.hash(
    "********",
    10
  )

  console.log(hashed)
}

hashPassword()
