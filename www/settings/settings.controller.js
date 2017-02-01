(function() {
'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', SettingsController)
    .controller('CategoryController', CategoryController)
    .controller('DiscountController', DiscountController);

    SettingsController.$inject = ['$scope', 'PouchHelper', 'Discount'];
    function SettingsController($scope,PouchHelper,Discount) {
      var vm = this;

      Discount.getDiscounts('discount/').then(function(result){
        vm.discounts_count = result.length;
      });

      $scope.purgeDatabase = function() {
        var ask = confirm('You\'re about DELETE the database. Continue?');
        if(ask) {
          PouchHelper.purgeDB().then(function(result){
            console.log('purge');
            console.log(result);
          });
        }
      }
    }

    CategoryController.$inject = ['$scope','$ionicModal','Item'];
    function CategoryController($scope,$ionicModal,Item) {
      var vm = this;
      var _parent = null;
      var _prev_category;
      
      // controller init
      Item.initDB();
      getCategories(_parent);
      // getItems();


      //prep modals
      $ionicModal.fromTemplateUrl('settings/templates/new-item-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.newItemModal = modal;
      });

      function getCategories(parent_category) {
        console.log('getCategories');
        console.log(parent_category);

        Item.getCategories(parent_category).then(function(result){
          console.log(result);

          _parent !== null ? vm.showBack = true : vm.showBack = false;

          vm.categories = result;
        });

        Item.getItemsByCategory(_parent).then(function(result){
          console.log('getItemsByCategory');
          console.log(result);
          if(result.error){return 0;}

          vm.items = result;
        });

      }

      // function getItems() {
      //   Item.getItemsByCategory(_parent).then(function(result){
      //     console.log('getItemsByCategory');
      //     console.log(result);
      //     if(result.error){return 0;}

      //     vm.items = result;
      //   });
        
      // }

      $scope.newCategory = function() {
        console.log('newCategory');

        var input = prompt("Enter new category");
        
        if(input == undefined || input == ""){
          return false;
        }

        var id = _parent == null ? 'category/'+_parent+'/'+input : _parent+'/'+input;
        console.log(id);

        var category = {
          _id:id,
          category:input,
          parent_category:_parent,
          type:'category'
        };

        Item.addCategory(category).then(function(result){
          console.log(result);
          getCategories(_parent);
        });
      }

      $scope.saveItem = function() {
        console.log('saveITem');

        var item = {
          _id:'item/'+_parent+'/'+vm.item.description,
          category:_parent,
          description:vm.item.description,
          print_description:vm.item.print_description,
          price:vm.item.price,
          type:'item'
        };

        if(vm.isAdd){
          // add
          Item.addItem(item).then(function(result){
            console.log(result);
          }).catch(function(error){
            console.log(error);
          });
          getCategories(_parent);
        } else {
          // update
          Item.getItem(vm.item._id).then(function(result){
            if(result._id !== item._id){
              Item.removeItem(result._id);
              Item.addItem(item);
            } else {
              item._rev = result._rev;
              Item.addItem(item);
            }
            getCategories(_parent);
          });
        }

        $scope.newItemModal.hide();
      }

      $scope.newItem = function() {
        vm.isAdd = true;

        vm.item = {};

        $scope.newItemModal.show();
      }

      $scope.viewItem = function(item) {
        vm.isAdd = false;

        vm.item = item;

        $scope.newItemModal.show();
      }

      $scope.selectCategory = function(category) {
        console.log('selectCategory');
        console.log(category);

        _parent = category.id;
        getCategories(_parent);
      }

      $scope.prevCategory = function() {
        _parent = _parent.substring(0,_parent.lastIndexOf('/'));
        
        if(_parent == 'category/null'){_parent = null;}

        getCategories(_parent);
      }

      $scope.removeItem = function() {
        Item.removeItem(vm.item._id).then(function(result){
          if(result.ok){
            $scope.newItemModal.hide();
            alert(vm.item.description+' deleted!');
          }
          console.log(result);
        });
        getCategories();
      }

    }

    DiscountController.$inject = ['$scope', '$ionicModal','Discount'];
    function DiscountController($scope,$ionicModal,Discount) {
      var vm = this;

      $ionicModal.fromTemplateUrl('settings/templates/new-discount-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.newDiscountModal = modal;
      });

      $scope.$on('$destroy',function(){
        $scope.newDiscountModal.remove();
      });

      getDiscounts();

      function getDiscounts() {
        Discount.getDiscounts('discount/').then(function(result){
          console.log(result);
          vm.discounts = result;
        });
      }

      $scope.saveDiscount = function() {
        var discount = {
          _id:'discount/'+vm.discount.description,
          description:vm.discount.description,
          percentage: (vm.discount.percentage / 100)
        };

        Discount.addDiscount(discount).then(function(result){
          if(result.ok){
            $scope.newDiscountModal.hide();
            getDiscounts();
          }
          console.log(result);
        });
      }
    }

})();
