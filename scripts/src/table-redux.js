/*
* @Author: bjliujiajun
* @Date:   2016-06-28 15:05:21
* @Last Modified by:   bjliujiajun
* @Last Modified time: 2016-06-28 16:20:15
*/

'use strict';

/* action */
const showPopLayer = (text) => {
   return {
      type: 'SHOW_POPLAYER',
      text
   }
}

const toggleCaptcha = (able) => {
   return {
      type: 'TOGGLE_Captcha',
      able
   }
}

const toggleSubmit = (able) => {
   return {
      type: 'TOGGLE_SUBMIT',
      able
   }
}

/* reducer */
const reducer = (state, action) => {
   switch (action.type){
      case 'SHOW_POPLAYER':
         return Object.assign({}, state, {isShow: true})
      break;
      case 'TOGGLE_Captcha':
      break;
      case 'TOGGLE_SUBMIT':
      break;
   }
}

/* store */
var store = Redux.createStore();