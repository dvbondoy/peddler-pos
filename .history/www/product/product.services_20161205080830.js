(function() {
'use strict';

  angular
    .module('app.product')
    .factory('Product', Product);

  Product.$inject = [''];
  function Product() {
    var service = {
      exposedFn:exposedFn
    };
    
    return service;

    ////////////////
    function exposedFn() { }
  }
})();