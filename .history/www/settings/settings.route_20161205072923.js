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
          templateUrl: 'settings/settings.html',
          controller: 'SettingsController'
        }
      }
    ]
  }
})();