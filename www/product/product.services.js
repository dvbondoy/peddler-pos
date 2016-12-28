(function() {
'use strict';

  angular
    .module('app.product')
    .factory('Product', Product)
    .factory('Category', ['$q', Category])
    .factory('Items', ['$q', Items])
    .factory('Discounts', ['$q', Discounts])
    .factory('Tax', ['$q', Tax]);

  function Product() {

  }

  // CATEGORY
  function Category($q) {

    return {
      get:get,
      getAll:getAll,
      getCategories:getCategories,
      getSubCategories:getSubCategories,
      add:add,
      update:update,
      remove:remove
    };

    function getAll() {
      return $q.when(_db.allDocs(
        {
          include_docs:true, 
          startkey: 'categories_', 
          endkey: 'categories_\uffff'
        }))
        .then(function(docs) {
          return docs.rows.map(function(row){
            return row.doc;
          });
        });
    }

    function getCategories(){
      return $q.when(_db.allDocs(
        {
          include_docs:true, 
          startkey: 'categories_TOPLEVEL_', 
          endkey: 'categories_TOPLEVEL_\uffff'
        }))
        .then(function(docs) {
          return docs.rows.map(function(row){
            return row.doc;
          });
        });
    }

    function getSubCategories(category) {
      return $q.when(_db.allDocs(
        {
          include_docs:true, 
          startkey: 'categories_'+category, 
          endkey: 'categories_'+category+'\uffff'
        }))
        .then(function(docs) {
          return docs.rows.map(function(row){
            return row.doc;
          });
        });
    }

    function get(id) {
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
      getByCategory:getByCategory,
      add:add,
      remove:remove
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

    function getByCategory(category) {
      return $q.when(_db.allDocs({
        include_docs:true,
        startkey:'items_'+category,
        endkey:'items_'+category+'\uffff'
      })).then(function(docs){
        return docs.rows.map(function(row){
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

  // DISCOUNTS
  function Discounts($q) {
    return {
      get:get,
      add:add,
      remove:remove
    };

    function get() {
      return $q.when(_db.allDocs({
        include_docs:true,
        startkey:'discounts_',
        endkey:'discounts_\uffff'
      })).then(function(docs){
        var discounts = docs.rows.map(function(row){
          return row.doc;
        });

        // _db.changes({live:true,since:'now',include_docs:true}).on('change', function(change) {
          
        // });

        return discounts;
      });
    }

    function add(discount) {
      return $q.when(_db.put(discount));
    }

    function remove(discount) {
      return $q.when(_db.get(discount._id).then(function(doc){
        return _db.remove(doc);
      }));
    }
  }

  function Tax($q) {
    return {
      get:get,
      add:add,
      update:update,
      remove:remove
    };

    function get() {
      return $q.when(_db.allDocs({
        include_docs:true,
        startkey:'taxes_',
        endkey:'taxes_\uffff'
      })).then(function(docs) {
        return docs.rows.map(function(row) {
          return row.doc;
        });
      });
    }

    function add(tax) {
      return $q.when(_db.put(tax));
    }

    function update(tax) {
      return $q.when(_db.get(tax._id)).then(function(doc) {
        return _db.put(tax);
      });
    }

    function remove(tax) {
      return $q.when(_db.get(tax._id).then(function(doc){
        return _db.remove(doc);
      })).then(function(res){
        return res;
      });
    }
  }

})();