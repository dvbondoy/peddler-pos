(function() {
'use strict';

  angular
    .module('app.product')
    .controller('ProductController', ProductController)
    .controller('CategoriesController', CategoriesController)
    .controller('ItemsController', ItemsController)
    .controller('DiscountController', DiscountController);

  ProductController.$inject = ['$scope', 'Product'];
  function ProductController($scope, Product) {
    var vm = this;
    

    activate();

    ////////////////

    function activate() { }
  }

  CategoriesController.$inject = ['$scope', 'Category', '$ionicModal'];
  function CategoriesController($scope, Category, $ionicModal) {
    var vm = this;
    vm.categories;

    getCategories();

    $ionicModal.fromTemplateUrl('product/templates/new-category-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.newCategoryModal = modal;
    });

    $scope.saveCategory = function(category) {
      var cat = {
        "_id":"categories_" + category,
        "type":"categories",
        "title":category,
        "items":0
      };

      Category.add(cat);
      getCategories();
      $scope.newCategoryModal.hide();
    }

    function getCategories() {
      Category.get().then(function(data) {
        vm.categories = data;
        console.log(data);
      });
    }
  }

  ItemsController.$inject = ['$scope', 'Items', '$ionicModal', 'Category'];
  function ItemsController($scope, Items, $ionicModal, Category) {
    var vm = this;
    $scope.item = {};

    getItems();

    // prep modal windows
    $ionicModal.fromTemplateUrl('product/templates/new-item-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.newItemModal = modal;
    });

    $ionicModal.fromTemplateUrl('select-category.html', {
      scope:$scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      // get categories
      Category.get().then(function(data) {
        vm.categories = data;
      });

      $scope.selectCategoryModal = modal;
    });

    $ionicModal.fromTemplateUrl('item-details.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.itemDetailsModal = modal;
    });

    $scope.deleteItems = function() {
      _db.destroy().then(function(res){
        console.log(res);
      });
    }

    // save new item
    $scope.saveItem = function() {
      var item = $scope.item;
      var category = item.category;

      var newItem = {
        "_id":"items_"+category._id+"_"+item.description,
        "category_id":category._id,
        "description":item.description,
        "image":item.image,
        "sale_price":item.sale_price
      };

      // save
      Items.add(newItem);
      // update categories item count
      Items.get('items_'+category._id, 'items_'+category._id+'\uffff').then(function(data) {
        var itemCount = data.length;
        Category.getId(category._id).then(function(data){
          console.log(data);
          var cat = data;
          cat.items = itemCount;
          console.log(cat);
          Category.update(cat);
        });
      });
      // close modal
      $scope.newItemModal.hide();
      // refresh item list
      getItems();
    }

    $scope.itemDetails = function(item) {
      $scope.item = item;
      $scope.itemDetailsModal.show();
    }

    function getItems() {
      Items.get().then(function(data) {
        vm.items = data;
        console.log(data);
      });
    }
    
  }

  DiscountController.$inject = ['$scope', 'Discounts', '$ionicModal'];
  function DiscountController($scope, Discounts, $ionicModal) {
    var vm = this;

    vm.discounts;
    vm.discount = {};

    getDiscounts();

    // prep modals
    $ionicModal.fromTemplateUrl('product/templates/new-discount-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.newDiscountModal = modal;
    });

    $scope.save = function() {
      $scope.newDiscountModal.hide();
      var percent = vm.discount.percent / 100;
      var new_discount = {
        "_id":"discounts_"+percent,
        "title":vm.discount.title,
        "percent":percent
      };

      Discounts.add(new_discount);

      getDiscounts();
    }

    function getDiscounts() {
      Discounts.get().then(function(data) {
        vm.discounts = data;
        console.log(data);
      });
    }
  }

})();