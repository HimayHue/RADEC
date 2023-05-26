const { version } = require('../../../package.json');


module.exports = (client) => {
  console.log(`\n${client.user.tag} Version ${version}  is online.\n`);
};
