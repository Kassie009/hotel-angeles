const db = require('../Config/db');
const bcrypt = require('bcrypt');

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    verifyPassword: async (password, hash) => {
        return await bcrypt.compare(password, hash);
    }
};

module.exports = User;