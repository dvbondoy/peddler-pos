(function() {
'use strict';

  angular
    .module('app.sales')
    .controller('SalesController', SalesController);

    SalesController.$inject = ['$scope','Item','$ionicModal','ionicDatePicker','$ionicActionSheet'];
    function SalesController($scope,Item,$ionicModal,ionicDatePicker,$ionicActionSheet) {
      var vm = this;
      var category = null;

      vm.tab = {active:'library'};
      vm.filterText = 'Items';
      vm.order = {
        items:[],
        discount:{discounts:[],total:0},
        customer:{company:'Walk-in'},
        subtotal:0,
        tax:0,
        charge:0,
        payments:{cash:{},terms:{},check:[]}
      };
      vm.amount = 0;

      getCategories(category);
      getItemsByCategory(category);

      // prep modals
      $ionicModal.fromTemplateUrl('sales/templates/quantity-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.quantityModal = modal;
      });

      $ionicModal.fromTemplateUrl('sales/templates/checkout-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.checkoutModal = modal;
      });

      $ionicModal.fromTemplateUrl('sales/templates/customer-modal.html',{
        scope:$scope,
        animation:'slide-in-up',
      }).then(function(modal){
        $scope.customerModal = modal;
      });
      // end of modals

      function getCategories(id) {
        Item.getCategories(id).then(function(result){

          console.log('getCategories');
          console.log(result);

          category !== null ? vm.showBack = true : vm.showBack = false;

          vm.categories = result;
        });
      }

      function getItemsByCategory(category) {
        Item.getItemsByCategory(category).then(function(result){

          console.log('getItemsByCategory');
          console.log(result);

          vm.items = result;
        });
      }

      $scope.openCategory = function(id) {

        console.log('openCategory');
        console.log(id);

        category = id;
        getCategories(category);
        getItemsByCategory(category);
      }

      $scope.prevCategory = function() {
        category = category.substring(0,category.lastIndexOf('/'));
        
        if(category == 'category/null'){category = null;}

        getCategories(category);
        getItemsByCategory(category);
      }

      $scope.selectItem = function(item) {
        vm.item = item;
        vm.quantity = 1;

        console.log('selectItem');
        console.log(vm.item);
        
        $scope.quantityModal.show();
      }

      $scope.addToOrder = function(item) {
        item.quantity = vm.quantity;
        item.amount = vm.quantity * item.price;
        var inOrder = false;

        vm.order.items.forEach(function(value,index){
          if(item._id == value._id){
            vm.order.items[index].quantity = item.quantity;
            vm.order.items[index].amount = item.amount;
            inOrder = true;
          }
        });

        if(!inOrder){
          vm.order.items.push(item);
        }

        updateOrderInfo();
      }

      $scope.removeToOrder = function(item) {
        if(confirm('Remove Item from order?')){
          vm.order.items.forEach(function(value, index){
            if(value._id == item._id){
              vm.order.items.splice(index,1);
            }
          });

          updateOrderInfo();
        }
      }

      $scope.setShipDate = function() {
        ionicDatePicker.openDatePicker({
          callback:function(value) {
            vm.ship_by = moment(value).format("YYYY-MM-DD");
          }
        });
      }

      function updateOrderInfo() {
        vm.order.subtotal = 0;

        console.log('updateOrderInfo');

        vm.order.total_items = vm.order.items.length;
        vm.order.items.forEach(function(val){
          vm.order.subtotal += val.amount;
        });
        vm.order.charge = vm.order.subtotal - (vm.order.discount.total + vm.order.tax);

        console.log(vm.order);
      }

      $scope.chooseFilter = function() {
        // console.log(SharedProperties.getProperty());
        var menu = [
          {
            text: 'Items'
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
            return true;
          }
        });
      }

      $scope.addPayment = function() {
        vm.payments = {
          cash:{},
          terms:{},
          check:[]
        };

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
                vm.order.payments.cash.amount = vm.amount;
                // vm.payments.cash.amount = vm.amount;
                break;
              case 1:
                var days = parseInt(prompt("Enter number of Days"),10);

                //filter this to accept numbers
                if(days == "" || days == null || isNaN(days)) {
                  alert('Invalid number');
                  return 0;
                }

                // vm.order.payments.push({terms:{amount:vm.amount,days:days}});
                vm.order.payments.terms = {amount:vm.amount,days:days};
                // vm.payments.terms.amount = vm.amount;
                // vm.payments.terms.days = days;
                vm.order.due_date = moment().add(days, "days");
                break;
              case 2:
                break;
            }
            console.log(vm.order);

            return true;
          }
        });

        console.log('addPayment');
        console.log(vm.payments);
      }

      $scope.checkout = function() {
        var sale = vm.order;
        sale.type = 'sale';
        sale._id = 'sale/'+Date.now();
        sale.ship_date = Date.now();

        var total_payment = function() {
          var amount = 0;

          amount += vm.payments.cash.amount;
          amount += vm.payments.terms.amount;

          vm.payments.check.forEach(function(val){
            amount += val.amount;
          });
          return amount;
        };

        console.log(sale);

        if(total_payment < vm.order.charge){
          alert('Insuficient amount.');
          return 0;
        }


      }

      $scope.$on('$destroy', function(){
        $scope.quantityModal.remove();
        $scope.checkoutModal.remove();
        $scope.customerModal.remove();
      });

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
