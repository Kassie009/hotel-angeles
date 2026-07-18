const bcrypt = require('bcryptjs');

const password = '123456';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('Contraseña:', password);
    console.log('Hash generado:', hash);
});