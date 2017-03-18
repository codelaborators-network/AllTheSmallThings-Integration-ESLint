const request = require('request');
const linter = require('eslint').linter;
const serverUrl = 'http://abstractsausagefactory.azurewebsites.net/api/tracking/';

module.exports = (req) => {
  const fileUrl = req.fileUrl;

  console.log(`Alright bro, I'm just gonna go get ${fileUrl} real quick`);

  request.get(fileUrl, (error, response, body) => {
    if (error || response.statusCode >= 400) {
      throw new Error(`Oh crap son! We got an error on our hands getting to github man!\r\n${JSON.stringify(response)}`);
    }

    console.log(`Sweet as a nut, I got ${fileUrl}`);
    console.log(`Let's see what ESLint thinks of this bad boy`);

    const modCount = req.modCount;
    const username = req.username;

    const fileNameParts = fileUrl.split('/');
    const fileName = fileNameParts[fileNameParts.length - 1];

    const messages = linter.verify(body, {
      rules: {
        semi: 2,
      }
    }, {filename: fileName});

    if (messages.length !== 0) {
      console.log(`Dude, this file was sick! Sending points to the app server`);
      console.log(`username: ${username}`);
      console.log(`Xp: ${modCount}`);
      console.log(`integrationsProvider: 100`);
      request(
        {
          url: serverUrl,
          method: 'PUT',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            UserName: username,
            Xp: modCount,
            integrationsProvider: 100
          })
        },
        (errorFromAppServer, responseFromAppServer) => {
          if (errorFromAppServer || responseFromAppServer.statusCode >= 400) {
            throw new Error(`Oh crap son! We got an error on our hands talking to the app server man!\r\n${JSON.stringify(responseFromAppServer)}`);
          }

          console.log(responseFromAppServer.statusCode);
        });
    }
  });
};
