(function() {
'use strict';

  angular
    .module('app.report')
    .controller('ReportController', ReportController);

  ReportController.$inject = ['$scope','Report','$ionicActionSheet','$ionicModal','ionicDatePicker'];
  function ReportController($scope,Report,$ionicActionSheet,$ionicModal,ionicDatePicker) {
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
                sales.today();
              break;
              case 1:
                sales.yesteday();
              break;
              case 2:
                $scope.rangeModal.show();
            }

            return true;
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
      range:{
        from:function(){
          ionicDatePicker.openDatePicker({
            callback:function(value){
              vm.from = moment(value).format('YYYY-MM-DD');
            }
          });
        },
        to:function(){
          ionicDatePicker.openDatePicker({
            callback:function(value){
              vm.to = moment(value).format('YYYY-MM-DD');
            }
          });
        },
        sales:function(){
          Report.dateRange(vm.from, vm.to).then(function(result){
            console.log('report.controller:82');
            console.log(result)
            $scope.Sales.list = result;
          });
        }
      }
    };

    $scope.Sales.today();

    // prep modals

    $ionicModal.fromTemplateUrl('reports/templates/range-modal.html',{
      scope:$scope,
      animation:'slide-in-up'
    }).then(function(modal){
      $scope.rangeModal = modal;
    });

    // end of modals

  }
})();