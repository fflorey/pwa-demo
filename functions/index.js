// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
const globals = require('./config.js').globals;
const errorcodes = require('./config.js').errors;

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// CORS Express middleware to enable CORS Requests.
const cors = require('cors')({ origin: true });
var crypto = require('crypto');


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


function getIDForDescription(description) {
    // just a hash should work
    var hash = crypto.createHash('md5').update(description).digest('hex');
    return hash;
}

////////////////////////////////////////////////////////////////////////////////
// section with functions to purge database

function getSensorValues() {
    return new Promise((resolve, reject) => {
        console.log('got request for getValues3, parameters are correct');
        var ref = admin.database().ref('/sensorvalues/');
        console.log('ref: ' + ref);
        ref.once('value').then(snapshot => {
            return resolve(snapshot);
        }).catch((err) => {
            console.error('error - error is:' + err);
            reject(err);
        });
        console.log('waiting and done...');
    });
}

function updateSensorFullData(updateData) {
    return new Promise((resolve, reject) => {
        var updates = {};
        updates['sensorvalues'] = updateData;
        admin.database().ref().update(updates).then((result) => {
            return resolve(result);
        }).catch((error) => {
            return reject(error);
        })
    });
}

function purgeDatabase() {
    return new Promise((resolve, reject) => {
        // before adding any new value, we check if we need to delete old ones
        // but we do the purge only every X calls to this function (prevent too 
        // much load)
        console.log('purgeDatabase started');
        if ((globalPurgeCounter++ % 10) != 0) {
            console.log('no purge necessary');
            return resolve(true);
        }
        getSensorValues().then((result) => {
            var newArray = {};
            newArray = {};
            result.forEach((res) => {
                console.log(': ' + res.key);
                newArray[res.key] = new Object();
                res.forEach((entry) => {
                    // delete everything which is older than X day: X * 24 * 60 * 60 * 1000
                    if (entry.val().date > Date.now() - 1 * 24 * 60 * 60 * 1000) {
                        newArray[res.key][entry.key] = entry.val();
                    } else {
                        console.log('delete an entry: ' + entry.val());
                    }
                });
            });
            updateSensorFullData(newArray).then((result) => {
                console.log('ok, delete array res: ' + result);
                return resolve(result);
            }).catch((error) => {
                console.error('error: ' + error);
                return reject(error);
            });

        }).catch((error) => {
            console.error('error: ' + error);
            return reject(error);
        });
    });
}

////////////////////////////////////////////////////////////////////////////////

function isTimeForNextEntryReached(hash) {
    return new Promise((resolve, reject) => {
        console.log('got request for isTimeForNextEntryReached: ' + hash);
        var ref = admin.database().ref('/sensorvalues/' + hash).orderByKey().limitToLast(1);
        console.log('ref: ' + ref);
        ref.once('value').then(snapshot => {
            console.log('last entry: ' + JSON.stringify(snapshot));
            snapshot.forEach((key) => {
                var dateval = key.val().date;
                console.log('Date of last entry: ' + new Date(dateval).toLocaleDateString() + ' date ' + new Date(dateval).toLocaleTimeString());
                console.log('diff: ' + (Date.now() - dateval));
                if ((Date.now() - dateval) > 60 * 60 * 1000) {
                    return resolve(hash);
                }
                return resolve('0');
            });
        }).catch((err) => {
            console.error('error: ' + err);
            return reject(err);
        });
    });
}

////////////////////////////////////////////////////////////////////////////////
// 19.12: addSensorValue will be called much more often than before

var globalPurgeCounter = 0;

exports.addsensorvalue = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        console.log('addsensorvalue: started')

        purgeDatabase().then((dummy) => {
            console.log('after purgeDatabase : ' + dummy);
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
            const hash = getIDForDescription(description);
            console.log('got request, parameters are correct, and hash is: ' + hash);
            var updates = {};
            const updateData = {
                temperature: temperature,
                humidity: humidity,
                description: description,
                sensor: hash,
                date: timer
            }
            updates['sensors/' + hash] = updateData;
            admin.database().ref().update(updates).then((result) => {
                console.log('fine: result is ' + result);
                isTimeForNextEntryReached(hash).then(hash => {
                    console.log('hash after isTimeForNextEntryReached: ' + hash);
                    if (hash != '0') {
                        admin.database().ref('/sensorvalues/' + hash).push({ date: timer, temperature: temperature, humidity: humidity, sensor: description }).then(snapshot => {
                            console.log('fine, now update the sensorlist');
                            res.send({ status: 'ok' });
                        }).catch(error => {
                            res.send({ status: 'error', error: error });
                        })
                    }
                    console.log('no update necessary');
                    res.send({ status: 'ok' });
                }).catch(error => {
                    res.send({ status: 'error', error: error });
                })
            })
        }).catch(error => {
            res.send({ status: 'error', error: error });
        });
    });
});


/* getsensorValue does the following:
* 1) get all sensors available
* 2) get data from all sensors 
*/


exports.getsensordata = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const secret = req.query.password;
        if (secret !== globals.secretForWriteAccess) {
            console.log('pw incorrect');
            res.send({ status: 'error', error: errorcodes.invalidSecret });
            return;
        }
        console.log('got request for getsensorvalue, password ist correct');
        admin.database().ref('/sensors').orderByKey().limitToLast(50).once('value').then(snapshot => {
            res.send({ status: 'ok', data: snapshot });
        }).catch(error => {
            res.send({ status: 'error', error: error });
        })
    });
});

/* changed: 
*  getsensordataforchart needs to called with a key (the hashkey),
*  so:
*  password, counter and key
*  password: global password that is needed for access
*  counter: number of items to get for that specific sensor
*  key: the hash value for the sensor (how to get it from getseonsordata)
*/

exports.getsensordataforchart = functions.https.onRequest((req, res) => {

    cors(req, res, () => {

        const secret = req.query.password;
        const counter = req.query.counter;
        const hash = req.query.key;
        var counterValue = 10;
        if (counter == null || counter == undefined || counter <= 0 || counter > 30) {
            counterValue = 10;
        } else {
            counterValue = parseInt(counter, 10);
        }
        if (secret !== globals.secretForWriteAccess) {
            console.log('pw incorrect');
            res.send({ status: 'error', error: errorcodes.invalidSecret });
            return;
        }
        console.log('got request for getsensorvalue, parameters are correct, counter is: ' + counterValue);
        admin.database().ref('/sensorvalues/' + hash).orderByKey().limitToLast(counterValue).once('value').then(snapshot => {
            res.send({ status: 'ok', data: snapshot });
        }).catch(error => {
            res.send({ status: 'error', error: error });
        })
    });
});
