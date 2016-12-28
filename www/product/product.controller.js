(function() {
'use strict';

  angular
    .module('app.product')
    .controller('ProductController', ProductController)
    .controller('CategoriesController', CategoriesController)
    .controller('ItemsController', ItemsController)
    .controller('DiscountController', DiscountController)
    .controller('TaxController', TaxController);

  ProductController.$inject = ['$scope', '$http','$q','$ionicLoading'];
  function ProductController($scope, $http, $q, $ionicLoading) {
    var vm = this;
    
    $scope.purgeDatabase = function() {
      _db.destroy().then(function(res){
        console.log(res);
      });
    }

    $scope.getItems = function() {
      // $http({
      //   method: 'GET',
      //   url: 'http://root:toor@localhost:5984/test/_all_docs?startkey="categories"&endkey="categories\uffff"'
      // }).then(function(res){
      //   console.log(res);
      //   alert('sync success');
      // },function(error){
      //   console.log(JSON.stringify(error));
      //   alert(error);
      // });
      $q.when(_db.allDocs({include_docs:true}).then(function(data){
        console.log(data);
      }));
    }

    $scope.sync = function() {
      console.log('synching....');
      $ionicLoading.show({});
      var remoteDB = new PouchDB('http://admin:nimda@192.168.8.101:5984/gvi/');
    
      _db.replicate.from(remoteDB, {view:'_items/all_items'}).on('complete', function(res){
        console.log(res);
        $ionicLoading.hide();
      }).on('error', function(error){
        alert(error);
        console.log(JSON.stringify(error));
      });
    }
    
    $scope.createFilter = function() {
      console.log('createFilter');
      var remoteDB = new PouchDB('http://admin:nimda@localhost:5985/gvi')
      var designFilter = {
        _id:"_design/my_filter",
        filters:{
         myFilter:function(doc){
           return doc;
         }.toString() 
        }
      };
      remoteDB.put(designFilter).then(function(){
        return $q.when(remoteD_DB.query('my_filter',{stale:'update_after'})).then(function(res){
          console.log(res);
        });
      });
    }

    $scope.testSync = function() {
      var remoteDB = new PouchDB('http://192.168.8.101:5984/test');
      _db.replicate.to(remoteDB).on('complete',function(res){
        console.log('success');
        console.log(res);
      }).on('error', function(error){
        console.log(JSON.stringify(error));
      });
    }

    $scope.uploadItems = function() {
      var i = {
        "test":[{"blah":"booh"},{"foo":"bar"}]
      };
      var items = {"docs":[
                  {
                    "_id": "1FCANS",
                    "DESCRIPTION": "FCANS",
                    "DESCRIPTIONSALES": "FCANS",
                    "SALESPRICE": "-0.01",
                    "GLSALESACCOUNT": "49500",
                    "STOCKINGUM": "%",
                    "SALESUMSTOCKINGUNITS": "0",
                    "AVERAGEMONTHLYSALES": "10",
                    "PRICECASE": "0",
                    "CATEGORY": "PROMO",
                    "SUBCATEGORY": "PROMO"
                  },
                  {
                    "_id": "1FCBOS",
                    "DESCRIPTION": "FCBOS",
                    "DESCRIPTIONSALES": "FCBOS",
                    "SALESPRICE": "-0.01",
                    "GLSALESACCOUNT": "49600",
                    "STOCKINGUM": "%",
                    "SALESUMSTOCKINGUNITS": "0",
                    "AVERAGEMONTHLYSALES": "11",
                    "PRICECASE": "0",
                    "CATEGORY": "PROMO",
                    "SUBCATEGORY": "PROMO"
                  },
                  {
                    "_id": "1FCDAM",
                    "DESCRIPTION": "FCDAM",
                    "DESCRIPTIONSALES": "FCDAM",
                    "SALESPRICE": "0",
                    "GLSALESACCOUNT": "49000",
                    "STOCKINGUM": "%",
                    "SALESUMSTOCKINGUNITS": "0",
                    "AVERAGEMONTHLYSALES": "12",
                    "PRICECASE": "0",
                    "CATEGORY": "PROMO",
                    "SUBCATEGORY": "PROMO"
                  }]};
      
      $http({
        method:'POST',
        url:'http://localhost:5984/items/_bulk_docs',
        data:items
      }).then(function(res){
        console.log(res);
      },function(error){
        console.log(error);
      });
    }
  }

  CategoriesController.$inject = ['$scope', 'Category', '$ionicModal'];
  function CategoriesController($scope, Category, $ionicModal) {
    var vm = this;
    vm.top_categories;
    vm.categories;
    vm.subcategories;
    vm.category = {category:'',pcategory:'TOPLEVEL'};

    getCategories();

    $ionicModal.fromTemplateUrl('product/templates/category-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.newCategoryModal = modal;
    });

    $ionicModal.fromTemplateUrl('product/templates/top-category-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.topCategoryModal = modal;
    });

    $ionicModal.fromTemplateUrl('product/templates/sub-category-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.subCategoryModal = modal;
    });

    $scope.save = function() {
      var category = vm.category;
      category.category = category.category.toUpperCase();
      category._id = "categories_"+category.pcategory+"_"+category.category
      
      console.log(category);
      Category.add(category);
      getCategories();
      $scope.newCategoryModal.hide();
    }

    $scope.newCategory = function() {
      vm.category = {category:'',pcategory:'TOPLEVEL'};
      $scope.newCategoryModal.show();    
    }

    $scope.changePCategory = function(){
      $scope.topCategoryModal.show();
      Category.getCategories().then(function(data){
        console.log(data);
        vm.top_categories = data;
      });
    }

    $scope.subCategories = function(category){
      Category.getSubCategories(category.category).then(function(data){
        console.log(data);
        vm.subCategories = data;
      });
    }

    function getCategories() {
      Category.getCategories().then(function(data) {
        vm.categories = data;
        console.log(data);
      });
    }
  }

  ItemsController.$inject = ['$scope', 'Items', '$ionicModal', 'Category'];
  function ItemsController($scope, Items, $ionicModal, Category) {
    var vm = this;
    $scope.item = {};
    vm.categories;

    getItems();

    Category.getAll().then(function(data){
      var cats = [];

      // get only those sub
      angular.forEach(data, function(v,k){
        if(v.pcategory !== 'TOPLEVEL'){
          this.push(v);
        }
      },cats);
      vm.categories = cats;
    });
    

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
      // Category.get().then(function(data) {
      //   vm.categories = data;
      // });

      $scope.selectCategoryModal = modal;
    });

    $ionicModal.fromTemplateUrl('item-details.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.itemDetailsModal = modal;
    });

    

    // save new item
    $scope.saveItem = function() {
      var item = $scope.item;
      var category = item.category;

      item._id = "items_"+category.category+"_"+item.description;
      item.category = category.category;

      // save
      Items.add(item);
      // update categories item count
      Items.getByCategory(category.category).then(function(data) {
        var itemCount = data.length;
        Category.getId(category._id).then(function(data){
          // console.log(data);
          var cat = data;
          cat.items = itemCount;
          // console.log(cat);
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
        // console.log(data);
      });
    }
    
  }

  DiscountController.$inject = ['$scope', 'Discounts', '$ionicModal'];
  function DiscountController($scope, Discounts, $ionicModal) {
    var vm = this;

    vm.action = '';
    vm.discounts;
    vm.discount = {};

    getDiscounts();

    // prep modals
    $ionicModal.fromTemplateUrl('product/templates/discount-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.discountModal = modal;
    });

    $scope.save = function() {
      $scope.discountModal.hide();
      var percent = vm.discount.percent;
      var new_discount = {
        "_id":"discounts_"+percent,
        "title":vm.discount.title,
        "percent":percent
      };

      Discounts.add(new_discount);

      getDiscounts();
    }

    $scope.remove = function() {
      Discounts.remove(vm.discount).then(function(res){
        if(res.ok){
          $scope.discountModal.hide();
          vm.discounts.splice(vm.discounts.indexOf(vm.discount),1);
          alert(res.id + ' deleted');
        }
      });
    }

    $scope.update = function() {

    }

    function getDiscounts() {
      Discounts.get().then(function(data) {
        vm.discounts = data;
        // console.log(data);
      });
    }

    
  }

  TaxController.$inject = ['$scope', 'Tax', '$ionicModal'];
  function TaxController($scope, Tax, $ionicModal) {
    var vm = this;

    vm.tax = {};
    vm.action = 'view';
    vm.taxes;// = getTaxes();

    getTaxes();
    // prep modals
    $ionicModal.fromTemplateUrl('product/templates/tax-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.taxModal = modal;
    });

    function getTaxes() {
      Tax.get().then(function(data) {
        // console.log(data);
        vm.taxes = data;
      });
    }

    $scope.saveTax = function(tax) {
      $scope.taxModal.hide();
      var new_tax = {
        "_id":"taxes_"+tax.percent,
        "title":tax.title,
        "percent":tax.percent
      };
      // insert
      Tax.add(new_tax);
      // retrieve
      getTaxes();
    }

    $scope.updateTax = function(tax) {
      // console.log(tax);
      // var tax = vm.tax;
      Tax.update(tax).then(function(res) {
        // console.log(res);
      });
      getTaxes();
    }

    $scope.deleteTax = function(tax) {
      // console.log(tax);
      $scope.taxModal.hide();
      Tax.remove(tax).then(function(res){
        // console.log(res);
      }).catch(function(error){
        // console.log(error);
      });

      getTaxes();
    }
  }

})();