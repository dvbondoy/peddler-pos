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
        state: 'app.categories',
        config: {
          url: '/categories',
          templateUrl: 'product/templates/categories.html',
          controller: 'CategoriesController'
        }
      },
      {
        state: 'app.items',
        config: {
          url: '/items',
          templateUrl: 'product/templates/items.html'
        }
      }
    ]
  }
})();