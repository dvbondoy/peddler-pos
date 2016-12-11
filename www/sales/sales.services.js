(function() {
'use strict';

  angular
    .module('app.sales')
    .factory('Sales', Sales);

  Sales.$inject = ['$q'];
  function Sales($q) {
    var service = {
      exposedFn:exposedFn
    };
    
    return service;

    ////////////////
    function exposedFn() { }
  }
})();