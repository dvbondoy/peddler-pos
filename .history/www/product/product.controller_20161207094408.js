(function() {
'use strict';

  angular
    .module('app.product')
    .controller('ProductController', ProductController)
    .controller('CategoriesController', CategoriesController);

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
    vm.category = {};
    vm.categories;

    $ionicModal.fromTemplateUrl('product/templates/new-category-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.newCategoryModal = modal;
    });

    Category.get().then(function(data) {
      vm.categories = data.rows;
      console.log(vm.categories);
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
})();