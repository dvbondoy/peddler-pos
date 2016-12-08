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

  CategoriesController.$inject = ['$scope', 'Product', '$ionicModal'];
  function CategoriesController($scope, Product, $ionicModal) {
    var vm = this;
    vb.category = {};
    vm.categories = {};

    $ionicModal.templateFromUrl('product/templates/new-category-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.newCategoryModal = modal;
    });
  }
})();