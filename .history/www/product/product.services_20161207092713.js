(function() {
'use strict';

  angular
    .module('app.product')
    // .factory('Product', Product)
    .factory('Category', ['$q', Category]);

  function Category($q) {
    var _categories;

    return {
      get:get,
      add:add,
      update:update,
      remove:remove
    };

    function get() {
      if(!_categories) {
        
      } else {
        return $q.when(_categories);
      }
    }

    function add(category) {
      return $q.when(_db.put(category));
    }

    function update(category) {

    }

    function remove(category) {

    }
  }

})();