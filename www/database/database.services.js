(function() {
'use strict';
  _db = new PouchDB('peddlerpos',{adapter:'websql'});
  // _db.destroy();
  // _db.setSchema([
  //     {
  //       singular:'category',
  //       plural:'categories',
  //       relations:{
  //         'items':{hasMany:{type:'item',options:{queryInverse:'category'}}}
  //       }
  //     },
  //     {
  //       singular:'item',
  //       plural:'items',
  //       relations:{
  //         'category':{belongsTo:'category'}
  //       }
  //     }
  //   ]);

  angular
    .module('app.database')
    .factory('DataServices', DataServices);

  DataServices.$inject = ['$q'];
  function DataServices($q) {

    // var a = $q.when(_db.rel.save('category',{
    //   id:1,
    //   name:'Top Category 1',
    //   categories:[12,13]
    // }).then(function(){
    //   return _db.rel.save('category',{
    //     id:12,
    //     name:'Sub Category 1',
    //     category:1
    //   });
    // }).then(function(){
    //   return _db.rel.save('category',{
    //     id:13,
    //     name:'Sub Category 2',
    //     category:1
    //   });
    // }).then(function(){
    //   return _db.rel.find('category');
    // }));

    // $q.when(_db.rel.save('item',{
    //   id:4,
    //   description:'item one',
    //   category:1
    // }).then(function(){
    //   return _db.rel.save('item',{
    //     id:5,
    //     description:'item two',
    //     category:1
    //   });
    // }).then(function(){
    //   return _db.rel.save('item',{
    //     id:6,
    //     description:'item three',
    //     category:12
    //   });
    // }).then(function(){
    //   return false;
    //   // return _db.rel.find('category');
    // }));

    // console.log('b');
    // console.log(b);
    // console.log($q.when(_db.rel.findHasMany('item','category')));

    // console.log('a');
    // console.log(a);

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
        // return docs;
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
