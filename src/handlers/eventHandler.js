const path = require('path');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (client) => {
  // Getting all folders/files in the 'events' directory
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    // Getting all files in the current event folder
    let eventFiles = getAllFiles(eventFolder);
    // Sorting the event files alphabetically
    eventFiles.sort();

    // Extracting the event name from the folder path
    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    // Registering an event listener with the client for the current event name
    client.on(eventName, async (...args) => {  // capture all arguments
      console.log(`Received ${args.length} arguments for event ${eventName}`);
      for (const eventFile of eventFiles) {
        try {
          // Importing the event function from the event file
          const eventFunction = require(eventFile);
          // Calling the event function with the client and the event arguments
          await eventFunction(client, ...args);  // pass along all arguments
        } catch (error) {
          console.error(`Error in event handler for event ${eventName}: ${error}`);
        }
      }
    });
  }
};


