(function() {
'use strict';

  angular
    .module('app.report')
    .controller('ReportController', ReportController);

  ReportController.$inject = ['$scope','Report','$ionicActionSheet'];
  function ReportController($scope,Report,$ionicActionSheet) {
    var vm = this;
    
    // Report.salesToday().then(function(result){
    //   console.log(result);
    // });

    $scope.Sales = {
      list:[],
      setDate:function(){
        var sales = this;

        var menu = [
          {text:'Today'},{text:'Yesteday'},{text:'Date Range'}
        ];

        var hideSheet = $ionicActionSheet.show({
          buttons:menu,
          cancelText:'Cancel',
          cancel:function(){
            return 0;
          },
          buttonClicked:function(index){
            switch(index){
              case 0:
              break;
              case 1:
              break;
              case 2:
            }
          }
        });
      },
      today:function(){
        var sales = this;

        Report.salesToday().then(function(result){
          console.log('report.controller:46');
          console.log(result);
          sales.list = result;
        });
      },
      yesteday:function(){
        var sales = this;

        Report.salesYesterday().then(function(result){
          sales.list = result;
        });
      },
      range:function(from, to){
        var sales = this;

        Report.dateRange(from, to).then(function(result){
          sales.list = result;
        });
      }
    };

    $scope.Sales.today();

  }
})();