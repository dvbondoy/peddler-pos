(function() {
'use strict';

  angular
    .module('app.sales')
    .controller('SalesController', SalesController);

  SalesController.$inject = ['$scope', 'Category', '$ionicActionSheet', 'Items', '$ionicModal'];
  function SalesController($scope, Category, $ionicActionSheet, Items, $ionicModal) {
    var vm = this;
    vm.categories;
    vm.items;
    vm.category;
    vm.item;
    vm.quantity = 1;
    vm.filterText = 'Categories';
    vm.tab = {active:'library'};
    vm.order = {
      items:[],
      discount:0,
      total_items:0,
      total_count:0,
      total_amount:0
    };
    vm.customer = {
      name:'Walk-In',
      notes:''
    };
    
    getCategories();
    getItems();
    
    function getCategories() {
      Category.get().then(function(data) {
        vm.categories = data; 
        // console.log(data);
      });
    }

    function getItems() {
      Items.get().then(function(data) {
        vm.items = data;
      });
    }

    $ionicModal.fromTemplateUrl('sales/templates/category-items-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.categoryItemsModal = modal;
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

    $scope.getCategoryItems = function(category) {
      vm.category = category;

      Items.get('items_'+category._id, 'items_'+category._id+'\uffff').then(function(data) {
        vm.items = data;
      });
      
      $scope.categoryItemsModal.show();
    }

    // add/update and item to order object
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

    // update order object info
    function updateOrder() {
      var amount = 0;

      // calculate total amount
      for(var i = 0; i < vm.order.items.length; i++) {
        amount += vm.order.items[i].amount;
        // console.log(vm.order.items[i].amount);
      }

      vm.order.total_items = vm.order.items.length;
      vm.order.total_count += vm.quantity;
      vm.order.total_amount = amount;
    }

    // check item if in order object
    $scope.inOrder = function(item) {
      var items = vm.order.items;
      for(var i = 0; i < items.length; i++) {
        if(item._id == items[i]._id) {
          return true;
        }
      }
      return false;
    }

    // delete an item in order object
    $scope.delOrderItem = function(item) {
      for(var i = 0; i < vm.order.items.length; i++) {
        if(item._id == vm.order.items[i]._id) {
          vm.order.items.splice(i, 1);
        }
      }

      updateOrder();
    }
    
  }
})();