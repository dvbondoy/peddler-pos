(function() {
'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$scope'];
  function SettingsController($scope) {
    var vm = this;
    

    activate();

    ////////////////

    function activate() { }
  }
})();