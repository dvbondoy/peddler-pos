(function() {
'use strict';

  angular
    .module('app.sales')
    .controller('SalesController', SalesController)
    .controller('SalesCtrl', SalesCtrl);
  
  SalesCtrl.$inject = ['$scope', '$ionicActionSheet', '$ionicModal', '$ionicLoading','$q'];
  function SalesCtrl($scope,$ionicActionSheet,$ionicModal,$ionicLoading,$q) {
    var vm = this;
    // VIEW MODEL VARIABLES======================================================
    vm.ITEMS = [];
    vm.CATEGORIES;
    vm.CUSTOMERS;
    vm.INVENTORY;

    vm.filterText = 'Categories';
    vm.tab = {active:'library'};
    vm.onCategory = false;
    vm.quantity = 1;  //order quantity
    vm.amount = 0;  // payment amount
    vm.customer = {name:'Walk-In'};
    vm.isInventory = false; //flag for creating an inventory
    vm.areaFlag = 'zip';
    vm.order = {  //will store orders
      items:[],
      customer:{},
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
    var activePCategory;
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

    // DISPLAY PRODUCTS =============================================
    getParentCategories();
    getInventory();
    // getCustomersList();

    function getParentCategories() {
      $q.when(_db.query('items_ddoc/pcategories',{group:true},function(error,result){
        var pcats = [];
        result.rows.forEach(function(row){
          pcats.push(row.key[0]);
        });
        // console.log(pcats);
        vm.CATEGORIES = pcats;
      }));
    }

    function distinct(v,i,s){
      return s.indexOf(v)===i;
    }

    $scope.getCategories = function(pcategory) {

      if(!vm.onCategory) {
        $q.when(_db.query('items_ddoc/categories',{include_docs:true,startkey:pcategory,endkey:pcategory+'\uffff'},function(error, result){
          var cats = [];
          result.rows.forEach(function(row){
            cats.push(row.doc.CATEGORY);
          });
          // get distinct categories
          // vm.CATEGORIES = cats.filter((v,i,a) => a.indexOf(v) === i);
          vm.CATEGORIES = cats.filter(distinct);

          // set flag to true to view items on next click
          vm.onCategory = true;
          activePCategory = pcategory;
        }));

      } else {
        getItems(activePCategory,pcategory);
      }
    }

    function getItems(pcategory,category) {
      vm.ITEMS = [];
      $q.when(_db.query('items_ddoc/itemsByCategories',{include_docs:true,key:[pcategory,category]},function(error,result){
        result.rows.forEach(function(row){
          vm.ITEMS.push(row.doc);
        });
      }));
      $scope.itemsModal.show();
    }

    function getInventory() {
      $q.when(_db.query('inventory_ddoc/active',{
        include_docs:true,key:'active'
      },function(error,result){
        if(result.rows.length == 1){
          // return result.rows[0].doc;
          vm.INVENTORY = result.rows[0].doc;
          hasActiveInventory = true;
          // console.log(vm.INVENTORY);
        }
      }).catch(function(error){
        // console.log(error);
      }));
    }

    // back button
    $scope.getPCategories = function() {
      vm.onCategory = false;
      getParentCategories();
    }

    $scope.chooseFilter = function() {
      // console.log(SharedProperties.getProperty());
      var menu = [
        {
          text: 'Categories'
        },
        {
          text: 'All Items'
        },
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
          // vm.items = getItems();
          return true;
        }
      });
    }


    // ORDERS HERE =================================================
    $scope.addItemOrder = function(item) {
      var hasItem = false;
      var items = vm.order.items;

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

      // calculate total amount
      for(var i = 0; i < vm.order.items.length; i++) {
        amount += vm.order.items[i].amount;
        // console.log(vm.order.items[i].amount);
      }

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
      vm.order.customer = vm.customer;

      // console.log('amount due');
      // console.log(vm.order.total);
    }

    function updateInventory(item, qty){
      vm.INVENTORY.items.forEach(function(value, index){
        if(item._id == value._id){
          value.sold == undefined ? value.sold = qty : value.sold += qty;
        }
      });
      // console.log(vm.INVENTORY);
    }

    $scope.getCustomerList = function(area,zip,city,address) {
      switch(area){
        case 'zip':
          $q.when(_db.query('customers_ddoc/zip',{group:true},function(err,res){
            if(err){console.log(err);}

            vm.CUSTOMERS = res.rows;
            // console.log(vm.CUSTOMERS);
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
            vm.CUSTOMERS = cities.filter(distinct);
            // console.log(vm.CUSTOMERS);
          }));
          break;
        case 'address':
          vm.city = city;
          // console.log(vm.zip);
          // console.log(vm.city);

          $q.when(_db.query('customers_ddoc/address', {include_docs:true,key:[zip,city]},function(err,res){
            if(err){console.log(err);}

            var address = [];
            res.rows.forEach(function(row){
              address.push(row.doc.bill_to_address_two);
            });
            vm.CUSTOMERS = address.filter(distinct);
            // console.log(vm.CUSTOMERS);
          }));
          break;
        case 'customer':
          $q.when(_db.query('customers_ddoc/customer', {include_docs:true,key:[zip,city,address]},function(err,res){
            if(err){console.log(err);}

            var customer = [];
            res.rows.forEach(function(row){
              customer.push(row.doc);
            });
            vm.CUSTOMERS = customer;
            // console.log(vm.CUSTOMERS);
          }));
        break;
      }
    }

    // function getCustomersList(zip,city,address) {
    //   $q.when(_db.query('customers_ddoc/zip',{group:true},function(err,res){
    //     if(err){console.log(err);}
    //     vm.CUSTOMERS = res.rows;
    //   }));
    // }

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
              var due = moment().add(days, "days");
              vm.payment.terms.amount = vm.amount;
              vm.payment.terms.days = days;
              vm.order.due_date = due;
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
      var now = moment();
      var payment = totalPayment();
      var sale = vm.order;
      var id; //sales representative id

      // get our current user
      $q.when(_db.get('_local/userId').then(function(data){
        console.log(data);
        id = data.userId;
      }).catch(function(error){
        console.log(error);
      }));

      sale._id = "sales_"+now;
      sale.date = now;
      sale.userId = id;
      sale.doc_type = 'sales';

      if(payment < vm.order.total) {
        alert('Insufficient Payment');
      } else {
        $q.when(_db.put(sale).then(function(result){
          console.log(result);
        }).catch(function(error){
          console.log(error);
        }));
        $q.when(_db.put(vm.INVENTORY).then(function(res){
          console.log(res);
        }).catch(function(err){
          console.log(err);
        }));
        //reset some Vars
        resetVars();
        getInventory();
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
      vm.customer.company = 'Walk-In';
      vm.amount = 0;
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
      $q.when(_db.query('inventory_ddoc/active',{key:'active'},function(error,result){
        if(result.rows.length > 0) {
          alert('You have an active inventory. Close it first.');
        } else {
          vm.isInventory = true;
        }
      }));
    }

    $scope.saveInventory = function() {
      var inventory = vm.order;
      var now = moment();

      inventory._id = 'inventory_'+now;
      inventory.doc_type = 'inventory';
      inventory.status = 'active';
      inventory.date = now;
      inventory.customer = null;

      $q.when(_db.put(inventory).catch(function(error){
        console.log(error);
      }).then(function(result){
        console.log(result);
        resetVars();
        vm.isInventory = false;
      }));

    }

  }

  SalesController.$inject = ['$scope', 'Category', '$ionicActionSheet', 'Items', '$ionicModal', 'Customer', 'Sales', 'Discounts', 'moment'];
  function SalesController($scope, Category, $ionicActionSheet, Items, $ionicModal, Customer, Sales, Discounts, moment) {
    var vm = this;

    vm.categories; //will store all categories
    vm.subcategories;
    vm.category;  //will store a category

    vm.items; //will store all items
    vm.item;  //will store an item

    vm.onSubCategory = false;

    vm.customers; //will store all customers
    vm.discounts;
    vm.quantity = 1;  //default order quantity
    vm.filterText = 'Categories';
    vm.tab = {active:'library'};  //active tab monitoring
    vm.amount = 0;  //will hold amount of each payment
    vm.order = {  //will store orders
      items:[],
      customer:{},
      discount:null,
      tax:null,
      total_items:0,
      total_count:0,
      subtotal:0,
      due_date:null,
      date:null,
      total:0
    };
    vm.customer = { //default customer
      company:'Walk-In',
      notes:''
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
    
    getCategories();
    getItems();
    getCustomers();
    getDiscounts();
    
    /**
     * Utility function
     * Fetch categories
     */
    function getCategories() {
      Category.getCategories().then(function(data) {
        vm.categories = data; 
        // console.log(data);
      });
    }

    /**
     * Utility function
     * Fetch all items
     */
    function getItems() {
      Items.get().then(function(data) {
        vm.items = data;
        // console.log(data);
      });
    }

    /**
     * Utility function
     * Fetch customers
     */
    function getCustomers() {
      Customer.get().then(function(data) {
        vm.customers = data;
        // console.log(vm.customers);        
      });
    }

    /**
     * Utility function
     * Fetch discounts
     */
    function getDiscounts() {
      Discounts.get().then(function(data) {
        vm.discounts = data;
      });
    }

    $ionicModal.fromTemplateUrl('sales/templates/sub-categories-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.subCategoriesModal = modal;
    });

    $ionicModal.fromTemplateUrl('sales/templates/category-items-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.categoryItemsModal = modal;
    });

    $ionicModal.fromTemplateUrl('sales/templates/customer-select-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.customerModal = modal;
    });

    $ionicModal.fromTemplateUrl('sales/templates/payment-details-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.paymentDetailsModal = modal;
    });

    $scope.chooseFilter = function() {
      var menu = [
        {
          text: 'Categories'
        },
        {
          text: 'All Items'
        },
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
          vm.items = getItems();
          return true;
        }
      });
    }

    /**
     * Get items of a 'category'
     * 
     * @param {any} category
     */
    $scope.getCategoryItems = function(category) {
      vm.category = category;

      Items.getByCategory(category).then(function(data) {
        vm.items = data;
      });
      
      $scope.categoryItemsModal.show();
    }

    $scope.getSubCategories = function(category) {
      // $scope.subCategoriesModal.show();
        vm.onSubCategory = true;
      Category.getSubCategories(category.category).then(function(data){
        // vm.subcategories = data;
        if(data.length == 0) {
          $scope.getCategoryItems(category.category);
        } else {
          vm.categories=data;
        }
        console.log(data);
      });
    }
    
    $scope.getCategories = function(){
      vm.onSubCategory = false;
      getCategories();
    }

    /**
     * Add an item to vm.order var
     * 
     * @param {any} item
     */
    $scope.addItem = function(item) {
      var hastItem = false;
      var items = vm.order.items;
      var amount = 0;

      //check if in order
      for(var i = 0; i < items.length; i++) {
        // item in order object already. update it
        if(items[i]._id == item._id) {
          hastItem = true;
          vm.order.items[i].quantity += vm.quantity;
          vm.order.items[i].amount = vm.order.items[i].quantity * vm.order.items[i].sale_price;
        }
      }

      // item not in order object yet. add it
      if(!hastItem) {
        item.quantity = vm.quantity;
        item.amount = item.quantity * item.sale_price;
        vm.order.items.push(item);
      }

      updateOrder();
      console.log(vm.order);
    }

    /**
     * Utility function for updating data of vm.order var
     */
    function updateOrder() {
      var amount = 0;

      // calculate total amount
      for(var i = 0; i < vm.order.items.length; i++) {
        amount += vm.order.items[i].amount;
        // console.log(vm.order.items[i].amount);
      }

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
      vm.order.customer = vm.customer;

      console.log('amount due');
      console.log(vm.order.total);
    }

    /**
     * Check if 'item' is in vm.order var
     * 
     * @param {any} item
     * @returns
     */
    $scope.inOrder = function(item) {
      var items = vm.order.items;
      for(var i = 0; i < items.length; i++) {
        if(item._id == items[i]._id) {
          return true;
        }
      }
      return false;
    }

    
    /**
     * Delete an item from vm.order var
     * 
     * @param {any} item
     */
    $scope.delOrderItem = function(item) {
      for(var i = 0; i < vm.order.items.length; i++) {
        if(item._id == vm.order.items[i]._id) {
          vm.order.items.splice(i, 1);
        }
      }

      updateOrder();
    }

    
    /**
     * Insert sale to database
     * Vars used are vm.order and vm.customer
     */
    $scope.saveSale = function() {
      var now = moment();
      var payment = totalPayment();
      // console.log(payment);
      var sale = vm.order;
      sale._id = "sales_"+now;
      sale.date = now;
      // var sale = {
      //   "_id":"sales_" + now,
      //   "items":vm.order.items,
      //   "customer":vm.customer,
      //   "payment":vm.payment,
      //   "discount":vm.order.discount,
      //   "total_items":vm.order.total_items,
      //   "total_count":vm.order.total_count,
      //   "subtotal":vm.order.subtotal,
      //   "due_date":vm.order.due_date,
      //   "date":now,
      //   "total":vm.order.total
      // };

      if(payment < vm.order.total) {
        alert('Insufficient Payment');
      } else {
        Sales.add(sale);
        //reset some Vars
        vm.order.items = [];
        vm.order.total = 0;
        vm.payment = {cash:{},terms:{},check:[]};
        vm.customer.company = 'Walk-In';
        vm.amount = 0;

        Sales.get().then(function(data){
          console.log(data);
        });
      }

      if(payment > vm.order.total) {
        var change = payment - vm.order.subtotal;
        alert("CHANGE: Php " + change);
      }
    }

    /**
     * Payment
     * Var in use: vm.payment, vm.amount
     */
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
              var due = moment().add(days, "days");
              vm.payment.terms.amount = vm.amount;
              vm.payment.terms.days = days;
              vm.order.due_date = due;
              break;
            case 2:
              break;
          }
          return true;
        }
      });
    }

    $scope.addDiscount = function(discount) {
      if(vm.order.items.length !== 0) {
        vm.order.discount = discount;
        updateOrder();  
      } else {
        alert('Nothing to discount. Select item first.');
      }
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

    /**
     * A key is pressed - keypad tab
     * 
     * @param {any} keyCode
     */
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

  }
})();
