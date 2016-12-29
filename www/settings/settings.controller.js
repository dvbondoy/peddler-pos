(function() {
'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', SettingsController)
    .controller('InventoryController', InventoryController);

  SettingsController.$inject = ['$scope','$q','$ionicModal','$ionicLoading'];
  function SettingsController($scope,$q,$ionicModal,$ionicLoading) {
    var vm = this;
    
    vm.USER_ID = {};
    vm.SERVER_LIST = {};
    vm.GO_LOCK = false;   //general options lock flag

    getUserID();
    getServerList();

    // PREP MODALS =========================================================
    $ionicModal.fromTemplateUrl('settings/templates/server-list-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.serverListModal = modal;
    });
    
    // USER SETUP =========================================================
    $scope.setUserID = function() {
      var id = prompt('Enter user ID:');
      vm.USER_ID._id = '_local/userId';
      vm.USER_ID.userId = id;

      // insert user 
      $q.when(_db.put(vm.USER_ID));

      // insert default servers/
      var servers = {
        _id:'_local/server_list',
        customers:'http://admin:nimda@localhost:5984/customers_'+id,
        items:'http://admin:nimda@localhost:5984/items',
        sales:'http://admin:nimda@localhost:5984/sales_'+id,
        inventory:'http://admin:nimda@localhost:5984/inventory_'+id
      };

      $q.when(_db.put(servers));
   }

    function getUserID() {
      $q.when(_db.get('_local/userId')).then(function(data){
        // console.log(data);
        vm.USER_ID = data;
      });
    }

    $scope.setServers = function() {
      $scope.serverListModal.hide();
      vm.SERVER_LIST._id = '_local/server_list';
      $q.when(_db.put(vm.SERVER_LIST));
    }

    function getServerList() {
      // console.log('getserverlist');
      $q.when(_db.get('_local/server_list')).then(function(data){
        // console.log(data);
        vm.SERVER_LIST = data;
      });
    }

    $scope.goLock = function() {
      if(!vm.GO_LOCK){
        var p = prompt('Enter password.');
        $q.when(_db.get('_local/go_password')).then(function(data){
          // console.log(data);
          if(p == data.password){
            vm.GO_LOCK = true;
          }
        }).catch(function(error){
          if(error.message == 'missing'){
            _db.put({_id:'_local/go_password',password:p});
          }
        });
      }else{
        vm.GO_LOCK = false;
      }
      // console.log(vm.GO_LOCK);
    }

    $scope.goPassword = function() {
      var p = prompt('Enter password');
      $q.when(_db.put({_id:'_local/go_password', password:p}));
    }

    // ITEMS SETUP =============================================================
    $scope.updateItems = function() {
      var remote = new PouchDB(vm.SERVER_LIST.items);

      $ionicLoading.show({});
      
      $q.when(_db.replicate.from(remote)
      .on('error',function(error){
        alert(error);
      })
      .on('complete',function(result){

        // check items design doc existince
        _db.get('_design/items_ddoc').catch(function(error){
          if(error.message == 'missing') {
            createItemsDdoc();
          }
        });
        $ionicLoading.hide();
        alert('Update success');
      }));
    }

    // function itemsDdoc(){
    //   $q.when(_db.get('_design/items_ddoc').then(function(result){
    //     console.log(result);
    //   }).catch(function(error){
    //     // console.log(error);
    //     if(error.message == 'missing'){
    //       //create it
    //       createItemsDdoc();
    //     }
    //   }));
    // }

   function createItemsDdoc() {
        var ddoc = {
        _id:'_design/items_ddoc',
        views:{
          'pcategories':{
            map:function(doc){
              if(doc.PCATEGORY){
                emit([doc.PCATEGORY], null);
              }
            }.toString(),
            reduce:'_count'
          },
          'itemsByCategories':{
            map:function(doc){
              if(doc.CATEGORY){
                emit([doc.PCATEGORY,doc.CATEGORY],null);
              }
            }.toString()
          },
          'categories':{
            map:function(doc){
              if(doc.PCATEGORY){
                emit(doc.PCATEGORY,null);
              }
            }.toString()
          }
        }
      };

      $q.when(_db.put(ddoc).then(function(result){
        console.log(result);
      }).catch(function(error){
        console.log(error);
      }));
    }

    // CUSTOMERS SETUP ================================================================
    $scope.updateCustomers = function() {
      var remote = new PouchDB(vm.SERVER_LIST.customers);
      $ionicLoading.show({});
      $q.when(_db.replicate.from(remote)
      .on('error',function(error){
        alert(error);
      })
      .on('complete',function(result){
        console.log(result);
        _db.get('_design/customers_ddoc').catch(function(error){
          if(error.message == 'missing') {
            createCustomersDdoc();
          }
        });
        $ionicLoading.hide();
      }));
    }

    function createCustomersDdoc() {
      var ddoc = {
        _id:'_design/customers_ddoc',
        views:{
          'zip':{
            map:function(doc){
              if(doc.bill_to_zip){
                emit(doc.bill_to_zip,null);
              }
            }.toString(),
            reduce:'_count'
          }
        },
        'city':{
          map:function(doc){
            if(doc.bill_to_city){
              emit([doc.bill_to_zip,doc.bill_to_city],null);
            }
          }.toString()
        },
        'address':{
          map:function(doc){
            if(doc.bill_to_address_two){
              emit([doc.bill_to_zip,doc.bill_to_city,doc.bill_to_address_two],null);
            }
          }.toString()
        }
      };

      $q.when(_db.put(ddoc).catch(function(error){
        console.log(error);
      }).then(function(result){
        console.log(result);
      }));
    }

    // SALES UPLOAD ===================================================================
    $scope.uploadSales = function() {
      $ionicLoading.show({});
      var remote = new PouchDB(vm.SERVER_LIST.sales);

      $q.when(_db.replicate.to(remote,{
        filter:function(doc){
          return doc.doc_type == 'sales';
        }
      })
      .on('error',function(error){
        console.log(error);
      })
      .on('complete',function(result){
        $ionicLoading.hide();
        console.log(result);
      }));
    }

  }

  InventoryController.$inject = ['$scope','$q','SharedProperties']
  function InventoryController($scope,$q,SharedProperties) {

    $q.when(_db.get('_design/inventory_ddoc').catch(function(error){
      if(error.message == 'missing') {
        createInventoryDdoc();
      }
    }));

    function createInventoryDdoc() {
      var ddoc = {
        _id:'_design/inventory_ddoc',
        views:{
          'active':{
            map:function(doc){
              if(doc.doc_type == 'inventory'){
                emit(doc.status,null);
              }
            }.toString()
          }
        }
      };

      $q.when(_db.put(ddoc).catch(function(error){
        console.log(error);
      }).then(function(result){
        console.log(result);
      }));
    }

    $scope.setInventory = function(value){
      SharedProperties.setProperty({isInventory:value});
    }
  }

})();