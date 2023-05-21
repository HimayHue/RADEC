require("dotenv").config();

module.exports = (client) => {
  console.log(`\nVersion ${process.env.VERSION} ${client.user.tag} is online.\n`);
};
