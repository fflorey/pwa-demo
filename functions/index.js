// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const globals = require('./config.js').globals;
const errorcodes = require('./config.js').errors;

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// CORS Express middleware to enable CORS Requests.
const cors = require('cors')({ origin: true });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    cors(req, res, () => {
        const original = req.query.text;
        // Push the new message into the Realtime Database using the Firebase Admin SDK.
        admin.database().ref('/messages').push({ original: original }).then(snapshot => {
            // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
            // res.redirect(303, snapshot.ref);

            res.send('<html>all fine</html>');
        });
    });
});


exports.addsensorvalue = functions.https.onRequest((req, res) => {
    const description = req.query.description;
    const temperature = req.query.tvalue;
    const humidity = req.query.hvalue;
    const secret = req.query.password;
    const timer = Date.now();
    if (description == undefined || humidity == undefined || temperature == undefined) {
        res.send({ status: 'error', error: errorcodes.malformedRequest });
        return;
    }
    if (secret !== globals.secretForWriteAccess) {
        res.send({ status: 'error', error: errorcodes.invalidSecret });
        return;
    }
    console.log('got request, parameters are correct');
    admin.database().ref('/sensorvalues').push({ date: timer, temperature: temperature, humidity: humidity, sensor: description }).then(snapshot => {
        console.log('fine, sending ok');
        res.send({ status: 'ok' });
    }).catch(error => {
        res.send({ status: 'error', error: error });
    })
});



exports.getsensorvalue = functions.https.onRequest((req, res) => {
    const secret = req.query.password;
    if (secret !== globals.secretForWriteAccess) {
        res.send({ status: 'error', error: errorcodes.invalidSecret });
        return;
    }
    cors(req, res, () => {
        console.log('got request for getsensorvalue, parameters are correct');
        admin.database().ref('/sensorvalues').once('value').then(snapshot => {
            console.log('ok, got data' + snapshot);

            res.send({ status: 'ok', data: snapshot });
        }).catch(error => {
            res.send({ status: 'error', error: error });
        })
    });
});
