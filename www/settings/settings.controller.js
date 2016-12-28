(function() {
'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$scope','$q','$ionicModal','$ionicLoading'];
  function SettingsController($scope,$q,$ionicModal,$ionicLoading) {
    var vm = this;
    
    vm.USER_ID = {};
    vm.SERVER_LIST = {};
    vm.GO_LOCK = false;

    getUserID();
    getServerList();

    $ionicModal.fromTemplateUrl('settings/templates/server-list-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.serverListModal = modal;
    });
    
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

    $scope.updateItems = function() {
      var remote = new PouchDB(vm.SERVER_LIST.items);

      $ionicLoading.show({});
      
      $q.when(_db.replicate.from(remote)
      .on('error',function(error){
        alert(error);
      })
      .on('complete',function(result){

        // check items design doc
        itemsDdoc();

        $ionicLoading.hide();

        alert('Update success');
      }));
    }

    function itemsDdoc(){
      $q.when(_db.get('_design/items_ddoc').then(function(result){
        console.log(result);
      }).catch(function(error){
        // console.log(error);
        if(error.message == 'missing'){
          //create it
          createItemsDdoc();
        }
      }));
    }

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

      // function distinct(value,index,self){
      //   return self.indexOf(value) === index;
      // }

      // $q.when(_db.query('my_categories/categories',{startkey:'ALCOHOL',endkey:'ALCOHOL\uffff',include_docs:true},function(err,res){
      //   var arr = [];
      //   res.rows.forEach(function(row){
      //     arr.push(row.doc.CATEGORY);
      //   });
      //   // var unique = arr.filter(distinct);
      //   var unique = arr.filter((v,i,a) => a.indexOf(v) === i);
      //   console.log(unique);
      // }));
    }

    $scope.updateCustomers = function() {
      var remote = new PouchDB(vm.SERVER_LIST.customers);
      $ionicLoading.show({});
      $q.when(_db.replicate.from(remote)
      .on('error',function(error){
        alert(error);
      })
      .on('complete',function(result){
        $ionicLoading.hide();
      }));
    }

    function temp() {
              // create design
        var ddoc = {
          _id:'_design/dItems',
          views:{
            'category': {
              map:function(doc){
                emit(doc.CATEGORY);
             }.toString(),
             reduce:'_count'
            },
           'pcategory':{
             map:function(doc){
               emit(doc.PCATEGORY);
              //  emit(doc.CATEGORY);
             }.toString(),
             reduce:'_count'
           },
           'byCategory': {
             map:function(doc){
               if(doc.PCATEGORY){
                 emit(doc.PCATEGORY);
               }
             }.toString()//,
            //  reduce:'_count'
           }
         }
        };

        // console.log(ddoc);
        $q.when(_db.put(ddoc)).then(function(){
            // console.log(data);
            _db.query('dItems/category',{stale:'update_after'});
            // _db_query('dItems/pcategory',{stale:'update_after'});
        });

        $q.when(_db.query('dItems/byCategory', {key:'ALCOHOL',include_docs:true},function(err,res){
          if(err){
            console.log(err);
          }else{
            console.log(res);
          }
        }));
        // $q.when(_db.query('dItems/category',{group:true}).then(function(result){
        //   console.log(result);
        //   result.rows.forEach(function(row){
        //     console.log(row.key);
        //   });
        // }));

        // $q.when(_db.query('dItems/pcategory',{key:'PROMO',group:true}).then(function(result){
        //   result.rows.forEach(function(row){
        //     console.log(row.key);
        //   });
        //   console.log(result);
        // }));

    }
  }
})();