(function() {
'use strict';

  angular
    .module('app.sales')
    .controller('SalesController', SalesController);

  SalesController.$inject = ['$scope', 'Category', '$ionicActionSheet', 'Items', '$ionicModal', 'Customer', 'Sales', 'Discounts', 'moment'];
  function SalesController($scope, Category, $ionicActionSheet, Items, $ionicModal, Customer, Sales, Discounts, moment) {
    var vm = this;
    vm.categories; //will store all categories
    vm.items; //will store all items
    vm.customers; //will store all customers
    vm.discounts;
    vm.category;  //will store a category
    vm.item;  //will store an item
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
        amount:0,
        notes:''
        },
      check:[],
      terms:{
        amount:0,
        days:0,
        notes:''
        },
      total:0,
      tendered:0,
      change:0
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
      Category.get().then(function(data) {
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
      });
    }

    /**
     * Utility function
     * Fetch customers
     */
    function getCustomers() {
      Customer.get().then(function(data) {
        vm.customers = data;
        console.log(vm.customers);        
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

      Items.get('items_'+category._id, 'items_'+category._id+'\uffff').then(function(data) {
        vm.items = data;
      });
      
      $scope.categoryItemsModal.show();
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
      var sale = {
        "_id":"sales_" + now,
        "items":vm.order.items,
        "customer":vm.customer,
        "payment":vm.payment,
        "discount":vm.order.discount,
        "total_items":vm.order.total_items,
        "total_count":vm.order.total_count,
        "subtotal":vm.order.subtotal,
        "due_date":vm.order.due_date,
        "date":now,
        "total":vm.order.total
      };

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
        var change = payment - vm.order.total;
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
              // var due = new Date(new Date().getTime() + (5*24*60*60*1000));
              console.log(due);
              vm.payment.terms.amount = vm.amount;
              vm.payment.terms.days = days;
              vm.order.due_date = due;
              //date.setTime( date.getTime() + days * 86400000 );
              break;
            case 2:
              break;
          }
          // console.log(vm.payment);
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
      console.log(vm.amount);
    }

  }
})();