(function() {
  'use strict';

  angular.module('app.core')
    .run(appRun);

  function appRun($ionicPlatform, $state, $ionicHistory) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      $ionicPlatform.registerBackButtonAction(function(event){
        event.preventDefault();

        console.log('registerBackButtonAction');

        if($state.current.name == 'app.sales'){
          if(confirm('Exit now?')){
            navigator.app.exitApp();
          }
        }
      },800);

    });

    _db = new PouchDB('peddlerpos', {adapter:'websql'});
    // _db.info().then(function(info){
    //   console.log(info);
    // });
    // _db.info().then(console.log.bind(console));
  }
})();
