(function() {
  'use strict';

  angular.module('app.product').run(appRun);

  appRun.$inject = ['routerHelper'];
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'app.category',
        config: {
          url: '/category',
          templateUrl: 'product/templates/categories.html'
        }
      }
    ]
  }
})();