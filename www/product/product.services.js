(function() {
'use strict';

  angular
    .module('app.product')
    .factory('Product', Product)
    .factory('Category', ['$q', Category])
    .factory('Items', ['$q', Items]);

  function Product() {

  }

  // CATEGORY
  function Category($q) {

    return {
      get:get,
      getId:getId,
      add:add,
      update:update,
      remove:remove
    };

    function get(start = 'categories_', end='categories_\uffff') {
      return $q.when(_db.allDocs(
        {
          include_docs:true, 
          startkey: start, 
          endkey: end
        }))
        .then(function(docs) {
          return docs.rows.map(function(row){
            return row.doc;
          });
        });
    }

    function getId(id) {
      return $q.when(_db.get(id).then(function(doc){
        return doc;
      }));
    }

    function add(category) {
      return $q.when(_db.put(category));
    }

    function update(category) {
      return $q.when(_db.put(category));
    }

    function remove() {
      
    }
  }

  // ITEMS
  function Items($q) {
    return {
      get:get,
      add:add,
      remove:remove
    };

    function get(start='items_', end='items_\uffff') {
      return $q.when(_db.allDocs(
        {
          include_docs:true,
          startkey:start,
          endkey:end
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

    function remove() {
      
    }
  }

})();