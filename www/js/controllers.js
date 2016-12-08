angular.module('starter.controllers', [])
// Home controller
.controller('HomeCtrl', function($scope, Categories, Items, Discounts, $ionicActionSheet, $ionicModal) {
  // tab
  $scope.tab = {
    active: 'library' // default active tab
  }

  // Filter text
  $scope.filterText = 'All items';

    // list of items
  $scope.items = Items.all();

  // total value
  $scope.total = 0;

  // calculate result
  $scope.result = 0;

  // order object
  $scope.order = {
    items: [],
    discount: 0,
    total_items: 0,
    total: 0
  }

  // current item
  $scope.currentItem = {};

  // in case of keypress
  $scope.keyPressed = function(keyCode) {
    // TODO: process keycode here
    switch (keyCode) {
      case -1:
        $scope.result = 0;
        break;
      case -2:
        addCustomValue();
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

  // Triggered on a choose category click
  $scope.chooseCategory = function() {
    var menu = [
      {
        id: -1,
        text: 'All items'
      },
      {
        id: -2,
        text: 'Discounts'
      }
    ];
    var categories = Categories.all();

    // add categories to menu
    for (var i = 0; i < categories.length; i++) {
      menu.push({id: categories[i].id, text: categories[i].name});
    }

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      buttons: menu,
      cancelText: 'Cancel',
      cancel: function() {
        // add cancel code..
      },
      buttonClicked: function(index) {
        // reset data
        $scope.items = [];
        $scope.discounts = [];

        if (index == 0) {
          // get all items
          $scope.items = Items.all();
          $scope.filterText = 'All items';
        } else if (index == 1) {
          // add discounts
          $scope.discounts = Discounts.all();
          $scope.filterText = 'Discount';
        } else {
          var cat = menu[index];

          $scope.filterText = cat.text;
          $scope.items = Items.getByCategoryId(cat.id);
        }

        return true;
      }
    });
  };

  // add item to order
  $scope.addItem = function(item) {
    var quantity = 1;
    var price = item.price;

    // if is simple item
    if (item.total_options == 0) {
      // find same item in order
      var hasItem = false;

      for (var i = 0; i < $scope.order.items.length; i++) {
        // if found
        if ($scope.order.items[i].id == item.id) {
          hasItem = true;
          $scope.order.items[i].quantity++;
          break;
        }
      }

      // if not found
      if (!hasItem) {
        // add quantity
        item.quantity = quantity;
        // add subtotal
        item.subtotal = item.price;
        // push item to order items
        $scope.order.items.push(item);
      }
      $scope.order.total_items += quantity;
      $scope.order.total += price;
    } else { // item has options
      $scope.currentItem = item;
      $scope.currentItem.quantity = 1;
      $scope.itemModal.show();
    }
  }

  // create modal
  $ionicModal.fromTemplateUrl('templates/modal.item.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.itemModal = modal;
  });

  // close modal
  $scope.cancelAddItem = function() {
    $scope.itemModal.hide();
  }

  // confirm add item
  $scope.confirmAddItem = function(item) {
    $scope.itemModal.hide();
    item.options = [];
    item.subtotal = item.price;

    // calculate item price
    for (var i = 0; i < item.option_groups.length; i++) {
      for (var j = 0; j < item.option_groups[i].options.length; j++) {
        var option = item.option_groups[i].options[j];
        if (option.active) {
          item.options.push(option);
          item.subtotal += option.price;
        }
      }
    }

    $scope.order.total += item.subtotal * item.quantity;
    $scope.order.total_items += item.quantity;
    $scope.order.items.push(item);

    console.log($scope.order);
  }

  // plus quantity
  $scope.plusQuantity = function(item) {
    item.quantity++;
  }

  // minus quantity
  $scope.minusQuantity = function(item) {
    if (item.quantity > 0) {
      item.quantity--;
    }
  }

  // view Order
  $ionicModal.fromTemplateUrl('templates/modal.order.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.orderModal = modal;
  });

  // view order modal
  $scope.viewOrderModal = function() {
    $scope.orderModal.show();
  }

  // close modal
  $scope.closeOrderModal = function() {
    $scope.orderModal.hide();
  }

  // clear order
  $scope.clearOrder = function() {
    $scope.orderModal.hide();
    $scope.order = {
      items: [],
      discount: 0,
      total_items: 0,
      total: 0
    }
  }

  // add discount
  $scope.addDiscount = function(discount) {
    discount.used = true;

    if (discount.rate !== null) {
      $scope.order.discount += $scope.order.total * discount.rate / 100;
    } else {
      $scope.order.discount += discount.amount;
    }
  }

  // enter number
  function enter(keyCode) {
    $scope.result = $scope.result * 10 + parseInt(keyCode.toString());
  }

  // add custom value
  function addCustomValue() {
    $scope.total += $scope.result;
    $scope.result = 0;
  }
})

// Activity Controller
.controller('ActivityCtrl', function($scope, Orders) {
  // list orders
  $scope.orderGroups = Orders.groupByDate();
})

// Activity Detail Controller
.controller('ActivityDetailCtrl', function($scope, Orders, Items, $stateParams) {
  // list orders
  $scope.order = Orders.get($stateParams.id);

  $scope.order.itemObjects = [];

  for (var i = 0; i < $scope.order.items.length; i++) {
    $scope.order.itemObjects.push(Items.get($scope.order.items[i]));
  }
})

// Report Controller
.controller('ReportCtrl', function($scope, Reports, Categories) {

    // report data
    $scope.report = Reports.all();

    // add category name to category
    for (var i = 0; i < $scope.report.categories.length; i++) {
      var cat = Categories.get($scope.report.categories[i].id);
      $scope.report.categories[i].name = cat.name;
    }
})

// Item Controller
.controller('ItemCtrl', function($scope) {

})

// Item All Controller
.controller('ItemAllCtrl', function($scope, Items) {

    // list of items
    $scope.items = Items.all();
})

// Item Category Controller
.controller('ItemCategoryCtrl', function($scope, Categories) {
  // list of categories
  $scope.categories = Categories.all();
})

// Item Discount Controller
.controller('ItemDiscountCtrl', function($scope, Discounts) {
    // list of all discounts
    $scope.discounts = Discounts.all();
})

//  Controller
.controller('SettingCtrl', function($scope) {

})

// Authentication controller
// Put your login, register functions here
.controller('AuthCtrl', function($scope, $ionicHistory, $ionicSideMenuDelegate, $state) {
  // hide back butotn in next view
  $ionicHistory.nextViewOptions({
    disableBack: true
  });

  // disabled swipe menu
  $ionicSideMenuDelegate.canDragContent(false);
})
