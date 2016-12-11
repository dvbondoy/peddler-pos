(function() {
  'use strict';

  angular.module('app.people').run(appRun);

  appRun.$inject = ['routerHelper'];
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state:'app.customers',
        config:{
          url:'/customers',
          templateUrl:'people/templates/customers.html'
        }
      },
      {
        state:'app.contacts',
        config:{
          url:'/contacts',
          templateUrl:'people/templates/contacts.html'
        }
      }
    ];
  }
})();