// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
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
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // state for main screen
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/app.html'
  })

  // Home screen
  .state('app.home', {
    //cache: false,
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })

  // Activity
  .state('app.activity', {
    url: '/activity',
    templateUrl: 'templates/activity.html',
    controller: 'ActivityCtrl'
  })

  // Activity detail
  .state('app.activity_detail', {
    url: '/activity/:id',
    templateUrl: 'templates/activity_detail.html',
    controller: 'ActivityDetailCtrl'
  })

  // Reports
  .state('app.report', {
    url: '/reports',
    templateUrl: 'templates/reports.html',
    controller: 'ReportCtrl'
  })

  // Items
  .state('app.item', {
    url: '/items',
    templateUrl: 'templates/items.html',
    controller: 'ItemCtrl'
  })

  // All items
  .state('app.item_all', {
    url: '/items/all',
    templateUrl: 'templates/items_all.html',
    controller: 'ItemAllCtrl'
  })

  // All categories
  .state('app.item_category', {
    url: '/items/categories',
    templateUrl: 'templates/items_categories.html',
    controller: 'ItemCategoryCtrl'
  })

  // All discounts
  .state('app.item_discount', {
    url: '/items/discounts',
    templateUrl: 'templates/items_discounts.html',
    controller: 'ItemDiscountCtrl'
  })

  // Settings
  .state('app.setting', {
    url: '/settings',
    templateUrl: 'templates/settings.html',
    controller: 'SettingCtrl'
  })

  // state for auth screens
  .state('auth', {
    url: '/auth',
    abstract: true,
    templateUrl: 'templates/auth.html'
  })


  // welcome screen
  .state('auth.welcome', {
    url: '/welcome',
    templateUrl: 'templates/welcome.html',
    controller: 'HomeCtrl'
  })

  // login screen
  .state('auth.login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'AuthCtrl'
  })

  // register screen
  .state('auth.register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'AuthCtrl'
  })

  // forgot passowrd
  .state('auth.forgot_pwd', {
    url: '/forgot_pwd',
    templateUrl: 'templates/forgot_pwd.html',
    controller: 'AuthCtrl'
  })

  // Sign in with device code
  .state('auth.device_code', {
    url: '/device_code',
    templateUrl: 'templates/device_code.html',
    controller: 'AuthCtrl'
  })


    // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/auth/welcome');

});
