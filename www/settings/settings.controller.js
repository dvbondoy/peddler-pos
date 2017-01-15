(function() {
'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', SettingsController)
    .controller('PrinterController',PrinterController);
    // .controller('InventoryController', InventoryController);

  SettingsController.$inject = ['$scope','$q','$ionicModal','$ionicLoading','DataServices'];
  function SettingsController($scope,$q,$ionicModal,$ionicLoading,DataServices) {

    // var test = DataServices.Category().get();
    // console.log(test);

    var vm = this;
    
    vm.USER_ID = {};
    vm.SERVER_LIST = {};
    vm.GO_LOCK = false;   //general options lock flag

    // var firstRun = false;
    //FIRST RUN
    // $q.when(_db.info().then(function(info){
    //   console.log(info);
    //   if(info.doc_count == 0){
    //     createDdocs();
    //     firstRun = true;
    //   }
    // }));

    createDdocs();

    function createDdocs() {
      DataServices.get('_design/items_ddoc').then(function(docs){
        if(docs.message == 'missing'){
          createItemsDdoc();
        }
      });

      DataServices.get('_design/customers_ddoc').then(function(docs){
        if(docs.message == 'missing'){
          createCustomersDdoc();
        }
      });

      DataServices.get('_design/inventory_ddoc').then(function(docs){
        if(docs.message == 'missing'){
          createInventoryDdoc();
        }
      });

      DataServices.get('_design/sales_ddoc').then(function(docs){
        if(docs.message == 'missing'){
          createSalesDdoc();
        }
      });
    }

    // getUserID();
    DataServices.get('_local/userId').then(function(docs){
      if(docs.message == 'missing'){
        // vm.USER_ID = false;
        return 0;
      }

      vm.USER_ID = docs;
    });

    // getServerList();
    DataServices.get('_local/server_list').then(function(docs){
      if(docs.message == 'missing'){return 0;}
      vm.SERVER_LIST = docs;
    });

    // getDailyQuota();
    DataServices.get('_local/daily_quota').then(function(quota){
      vm.DAILY_QUOTA = quota;
    });
    //get checkout options
    DataServices.get('_local/checkout_options').then(function(options){
      console.log(options);
      if(options.message == 'missing') { return 0;}

      vm.checkout_options = {
        printer:options.printer,
        export:options.export
      };
    });

    //get printer
    DataServices.get('_local/printer').then(function(printer){
      if(printer.message == 'missing'){return 0;}

      // console.log(JSON.stringify(printer));
      vm.printer = printer.printer;
    });

    $scope.printerOptions = function() {
      DataServices.get('_local/checkout_options').then(function(docs){
        if(docs.message == 'missing') {
          //create new
          var printer = {
            _id : '_local/checkout_options',
            printer:vm.checkout_options.printer
          };

          DataServices.put(printer);
        } else {
          //update
          docs.printer = vm.checkout_options.printer;
          DataServices.put(docs);
        }
      });
    }

    $scope.exportOptions = function() {
      DataServices.get('_local/checkout_options').then(function(docs){
        if(docs.message == 'missing') {
          var csv = {
            _id:'_local/checkout_options',
            csv:vm.checkout_options.export
          };
          DataServices.put(csv);
        } else {
          // update
          docs.export = vm.checkout_options.export;
          DataServices.put(docs);

        }
      });
    }

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

      if(id == "" || id == null) {
        return 0;
      }

      vm.USER_ID._id = '_local/userId';
      vm.USER_ID.userId = id;

      // insert user 
      // $q.when(_db.put(vm.USER_ID));
      DataServices.put(vm.USER_ID);

      // create default servers/
      DataServices.get('_local/serve_list').then(function(docs) {
        if (docs.message == 'missing') {
          var servers = {
            _id:'_local/server_list',
            customers:'http://admin:nimda@localhost:5984/customers_'+id,
            items:'http://admin:nimda@localhost:5984/items',
            sales:'http://admin:nimda@localhost:5984/sales_'+id,
            inventory:'http://admin:nimda@localhost:5984/inventory_'+id,
            discounts:'http://admin:nimda@localhost:5984/discounts'
          };
          
          DataServices.put(servers);
        }
      });

      // $q.when(_db.put(servers));
   }

    function getUserID() {
      $q.when(_db.get('_local/userId')).then(function(data){
        // console.log(data);
        vm.USER_ID = data;
      });
    }

    $scope.setDailyQuota = function() {
      var quota = prompt('Enter daily quota');

      if(quota == "" || quota == null) {
        return 0;
      }

      var daily_quota = {
        _id:'_local/daily_quota',
        quota:quota
      };

      DataServices.get('_local/daily_quota').then(function(docs) {
        console.log(docs);
        if(docs.message == 'missing') {
          //create new
          DataServices.put(daily_quota);
        } else {
          //update
          docs.quota = quota;
          DataServices.put(docs);
        }

        vm.DAILY_QUOTA = {quota:quota};
      });
    }


    // SERVER SETUP =======================================================
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
        alert(JSON.stringify(error));
        $ionicLoading.hide();
      })
      .on('complete',function(result){

        // check items design doc existince
        // _db.get('_design/items_ddoc').catch(function(error){
        //   if(error.message == 'missing') {
        //     createItemsDdoc();
        //   }
        // });
        $ionicLoading.hide();
        alert('Items update complete.');
      })
      .on('denied',function(err){
        alert(JSON.stringify(err));
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
        // _db.get('_design/customers_ddoc').catch(function(error){
        //   if(error.message == 'missing') {
        //     createCustomersDdoc();
        //   }
        // });
        $ionicLoading.hide();
        alert('Customers update complete.')
      }));
    }

    $scope.updateDiscounts = function() {
      var remote = new PouchDB(vm.SERVER_LIST.discounts);
      $ionicLoading.show({});
      $q.when(_db.replicate.from(remote)
        .on('error',function(error){
          alert(JSON.stringify(error));
        })
        .on('complete',function(result){
          $ionicLoading.hide();
          alert('Discounts update complete');
        }));
    }

    $scope.uploadInventory = function() {
      $ionicLoading.show({});
      var remote = new PouchDB(vm.SERVER_LIST.inventory);

      $q.when(_db.replicate.to(remote,{
        filter:function(doc){
          return doc.doc_type == 'inventory';
        }
      })
      .on('error',function(error){
        console.log(error);
        $ionicLoading.hide();
      })
      .on('complete',function(result){
        console.log(result);
        $ionicLoading.hide();
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

    // DDOCS BELOW ====================================================================
    function createSalesDdoc() {
      var ddoc = {
        _id: '_design/sales_ddoc',
        views: {
          'byDate': {
            map: function(doc) {
              if(doc.doc_type == 'sales') {
                emit(doc.date, null);
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

    function createDiscountsDdoc() {
      var ddoc = {
        _id:'_design/discounts_ddoc',
        views:{
          'all':{
            map:function(doc){
              if(doc.doc_type == 'discounts'){
                emit(doc._id,null);
              }
            }.toString()
          }
        }
      };

      $q.when(_db.put(ddoc));
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
          },
          'city':{
            map:function(doc){
              // if(doc.bill_to_city){
              emit(doc.bill_to_zip,null);
              // }
            }.toString()
          },
          'address':{
            map:function(doc){
              // if(doc.bill_to_address_two){
              emit([doc.bill_to_zip,doc.bill_to_city],null);
              // }
            }.toString()
          },
          'customer':{
            map:function(doc){
              emit([doc.bill_to_zip,doc.bill_to_city,doc.bill_to_address_two],null);
            }.toString()
          }
        }
      };

      $q.when(_db.get('_design/customers_ddoc').then(function(result){
        console.log(result);
      }));

      $q.when(_db.put(ddoc).catch(function(error){
        console.log(error);
      }).then(function(result){
        console.log(result);
      }));
    }

  }

  PrinterController.$inject = ['$scope', 'DataServices', '$ionicModal', '$ionicLoading'];
  function PrinterController($scope, DataServices, $ionicModal, $ionicLoading) {
    var vm = this;

    vm.printer = 'Click to set';

    $ionicModal.fromTemplateUrl('settings/templates/printer-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.printerModal = modal;
    });

    DataServices.get('_local/printer').then(function(data){
      if(data.error){
        console.log(data);
        vm.printer = 'Click to set';
      } else {
        vm.printer = data.printer;
      }
    });
    // document.addEventListener('deviceready', function() {
    //   // BTPrinter.list(function(data){
    //   //   console.log(data);
    //   //   vm.devices = data;
    //   // },function(error){
    //   //   console.log(error);
    //   // });
    //   scanPrinter();
    // });

    $scope.scanPrinter = scanPrinter;

    function connect(printer) {
      BTPrinter.connect(function(succes){
        vm.connected = true;
        // vm.printer = printer;
      },function(error){
        alert(error);
      },printer);
    }

    function disconnect() {
      BTPrinter.disconnect(function(success) {
        console.log(success);
        vm.connected = false;
      },function(error){
        console.log(error);
      });
    }

    $scope.testPrint = function() {
      var obj = [
        {name:"apple",price:"10.00"},
        {name:"orange",price:"12.00"},
        {name:"mango",price:"50.00"}
      ];

      BTPrinter.connect(function(success){
        console.log(success);
        obj.forEach(function(v,i){
          BTPrinter.printText(function(success){
            console.log(success);

          },function(error){
            console.log(error);
          },v.name+"     "+v.price+"\n");
        });

        BTPrinter.disconnect();

      },function(error){
        console.log(error);
      },vm.printer);
    }

    $scope.testConnection = function() {
      BTPrinter.connect(function(success){
        BTPrinter.disconnect();
        alert('Connected!');
      },function(error){
        alert(error);
      },vm.printer);
    }

    $scope.savePrinter = function(printer) {
      DataServices.get('_local/printer').then(function(data){
        if(data.error) {
          DataServices.put({_id:'_local/printer',printer:printer}).then(function(data){
            if(data.ok){
              vm.printer = printer;
            }
          });
        }else{
          var p = data;
          p.printer = printer;
          DataServices.put(p).then(function(data){
            if(data.ok){
              vm.printer = printer;
            }
          });
        }
      });
    }

    function scanPrinter() {
      $ionicLoading.show({template:'Scanning...'})
      BTPrinter.list(function(data){
        console.log(data);
        vm.devices = data;
        $ionicLoading.hide();
        $scope.printerModal.show();
      },function(error){
        alert(error);
      });
    }

    $scope.posCommand = function(command){
      var pos_command = "1B 64 01";
      BTPrinter.connect(function(data){
        console.log(data);
        // BTPrinter.printPOSCommand(function(data){
        //   console.log(data);
        // },function(error){
        //   console.log(error);
        // },pos_command);
        BTPrinter.printPOSCommand(function(){},function(){},"1B 40");
        BTPrinter.printPOSCommand(function(){},function(){},pos_command);

        BTPrinter.disconnect();
      },function(error){
        console.log(data);
      },vm.printer);
      
    }
  }

})();