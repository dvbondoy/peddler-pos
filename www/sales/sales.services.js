(function() {
'use strict';

  angular
    .module('app.sales')
    .factory('SalesService', SalesService);

  SalesService.$inject = ['$q'];
  function SalesService($q) {

    var service = {
      getPCategories:getPCategories,
      getCategories:getCategories,
      getItems:getItems,
      getActiveInventory:getActiveInventory,
      closeActiveInventory:closeActiveInventory
      // getCustomer:getCustomer,
      // saveInventory:saveInventory,
      // saveSale:saveSale
    };
    
    return service;

    ////////////////
    function getPCategories() {
      return $q.when(_db.query('items_ddoc/pcategories',{group:true}).then(function(result) {
        var p_categories = [];
        result.rows.forEach(function(row){
          p_categories.push(row.key[0]);
        });

        return p_categories;
      }));
    }

    function getCategories(pcategory) {
      return $q.when(_db.query('items_ddoc/categories',{
        include_docs:true,
        startkey:pcategory,
        endkey:pcategory+'\uffff'
      }).then(function(result) {
        var categories = [];

        result.rows.forEach(function(row) {
          categories.push(row.doc.CATEGORY);
        });

        return categories;
      }));
    }

    function getItems(pcategory,category) {
      return $q.when(_db.query('items_ddoc/itemsByCategories',{
        include_docs:true,
        key:[pcategory,category]
      }).then(function(docs) {
        var items = [];
        docs.rows.forEach(function(row) {
          items.push(row.doc);
        });
        return items;
      }));

    }

    function getActiveInventory() {
      return $q.when(_db.query('inventory_ddoc/active', {
        include_docs:true,
        key: 'active'
      }).then(function(docs) {
        if(docs.rows.length == 0) {
          return false;
        } else {
          return docs.rows[0].doc;
        }
      }));
    }

    function closeActiveInventory(inventory) {
      inventory.status = 'closed';
      return $q.when(_db.put(inventory)
        .then(function(result) {
          return result;
      }).catch(function(error) {
        return error;
      }));
    }
   
  }
})();