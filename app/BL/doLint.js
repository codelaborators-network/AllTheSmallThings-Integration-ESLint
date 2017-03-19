const request = require('request');
const linter = require('eslint').linter;
const serverUrl = 'http://abstractsausagefactory.azurewebsites.net/api/tracking/';

const integrationsProvider = 100;
const ADD_EVENT = 100;
const REMOVE_EVENT = 200;

module.exports = (req) => {
  console.log('request', req);

  const payload = {
    UserName: '',
    Xp: 0,
    integrationsProvider: integrationsProvider
  };

  const gitHubGets = [];

  req.forEach((file) => {
    const fileUrl = file.fileUrl;
    console.log(`Alright bro, I'm just gonna go get ${fileUrl} real quick`);

    gitHubGets.push(
      new Promise((resolve) => {
        request.get(fileUrl, (error, response, body) => {
          if (error || response.statusCode >= 400) {
            console.error(`Oh crap son! We got an error on our hands getting to github man!\r\n${JSON.stringify(response)}`);
            resolve();
            return;
          }

          console.log(`Sweet as a nut, I got ${fileUrl}`);
          console.log(`Let's see what ESLint thinks of this bad boy`);

          const fileNameParts = fileUrl.split('/');
          const fileName = fileNameParts[fileNameParts.length - 1];

          const messages = linter.verify(body, {
            rules: {
              semi: 2,
            }
          }, {filename: fileName});

          console.log('username', file.username);
          payload.UserName = file.username;

          if (messages.length === 0) {
            const xpDiff = parseInt(file.modCount);
            payload.Xp += !isNaN(xpDiff) ? xpDiff : 0;
          } else {
            console.log(`${fileName} Failed linting, no points for you!!`);
          }

          resolve();
        });
      })
    );
  });

  Promise.all(gitHubGets).then(() => {
    console.log(`Dude, these files were sick! Sending points to the app server`);

    payload.actionType = payload.Xp >= 0 ? ADD_EVENT : REMOVE_EVENT;
    payload.Xp = Math.abs(payload.Xp);

    console.log(`username: ${payload.UserName}`);
    console.log(`Xp: ${payload.Xp}`);
    console.log(`integrationsProvider: ${integrationsProvider}`);
    console.log(`eventType: ${payload.actionType}`);

    request(
      {
        url: serverUrl,
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      },
      (errorFromAppServer, responseFromAppServer) => {
        if (errorFromAppServer || responseFromAppServer.statusCode >= 400) {
          throw new Error(`Oh crap son! We got an error on our hands talking to the app server man!\r\n${JSON.stringify(responseFromAppServer)}`);
        }

        console.log(responseFromAppServer.statusCode);
      }
    );
  });
};
