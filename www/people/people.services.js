(function() {
'use strict';

  angular
    .module('app.people')
    .factory('Customer', Customer);

  Customer.$inject = ['$q'];
  function Customer($q) {
    var service = {
      add:add,
      get:get,
      getId:getId,
      remove:remove
    };
    
    return service;

    ////////////////
    function add(customer) {
      $q.when(_db.put(customer));
    }

    function get() {
      return $q.when(_db.allDocs({
        include_docs:true,
        startkey:'customers_',
        endkey:'customers_\uffff'
      })).then(function(docs) {
        return docs.rows.map(function(row) {
          return row.doc;
        });
      });
    }

    function getId(id) {

    }

    function remove(customer) {

    }
  }
})();