(function() {
  'use strict';

  angular.module('app.report').run(appRun);

  appRun.$inject = ['routerHelper'];
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'app.report',
        config: {
          url: '/report',
          templateUrl: 'report/templates/report.html'
        }
      },
      {
        state: 'app.daily_activity',
        config: {
          url: '/daily_activity',
          templateUrl: 'report/templates/daily-activity.html'
        }
      },
      {
        state: 'app.active_inventory',
        config: {
          url: '/active_inventory',
          templateUrl: 'report/templates/active-inventory.html'
        }
      }
    ];
  }
})();