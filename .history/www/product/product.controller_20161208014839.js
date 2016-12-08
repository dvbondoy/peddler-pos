(function() {
'use strict';

  angular
    .module('app.product')
    .controller('ProductController', ProductController)
    .controller('CategoriesController', CategoriesController)
    .controller('ItemsController', ItemsController);

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

    $ionicModal.fromTemplateUrl('product/templates/new-category-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.newCategoryModal = modal;
    });

    Category.get().then(function(data) {
      vm.categories = data;
      // console.log(vm.categories);
    });

    $scope.saveCategory = function(category) {
      // look for duplicate
      // save or exit
      // console.log(vm.new_category);
      var cat = {
        "_id":"categories_" + category,
        "type":"categories",
        "title":category
      };

      Category.add(cat);
      // console.log(Category.get());
    }
  }

  ItemsController.$inject = ['$scope', 'Items'];
  function ItemsController($scope, Items) {
    $scope.item = {};

    Items.get().then(function(data) {
      vm.items = data;
      consoel.log(data);
    });

    $scope.saveItem = function() {
      var item = $scope.item;

      var newItem = {
        "_id":"items_"+item.description,
        "category_id":item.category_id,
        "description":item.description,
        "image":item.image,
        "sale_price":item.sale_price
      };

      Items.add(newItem);
    }
  }
})();