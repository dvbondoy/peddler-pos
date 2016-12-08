(function() {
'use strict';

  angular
    .module('app.product')
    .factory('Product', Product)
    .factory('Category', ['$q', Category])
    .factory('Items', ['$q', Items]);

  function Product() {

  }

  function Category($q) {

    return {
      get:get,
      add:add,
      update:update,
      remove:remove
    };

    function get() {
      return $q.when(_db.allDocs({include_docs:true, startkey:'categories_', endkey:'categories_\uffff'}))
        .then(function(docs) {
          return docs.rows.map(function(row){
            return row.doc;
          });
        });
    }

    function add(category) {
      return $q.when(_db.put(category));
    }

    function update(category) {

    }

    function remove(category) {

    }
  }

  function Items($q) {
    return {
      get:get,
      add:add
    };

    function get() {
      return $q.when(_db.allDocs(
        {
          include_docs:true,
          startkey:'items_',
          endkey:'items_\uffff'
        }
      )).then(function(docs) {
        return docs.rows.map(function(row) {
          return row.doc;
        });
      });
    }

    function add(item) {
      return $q.when(_db.put(item));
    }
  }

})();