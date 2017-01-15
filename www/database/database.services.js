(function() {
'use strict';

  angular
    .module('app.database')
    .factory('DataServices', DataServices);

  DataServices.$inject = ['$q'];
  function DataServices($q) {
    var service = {
      get:get,
      put:put,
      query:query,
      getPCategories:getPCategories,
      getCategories:getCategories,
      getItems:getItems,
      getActiveInventory:getActiveInventory,
      closeActiveInventory:closeActiveInventory,
      saveInventory:saveInventory
    };
    
    return service;

    ////////////////
    function get(id) {
      return $q.when(_db.get(id).then(function(docs){
        return docs;
      }).catch(function(error) {
        return error;
      }));
    }

    function put(doc) {
      return $q.when(_db.put(doc).then(function(result){
        return result;
      }).catch(function(error) {
        return error;
      }));
    }

    function query(id,option,callback) {
      return $q.when(_db.query(id,option).then(function(result){
        return result;
      }));
    }

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

    function saveInventory(inventory) {
      return $q.when(_db.put(inventory).then(function(result) {
        return result;
      }).catch(function(error) {
        return error;
      }));
    }

  }
})();