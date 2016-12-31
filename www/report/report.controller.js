(function() {
'use strict';

  angular
    .module('app.report')
    .controller('ReportController', ReportController)
    .controller('SalesReportController', SalesReportController);

  ReportController.$inject = ['$scope'];
  function ReportController($scope) {
    var vm = this;
  }

  SalesReportController.$inject = ['$scope','$q','$ionicModal'];
  function SalesReportController($scope,$q,$ionicModal) {
    var vm = this;

    // PREP MODALS
    $ionicModal.fromTemplateUrl('report/templates/sales-report-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.salesReportModal = modal;
    });

    
    $q.when(_db.query('inventory_ddoc/active', {
      include_docs:true,
      key:'active'
    },function(err, res) {
      if(err) { console.log(err); }

      if(res.rows.length == 1) {
        var inventory_date = res.rows[0].doc.date;
        var now = moment();

        _db.query('sales_ddoc/byDate', {
          include_docs:true,
          startkey:inventory_date,
          endkey:now
        },function(err,res) {
          if(err) {console.log(err);}

          // console.log(res);
          vm.sales = res.rows;
          console.log(vm.sales);
        });
      }      
    }));

  }
})();