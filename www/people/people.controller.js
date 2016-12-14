(function() {
'use strict';

  angular
    .module('app.people')
    .controller('CustomerController', CustomerController);

  CustomerController.$inject = ['$scope', 'Customer', '$ionicModal'];
  function CustomerController($scope, Customer, $ionicModal) {
    var vm = this;
    
    vm.customer = {};
    vm.customers;

    getCustomers();

    function getCustomers() {
      Customer.get().then(function(data) {
        vm.customers = data;
      });
    }

    $ionicModal.fromTemplateUrl('people/templates/new-customer-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.newCustomerModal = modal;
    });

    $ionicModal.fromTemplateUrl('people/templates/customer-details-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.viewCustomerModal = modal;
    });

    $scope.saveCustomer = function() {
      $scope.newCustomerModal.hide();

      var customer = vm.customer;

      var newCustomer = {
        "_id":"customers_"+customer.company,
        "company":customer.company,
        "contact_name":customer.name,
        "contact_number":customer.contact_number,
        "email_address":customer.email,
        "address":customer.address
      };

      Customer.add(newCustomer);
      getCustomers();
    }

    $scope.viewCustomerDetail = function(customer) {
      vm.customerDetails = customer;

      $scope.viewCustomerModal.show();
    }
  }
})();