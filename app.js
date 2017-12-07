// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// import $ from 'jquery';   // does not work in browser, only EDGE

(function () {
  'use strict';

  var ctx = document.getElementById("myChart");
  var pwe = document.getElementById("pw-note");
  var pwnc = document.getElementById("pw-notcorrect");
  var counter = 0;

  var app = {
    details: "about me"
  };

  var oldPassword = localStorage.getItem('globalPassword');
  ctx.style.display = 'none';
  pwe.style.display = 'none';
  pwnc.style.display = 'none';
  var counter = localStorage.getItem('getNumberOfItemsToGet');
  if ( counter == null || counter == undefined || counter == 0 ) {
    counter = 10;
  }

  if (oldPassword !== undefined && oldPassword !== '' && oldPassword !== null) {
    console.log('stored password: ' + oldPassword);
    $.ajax({
      url: "https://us-central1-sensor-pwa.cloudfunctions.net/getsensorvalue?password=" + oldPassword + '&counter='+counter, crossDomain: true, success: function (result) {
        console.log('status: >' + result.status + '< error: ' + result.error);
        if (result.status == 'error' && result.error == '1001') {
          pwnc.style.display = 'block';
          console.log('huhu, password not correct?');
        } else {
          ctx.style.display = 'block';
          var data = [];
          var lables = [];
          var lastValue = -1000;
          var x = 0;
          for (var props in result.data) {
            console.log('temp:' + props + " date: " + result.data[props].date + " temp: " + result.data[props].temperature);
            let temp = (result.data[props].temperature) / 100;
            if (true) {
              console.log('x: ' + x + " y: " + temp);
              data.push(temp);
              if ((x % 5) == 0)
                lables.push(new Date(result.data[props].date).toLocaleString());
              else
                lables.push('');
            }
            x++;
            lastValue = temp;
          }
          var myChart = new Chart(ctx, {
            type: 'line',
            label: "mylabel",

            data: {
              backgroundColor: '#fa6384',
              labels: lables,
              datasets: [{
                label: 'temperature',
                data: data,
                fill: true
              }]

            },
            options: {
              scales: {
                yAxes: [{
                  ticks: {
                    min: -5
                  }
                }]
              },
              elements: {
                line: {
                  tension: 0, // disables bezier curves
                },
                animation: {
                  duration: 0, // general animation time
                },
                hover: {
                  animationDuration: 0, // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0, // animation duration after a resize
              }
            }
          });
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        console.log('errror!');
        alert(xhr.status);
        alert(thrownError);
      }
    });
  } else {
    console.log('no pw set: ' + oldPassword);
    pwe.style.display = 'block';

  }


  // TODO add service worker code here

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function () { console.log('Service Worker Registered'); });
  }


})();
