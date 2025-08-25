const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validatePassword = (password) => password && password.length >= 6;

module.exports = { validateEmail, validatePassword };
