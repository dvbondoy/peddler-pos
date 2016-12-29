(function() {
'use strict';

  angular
    .module('blocks.shared')
    .service('SharedProperties', SharedProperties);

  // SharedProperties.$inject = ['dependency1'];
  function SharedProperties() {
    var property = {
      isInventory:false
    };

    return {
      getProperty:function(){
        return property;
      },
      setProperty:function(value){
        property = value;
      }
    };
  }
})();