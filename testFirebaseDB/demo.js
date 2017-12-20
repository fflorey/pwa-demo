/*
* This testsuite is for playing around with some of the features of the database in firebase
* Needed when i tried to get the last 50 entries from a set (not cutting it when transferred to the client)
*/

var firebase = require('firebase-admin');
var crypto = require('crypto');
// const functions = require('firebase-functions');

// Initialize Firebase
var serviceAccount = require('./sensor-pwa-credentials.json');

var config = {
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://sensor-pwa.firebaseio.com/"
};
firebase.initializeApp(config);


function getIDForDescription(description) {
    // just a hash should work
    var hash = crypto.createHash('md5').update(description).digest('hex');
    return hash;
}

function getValues() {
    return new Promise((resolve, reject) => {
        console.log('got request for getsensorvalue, parameters are correct');
        var ref = firebase.database().ref('/sensors').orderByKey().limitToLast(10);
        console.log('ref: ' + ref);
        ref.once('value').then(snapshot => {
            console.log('ok, got data' + snapshot + " length: " + JSON.stringify(snapshot));
            var hash = [];
            snapshot.forEach(element => {
                console.log('element: ' + JSON.stringify(element));
                console.log('element.hash: ' + element.val().sensor)
                hash.push( element.val().sensor );
            });
            resolve(hash);
        }).catch((err) => {
            console.error('error - error is:' + err);
            reject(err);
        });
    });
}

function getValues2(hash) {
    return new Promise((resolve, reject) => {
        console.log('got request for getValues2, parameters are correct: hash: ' + hash);
        var ref = firebase.database().ref('/sensorvalues/' + hash).orderByKey().limitToLast(10);
        console.log('ref: ' + ref);
        ref.once('value').then(snapshot => {
            console.log('ok, got data' + snapshot + " length: " + JSON.stringify(snapshot));
            resolve(JSON.stringify(snapshot));
        }).catch((err) => {
            console.error('error - error is:' + err);
            reject(err);
        });
        console.log('waiting and done...');
    });
}

function getValues3() {
    return new Promise((resolve, reject) => {
        console.log('got request for getValues3, parameters are correct');
        var ref = firebase.database().ref('/sensorvalues/');
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
        firebase.database().ref().update(updates).then((result) => {
            console.log('fine: result is ' + result);
            return resolve(result);
        }).catch((error) => {
            return reject(error);
        })
    });
}

function isTimeForNextEntryReached(hash) {
    return new Promise((resolve, reject) => {
        console.log('got request for isTimeForNextEntryReached: ' + hash);
        var ref = firebase.database().ref('/sensorvalues/' + hash).orderByKey().limitToLast(1);
        console.log('ref: ' + ref);
        ref.once('value').then(snapshot => {
            console.log('last entry (str): ' + JSON.stringify(snapshot) + ' pure: ' + snapshot + ' val ' + snapshot.val());
            console.log('type: ' + typeof(snapshot) + ' len: ' + snapshot.length);
            if ( snapshot.val() === null ) {
                return resolve(hash);
            }

            snapshot.forEach((key) => {
                var dateval = key.val().date;
                console.log('Date of last entry: ' + new Date(dateval).toLocaleDateString() + ' date ' + new Date(dateval).toLocaleTimeString());
                console.log( 'diff: ' + (Date.now()-dateval) );
                if ( (Date.now() - dateval) > 60*60*1000 ) {
                    return resolve(hash);
                }
                return resolve('0');
            });
        });
    }).catch((err) => {
        console.error('error: ' + err);
    })
}

isTimeForNextEntryReached('984239842398429').then( res => {
    console.log('es_ ' + res);
})

/*

getValues().then((hash) => {
    console.log('hash value: ' + hash);
    return hash;
}).then((hash) => {
    return Promise.all(hash.map( isTimeForNextEntryReached));
}).then((result) => {
    result.forEach ( hash => {
        if ( hash != '0') {
            console.log('HASH: ' + hash);
        }
    });
    process.exit(0);
}).catch(error => {
    console.error('error: ' + error);
});

*/

/*

// Test for: deleting old entries - working 

getValues3().then((result) => {
    var newArray = {};
    newArray = {};
    result.forEach((res) => {
        console.log('Res: ' + res.key);
        newArray[res.key] = new Object();
        res.forEach((entry) => {
            // console.log('date: ' + entry.val().date + 'now: ' + Date.now());
            if (entry.val().date > Date.now() - 1 * 24 * 60 * 60 * 1000) {
                newArray[res.key][entry.key] = entry.val();
            } else {
                console.log('delete entry: ' + entry.val());
            }
        });
    });
    console.log('result: ' + JSON.stringify(newArray));
    updateSensorFullData(newArray).then ( (result) => {
        console.log('ok ! res: ' + result);
    }).catch ( (error) => {
        console.log('ERRORER!!: ' + error );
    });
    
}).catch ( (error) => {
    console.log('ERRORER!!' + error);
});

*/

/*

Test for getValues && getValues2

console.log('Hash: ' + getIDForDescription("Antons Zimmer"));
// test
getValues().then((hash) => {
    console.log('hash value: ' + hash);
    getValues2(hash).then( (res) => {
        console.log('RESULT OF getValues2: ' + res);
    })
}).catch((err) => {
    console.log('error: ' + err);
});

*/





