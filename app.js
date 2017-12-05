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

  var app = {
    details: "about me"
  };

  $.ajax({
    url: "https://us-central1-sensor-pwa.cloudfunctions.net/getsensorvalue?password=simsalabimm4711kruemelmonster", crossDomain: true, success: function (result) {
      var data = [];
      var lables = [];
      var lastValue = -1000;
      var x = 0;
      for (var props in result.data) {
        console.log('temp:' + props + " date: " + result.data[props].date + " temp: " + result.data[props].temperature);
        let temp = (result.data[props].temperature) / 100;
        if ( true  ) {
          console.log('x: ' + x + " y: " +  temp);
          data.push( temp );
          if ( (x % 5) == 0 ) 
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
  });

  // TODO add service worker code here

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function () { console.log('Service Worker Registered'); });
  }


})();
