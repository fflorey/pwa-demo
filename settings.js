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

const nameNumberOfItems = 'getNumberOfItemsToGet';

function changeValue() {
  var value = document.getElementById("myRange").value;
  setNumberOfItems( value );
}

function setNumberOfItems( value ) {
  console.log('value changed and will be saved '  + value);
  document.getElementById('show_number').innerHTML='number of data entries to show: ' + value;
  localStorage.setItem( nameNumberOfItems, value );
  document.getElementById("myRange").value = value;
}

function savePassword() {
  console.log('huhu, password will be saved');
  var password = document.getElementById("password").value;
  console.log('password: >' + password + '<');
  localStorage.setItem('globalPassword', password );
}

(function () {
  'use strict';

  var numberOfItems = localStorage.getItem(nameNumberOfItems);
  numberOfItems !== undefined && numberOfItems !== '' && numberOfItems !== null ? setNumberOfItems (numberOfItems) : null;

  var oldPassword = localStorage.getItem('globalPassword');
  if ( oldPassword !== undefined && oldPassword !== '' && oldPassword !== null ) {
    console.log('stored password: ' + oldPassword);
    document.getElementById("password").value = oldPassword;
  } else {
    console.log('no pw set: ' + oldPassword);
  }


 
})();
