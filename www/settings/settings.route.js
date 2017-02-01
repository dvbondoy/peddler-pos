(function() {
  'use strict';

  angular.module('app.settings').run(appRun);

  appRun.$inject = ['routerHelper'];
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'app.settings',
        config: {
          url: '/settings',
          templateUrl: 'settings/templates/settings.html',
          controller: 'SettingsController'
        }
      },
      {
        state: 'app.category',
        config: {
          url: '/category',
          templateUrl: 'settings/templates/category.html'
        }
      },
      {
        state: 'app.customer',
        config: {
          url: '/customer',
          templateUrl: 'settings/templates/customer.html'
        }
      },
      {
        state: 'app.discount',
        config: {
          url: '/discount',
          templateUrl: 'settings/templates/discount.html'
        }
      }
    ];
  }
})();