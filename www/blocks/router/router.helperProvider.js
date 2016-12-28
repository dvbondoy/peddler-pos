/*
 * Routing
 * Code adapted from https://github.com/johnpapa/angular-styleguide#style-y270
 *
 */

(function () {

  angular
    .module('blocks.router')
    .provider('routerHelper', routerHelperProvider);

  routerHelperProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];

  function routerHelperProvider($locationProvider, $stateProvider, $urlRouterProvider) {
    this.$get = RouterHelper;

    /*
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
    */

    RouterHelper.$inject = ['$state'];

    function RouterHelper($state) {
      var hasOtherwise = false;

      var service = {
        configureStates: configureStates,
        getStates: getStates
      };

      return service;

      //////////////

      function configureStates(states, otherwisePath) {
        states.forEach(function (state) {
          $stateProvider.state(state.state, state.config);
          // console.log(state);
        });

        if (otherwisePath && !hasOtherwise) {
          hasOtherwise = true;
          $urlRouterProvider.otherwise(otherwisePath);
        }
      }

      function getStates() {
        return $state.get();
      }
    }
  }
})();
