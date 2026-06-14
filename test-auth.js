const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testBcrypt() {
  try {
    const password = 'student123';
    const hash = '$2b$12$Hrc3Yq2OuFaVELafDvXEMe0/tYAZv35k.r/c1Q.t4XHKdu8gIKVeK';
    console.log("Hashing...");
    const isValid = await bcrypt.compare(password, hash);
    console.log("Is valid:", isValid);
  } catch (e) {
    console.error("Bcrypt Error:", e);
  }
}

testBcrypt();
