(function() {
'use strict';

  angular
    .module('app.report')
    .controller('ReportController', ReportController)
    .controller('SalesReportController', SalesReportController)
    .controller('DailyActivityController', DailyActivityController)
    .controller('InventoryController', InventoryController);

  ReportController.$inject = ['$scope'];
  function ReportController($scope) {
    var vm = this;
  }

  SalesReportController.$inject = ['$scope','$q','$ionicModal','SalesService'];
  function SalesReportController($scope,$q,$ionicModal,SalesService) {
    var vm = this;

    // PREP MODALS
    $ionicModal.fromTemplateUrl('report/templates/sales-report-modal.html', {
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal) {
      $scope.salesReportModal = modal;
    });


    // SalesService.getActiveInventory().then(function(data){
    //   if(!data) {
    //     return false;
    //   } else {

    //   }
    // })
    
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

  }//END OF SALES REPORT

  DailyActivityController.$inject = ['$scope','$q'];
  function DailyActivityController($scope,$q) {
    var vm = this;
    var quota = 0;

    $q.when(_db.get('_local/daily_quota').then(function(result){
      vm.dailyQuota = result.quota;
      quota = result.quota;
      // console.log(result.quota);
    }));

    var dateOfMonth = moment().date();
    dateOfMonth > 9 ? dateOfMonth : dateOfMonth = "0" + dateOfMonth;
    var today = moment().year()+'-'+moment().month()+1+'-'+dateOfMonth;
    $q.when(_db.query('sales_ddoc/byDate',{include_docs:true,startkey:today,endkey:today+'\uffff'},function(err,res){
      if(err){console.log(err);}
      console.log(res);

      var amount = 0;
      res.rows.forEach(function(row) {
        amount += row.doc.total;
      });
      
      var calls = res.rows.length;
      
      vm.todayCalls = {
        calls:calls,
        quota:(calls/quota)*100,
        total:amount
      };
    }));

    var dateYesterday = moment().date() - 1;
    dateYesterday > 9 ? dateYesterday : dateYesterday = "0"+dateYesterday;
    var yesterday = moment().year()+'-'+moment().month()+1+'-'+dateYesterday;
    $q.when(_db.query('sales_ddoc/byDate', {include_docs:true,startkey:yesterday,endkey:yesterday+'\uffff'},function(err,res){
      if(err){console.log(err);}

      var amount = 0;
      res.rows.forEach(function(row) {
        amount += row.doc.total;
      });

      var calls = res.rows.length;
      vm.yesterdayCalls = {calls:calls,quota:(calls/quota)*100,total:amount};
    }));
  }

  InventoryController.$inject = ['$scope','$q','$ionicModal','SalesService'];
  function InventoryController($scope,$q,$ionicModal,SalesService) {
    var vm = this;

    vm.activeInventory;

    // $scope.inDetailsModal;

    //PREP MODALS
    $ionicModal.fromTemplateUrl('report/templates/active-inventory-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.inDetailsModal = modal;
    });

    SalesService.getActiveInventory().then(function(data) {
      if(!data) {
        vm.activeInventory = false;
      } else {
        vm.activeInventory = data;
      }
    });
    // $q.when(_db.query('inventory_ddoc/active', {
    //   include_docs:true,
    //   key:'active'
    // },function(error, result) {
    //   if(result.rows.length == 1) {
    //     vm.activeInventory = result.rows[0].doc;
    //     console.log(vm.activeInventory);
    //   } else {
    //     vm.activeInventory = false;
    //   }
    // }).catch(function(error){
    //   console.log(error);
    // }));

    $scope.closeActiveInventory = function() {
      SalesService.closeActiveInventory(vm.activeInventory).then(function(result) {
        console.log(result);
      }).catch(function(error) {
        console.log(error);
      });
    }


  }//END OF INVENTORY CONTROLLER;
})();