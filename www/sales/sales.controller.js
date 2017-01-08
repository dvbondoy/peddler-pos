(function() {
'use strict';

  angular
    .module('app.sales')
    // .controller('SalesController', SalesController)
    .controller('SalesCtrl', SalesCtrl);

    //ship_by
    //ship_to_address_one - coming from customers table (blank)
    //ship_via - Invoiced
    //accounts_receivable - 11000
    //sales_tax_id - blank
    //number_of_distrib - blank
    //so_proposal_distrib - blank
    //gl_account - 40000
    //tax_type - 2
    //um_id - (customers table)STOCKINGUM
    //um_no_stocking_units = 1
    //stocking_quantity = quantity
  
  SalesCtrl.$inject = ['$scope', '$ionicActionSheet', '$ionicModal', '$ionicLoading','$q','DataServices','ionicDatePicker','$cordovaFile'];
  function SalesCtrl($scope,$ionicActionSheet,$ionicModal,$ionicLoading,$q,DataServices,ionicDatePicker,$cordovaFile) {
    var vm = this;
    // VIEW MODEL VARIABLES======================================================
    vm._items = [];
    vm._categories;
    vm._customers;
    vm.inventory;

    vm.user_id = null;
    vm.filterText = 'Categories';
    vm.tab = {active:'library'};
    vm.onCategory = false;
    vm.quantity = 1;  //order quantity
    vm.amount = 0;  // payment amount
    vm.customer = {name:'Walk-In'};
    vm.ship_by = moment().format("YYYY-MM-DD");
    vm.isInventory = false; //flag for creating an inventory
    vm.areaFlag = 'zip';
    vm.order = {  //will store orders
      items:[],
      customer:vm.customer,
      customer_id:null,
      discount:null,
      tax:null,
      total_items:0,
      total_count:0,
      subtotal:0,
      due_date:null,
      date:null,
      total:0
    };
    vm.payment = {  //payment methods
      cash:{
        amount:0
        },
      check:[],
      terms:{
        amount:0,
        days:0
        }
    };
    // LOCAL VARIABLES===========================================================
    var activePCategory;//holds selected parent category
    var hasActiveInventory = false;

    // MODAL VIEWS HERE =============================================
    $ionicModal.fromTemplateUrl('sales/templates/items-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.itemsModal = modal;
    });

    $ionicModal.fromTemplateUrl('sales/templates/customer-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.customerModal = modal;
    });

    $ionicModal.fromTemplateUrl('sales/templates/payment-details-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.paymentDetailsModal = modal;
    });

    $ionicModal.fromTemplateUrl('sales/templates/quantity-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.quantityModal = modal;
    });

    $ionicModal.fromTemplateUrl('sales/templates/option-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.optionModal = modal;
    });

    // DISPLAY PRODUCTS =============================================
    //get parent categories
    DataServices.getPCategories().then(function(data) {
      vm._categories = data;
    });
    // get active inventory
    DataServices.getActiveInventory().then(function(data) {
        if(!data) {
          return false;
        } else {
          vm.inventory = data;
          hasActiveInventory = true;
        }
    });

    //get current user id
    DataServices.get('_local/userId').then(function(data) {
      vm.user_id = data.userId;
    });

    function distinct(v,i,s){
      return s.indexOf(v)===i;
    }

    $scope.getCategories = function(pcategory) {

      if(!vm.onCategory) {
        DataServices.getCategories(pcategory).then(function(data) {
          //get only unique categories
          vm._categories = data.filter(distinct);
          //set our flag that were inside parent category
          vm.onCategory = true;
          //set clicked parent category
          activePCategory = pcategory;
        });
      } else {
        // getItems(activePCategory,pcategory);
        DataServices.getItems(activePCategory,pcategory).then(function(data) {
          vm._items = data;
        });
        $scope.itemsModal.show();
      }
    }

    // back button
    $scope.getPCategories = function() {
      vm.onCategory = false;
      DataServices.getPCategories().then(function(data) {
        vm._categories = data;
      });
      // getParentCategories();
    }

    $scope.chooseFilter = function() {
      // console.log(SharedProperties.getProperty());
      var menu = [
        {
          text: 'Categories'
        },
        // {
        //   text: 'All Items'
        // },
        {
          text: 'Discounts'
        }
      ];

      var hideSheet = $ionicActionSheet.show({
        buttons: menu,
        cancelText: 'Cancel',
        cancel: function() {

        },
        buttonClicked: function(index) {
          vm.filterText = menu[index].text;
          // vm._items = getItems();
          return true;
        }
      });
    }


    // ORDERS HERE =================================================
    $scope.addItemOrder = function(item) {
      var hasItem = false;
      var items = vm.order.items;

      var um_value = vm.umData.value;
      if(um_value > 1){
        vm.quantity = vm.quantity * um_value; 
      }

      items.forEach(function(i, idx){
        if(i._id == item._id) {
          hasItem = true; 
          vm.order.items[idx].quantity += vm.quantity;
          vm.order.items[idx].amount = vm.order.items[idx].quantity * vm.order.items[idx].SALESPRICE;
        }
      });

      if(!hasItem) {
        item.quantity = vm.quantity;
        item.amount = item.quantity * item.SALESPRICE;
        vm.order.items.push(item);
      }

      updateOrder();
      if(!vm.isInventory && hasActiveInventory){
        updateInventory(item,vm.quantity);
      }
    }

    $scope.removeItemOrder = function(item) {
      var items = vm.order.items;
      items.forEach(function(i, idx){
        if(item._id == i._id) {
          vm.order.items.splice(idx, 1);
        }
      });

      updateOrder();
      if(!vm.isInventory && hasActiveInventory){
        updateInventory(item,-vm.quantity);
      }
    }

    function updateOrder() {
      var amount = 0;
      var items = vm.order.items;
      // calculate total amount
      items.forEach(function(val,idx) {
        amount += val.amount;
      });

      if(vm.order.discount !== null) {
        var discount = vm.order.discount.percent * amount;
        vm.order.discount.amount = discount;
        vm.order.total = amount - discount;
      } else {
        vm.order.total = amount;
      }

      vm.order.total_items = vm.order.items.length;
      vm.order.total_count += vm.quantity;
      vm.order.subtotal = amount;
      // vm.order.customer = vm.customer;
    }

    function updateInventory(item, qty){
      var inventory = vm.inventory.items;

      inventory.forEach(function(value, index){
        if(item._id == value._id){
          value.sold == undefined ? value.sold = qty : value.sold += qty;
        }
      });
      // console.log(vm.inventory);
    }

    $scope.setQty = function(item) {
      vm.ums = [{
        "text":item.STOCKINGUM,"value":1
      } , {
        "text":item.SALESUM,"value":item.SALESUMSTOCKINGUNITS
      }];

      vm.umData = {value:1};

      vm.item = item;

      $scope.quantityModal.show();
    }

    $scope.inputQty = function() {
      var qty = parseInt(prompt("Enter Quantity"),10);
      // qty = parseInt(qty,10);

      if(qty == "" || qty == null || isNaN(qty)) {
        return 0;
      }

      vm.quantity = qty;
    }

    $scope.openDatePicker = function() {
      ionicDatePicker.openDatePicker({
        callback:function(value) {
          vm.ship_by = moment(value).format("YYYY-MM-DD");
          console.log(value);
        }
      });
    }

    $scope.assignCustomer = function(customer){
      // set customer
      vm.customer = customer;
      vm.order.customer = customer;
      vm.order.customer_id = customer._id;
      // set inventory to false
      // just to be sure that we're creating sale
      vm.isInventory = false;

      $scope.customerModal.hide();
    }

    $scope.getCustomerList = function(area,zip,city,address) {
      switch(area){
        case 'zip':
          $q.when(_db.query('customers_ddoc/zip',{group:true},function(err,res){
            if(err){console.log(err);}

            vm._customers = res.rows;
            // console.log(vm._customers);
          }));
          break;
        case 'city':
          // console.log(zip);
          vm.zip = zip.key;
          $q.when(_db.query('customers_ddoc/city',{include_docs:true,startkey:zip.key,endkey:zip.key+'\uffff'},function(err,res){
            if(err){console.log(err);}

            var cities = [];
            // console.log(res);
            res.rows.forEach(function(row){
              cities.push(row.doc.bill_to_city);
            });
            vm._customers = cities.filter(distinct);
            // console.log(vm._customers);
          }));
          break;
        case 'address':
          vm.city = city;

          $q.when(_db.query('customers_ddoc/address', {include_docs:true,key:[zip,city]},function(err,res){
            if(err){console.log(err);}

            var address = [];
            res.rows.forEach(function(row){
              address.push(row.doc.bill_to_address_two);
            });
            vm._customers = address.filter(distinct);
            // console.log(vm._customers);
          }));
          break;
        case 'customer':
          $q.when(_db.query('customers_ddoc/customer', {include_docs:true,key:[zip,city,address]},function(err,res){
            if(err){console.log(err);}

            var customer = [];
            res.rows.forEach(function(row){
              customer.push(row.doc);
            });
            vm._customers = customer;
            // console.log(vm._customers);
          }));
        break;
      }
    }

    // PROCESS PAYMENTS ==============================================================
    $scope.addPayment = function() {
      var menu = [
        {text:'Cash'},{text:'Terms'},{text:'Check'}
      ];

      var hideSheet = $ionicActionSheet.show({
        buttons: menu,
        cancelText: 'Cancel',
        canel:function(){

        },
        buttonClicked:function(index){
          switch(index){
            case 0:
              vm.payment.cash.amount = vm.amount;
              break;
            case 1:
              var days = prompt("Enter number of Days.", "15");

              //filter this to accept numbers
              if(days == "") {
                return;
              }

              vm.payment.terms.amount = vm.amount;
              vm.payment.terms.days = days;
              vm.order.due_date = moment().add(days, "days");
              break;
            case 2:
              break;
          }
          return true;
        }
      });
    }

    $scope.keyPressed = function(keyCode) {
      // TODO: process keycode here
      switch (keyCode) {
        case -1:
          vm.amount = 0;
          break;
        case -2:
          // addCustomValue();
          break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 0:
          enter(keyCode);
          break;
        default:
        // Do nothing
      }
    }

     
    /**
     * used by keyPressed function
     * 
     * @param {any} keyCode
     */
    function enter(keyCode) {
      vm.amount = vm.amount * 10 + parseInt(keyCode.toString());
      // console.log(vm.amount);
    }

    // FINISH SALE AND SAVE TO DATABSE =================================================
    $scope.checkOut = function() {
      // console.log(vm.order);
      var now = moment();
      var payment = totalPayment();
      var sale = vm.order;
      var id; //sales representative id

      DataServices.get('_local/userId').then(function(data) {
        id = data.userId;
        console.log(data);
      });

      sale._id = "sales_"+now;
      sale.date = now;
      sale.ship_date = vm.ship_by;
      sale.user_id = vm.user_id;
      sale.doc_type = 'sales';
      sale.payment = vm.payment;
      // console.log(sale);

      if(payment < vm.order.total) {
        alert('Insufficient Payment');
      } else {
        DataServices.put(sale).then(function(result) {
          console.log(result);
          if(result.ok) {
            alert('Checkout done.');
            DataServices.get(result.id).then(function(data) {
              exportToCSV(data);
            });
          }
          resetVars();
        });
        DataServices.put(vm.inventory).then(function(result) {
          console.log(result);
        });
        DataServices.getActiveInventory().then(function(data) {
          vm.inventory = data;
        });
      }

      if(payment > vm.order.total) {
        var change = payment - vm.order.subtotal;
        alert("CHANGE: Php " + change);
      }
    }

    function resetVars(){
      vm.order.items = [];
      vm.order.total = 0;
      vm.payment = {cash:{},terms:{},check:[]};
      // vm.customer.company = 'Walk-In';
      vm.amount = 0;
      vm.quantity = 1;
      // getInventory();
    }

    function totalPayment() {
      var amount = 0;
      // get cash
      amount += vm.payment.cash.amount;
      // get terms
      amount += vm.payment.terms.amount;
      // get check
      for(var i = 0; i < vm.payment.check.length; i++) {
        amount += vm.payment.check[i].amount;
      }

      return amount;
    }

    // INVENTORY ==================================================================
    $scope.newInventory = function(){
      DataServices.getActiveInventory().then(function(data) {
        if(data !== false) {
          alert('You have an active inventory. Close it first to create new one.');
        } else {
          vm.isInventory = true;
        }
      });
    }

    $scope.saveInventory = function() {
      var inventory = vm.order;
      var now = moment();

      inventory._id = 'inventory_'+now;
      inventory.doc_type = 'inventory';
      inventory.status = 'active';
      inventory.date = now;
      inventory.customer = null;

      DataServices.saveInventory(inventory).then(function(data){
        resetVars();
        vm.isInventory = false;
      });

    }

    function exportToCSV(sale) {
      console.log(sale);
      var csv = '';
      var header = '"Customer ID",'+
                    '"Sales Order Proposal #",'+
                    '"Date",'+
                    '"Ship By",'+
                    '"Closed",'+
                    '"Ship to Address-Line One",'+
                    '"Ship to Address-Line Two",'+
                    '"Ship to City",'+
                    '"Ship to Zipcode",'+
                    '"Ship Via",'+
                    '"Displayed Terms",'+
                    '"Sales Representative ID",'+
                    '"Accounts Receivable Account",'+
                    '"Sales Tax ID",'+
                    '"Number of Distributions",'+
                    '"SO/Proposal Distribution",'+
                    '"Quantity",'+
                    '"Item ID",'+
                    '"Description",'+
                    '"G/L Account",'+
                    '"Unit Price",'+
                    '"Tax Type",'+
                    '"U/M ID",'+
                    '"U/M No. of Stocking Units",'+
                    '"Stocking Quantity",'+
                    '"Stocking Unit Price",'+
                    '"Amount"';
      
      csv += header+'\r\n';

      var sales_id = sale._id+'_'+sale.customer_id;

      sale.items.forEach(function(val, idx) {
        var row = '';
        row += '"'+sale.customer_id+'",'+//custmer id
                '"'+sales_id+'",'+//sales order prop
                '"'+moment(sale.date).format('MM/DD/YYYY')+'",'+//date
                '"'+moment(sale.ship_date).format('MM/DD/YYYY')+'",'+//ship by
                '"FALSE",'+//closed
                '"",'+//address one
                '"'+sale.customer.bill_to_address_two+'",'+//address one
                '"'+sale.customer.bill_to_city+'",'+//city
                '"'+sale.customer.bill_to_zip+'",'+//zip
                '"Invoiced",'+//ship via
                '"NET '+sale.payment.terms.days+' DAYS",'+//Displayed terms
                '"'+sale.user_id+'",'+//sales representative
                '"11000",'+//Accounts Receivable
                '"",'+//sales tax id
                '"",'+//number of Distribution
                '"",'+//so Proposal Distribution
                '"'+val.quantity+'",'+
                '"'+val._id.slice(6)+'",'+
                '"'+val.DESCRIPTION+'",'+
                '"40000",'+
                '"'+val.SALESPRICE+'",'+
                '"2",'+
                '"'+val.STOCKINGUM+'",'+
                '"1",'+
                '"'+val.quantity+'",'+
                '"'+val.SALESPRICE+'",'+
                '"-'+val.amount+'"';

        csv += row+'\r\n';
      });
      // console.log(csv);

      $cordovaFile.writeFile(cordova.file.externalRootDirectory,sales_id+'.csv',csv,true)
        .then(function(success){
          // console.log('success')
          console.log(JSON.stringify(success));
        },function(error){
          console.log(JSON.stringify(error));
        });

      // BTPrinter.list(function(data){
      //   console.log('success');
      //   console.log(data);
      // },function(error){
      //   console.log('error');
      //   console.log(error);
      // });

      BTPrinter.connect(function(data){
        console.log('connected');
        console.log(data);

        BTPrinter.printText(function(data){
          console.log('printed');
          console.log(data);
          // sleep(20);
          // BTPrinter.disconnect(function(data){
          //   console.log(data);
          // },function(err){
          //   console.log(err);
          // });
        },function(error){
          console.log(error);
        },'Hello Printer');
      },function(error){
        console.log(error);
      },"Bluetooth Printer");

    }

  }

  
})();
