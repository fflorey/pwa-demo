/*
* This testsuite is for playing around with some of the features of the database in firebase
* Needed when i tried to get the last 50 entries from a set (not cutting it when transferred to the client)
*/

var firebase = require('firebase-admin');
// const functions = require('firebase-functions');

// Initialize Firebase
var serviceAccount = require('./sensor-pwa-credentials.json');

var config = {
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://sensor-pwa.firebaseio.com/"
  };
  firebase.initializeApp(config);


function getValues() {
    console.log('got request for getsensorvalue, parameters are correct');
    var ref = firebase.database().ref('/sensorvalues').orderByKey().limitToLast(10);
    console.log('ref: ' + ref);
    ref.once('value').then(snapshot => {
        console.log('ok, got data' + snapshot + " length: " + JSON.stringify(snapshot));
        for ( var entry in snapshot ) {
            console.log('entry: ' + JSON.stringify(entry));
        }
        snapshot.forEach(element => {
            console.log('element: ' + JSON.stringify(element));
            console.log('element.Datum: ' + element.val().temperature)
        });        
        process.exit(0);
    }).catch((err) => {
        console.error('error - error is:' + err);
        process.exit(1);
    });
    console.log('waiting and done...');
}


// test
getValues();



