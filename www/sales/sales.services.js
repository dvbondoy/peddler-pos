(function() {
'use strict';

  angular
    .module('app.sales')
    .factory('Sales', Sales);

  Sales.$inject = ['$q'];
  function Sales($q) {
    var service = {
      add:add,
      get:get
    };
    
    return service;

    ////////////////
    function add(order) {
      return $q.when(_db.put(order));
    }

    function get() {
      return $q.when(_db.allDocs({
        include_docs:true,
        startkey:'sales_',
        endkey:'sales_\uffff'
      })).then(function(docs) {
        return docs.rows.map(function(row){
          return row.doc;
        });
      });
    }
  }
})();