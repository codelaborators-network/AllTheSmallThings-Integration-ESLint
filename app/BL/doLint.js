require('es6-promise').polyfill();
require('isomorphic-fetch');

const linter = require('eslint').linter;
const serverUrl = 'http://abstractsausagefactory.azurewebsites.net/api/tracking/';

module.exports = (req) => {
  console.log(req);
  const fileUrl = req.fileUrl;

  console.log(`Alright bro, I'm just gonna go get ${fileUrl} real quick`);
  fetch(fileUrl).then((response) => {
    if (response.status >= 400) {
      throw new Error(`Oh crap son! We got an error on our hands man!\r\n${JSON.stringify(response)}`);
    }

    return response.text();
  })
  .then((body) => {
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
    }, { filename: fileName});

    if (messages.length === 0) {
      console.log(`Dude, this file was sick! Sending points to the app server`);
      /*fetch(serverUrl, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          UserName: username,
          Xp: modCount
        })
      }).catch(function(error) {
        console.log('OHH SNAP!!! We got problems sending to the app server son!', error);
      });*/

      return;
    }

    console.log(`You done messed up son. No points for you.`);
  }).catch(function(error) {
    console.log('OHH SNAP!!! We got problems getting to github son!', error);
  });
};

