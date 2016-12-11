(function() {
'use strict';

  angular
    .module('app.people')
    .factory('Customer', Customer);

  Customer.$inject = ['$q'];
  function Customer($q) {
    var service = {
      exposedFn:exposedFn
    };
    
    return service;

    ////////////////
    function exposedFn() { }
  }
})();