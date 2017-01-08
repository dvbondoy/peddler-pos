(function() {
  'use strict';

  angular.module('app', [
    'ionic',
    'ngCordova',
    'angularMoment',
    'ionic-datepicker',
    'app.core',
    'app.layout',
    'app.database',
    'app.settings',
    'app.product',
    'app.sales',
    'app.people',
    'app.report'
  ]);
})();