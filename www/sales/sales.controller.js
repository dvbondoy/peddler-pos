(function() {
'use strict';

  angular
    .module('app.sales')
    .controller('SalesController', SalesController);

    SalesController.$inject = ['$scope','Item','$ionicModal','ionicDatePicker','$ionicActionSheet','Discount','Sales','Customer','$ionicLoading','Local','$ionicPopup'];
    function SalesController($scope,Item,$ionicModal,ionicDatePicker,$ionicActionSheet,Discount,Sales,Customer,$ionicLoading,Local,$ionicPopup) {
      var vm = this;

      vm.tab = {active:'library'};
      vm.filterText = 'Items';
      vm.amount = 0;

      $scope.Items = {
        category:null,
        list:[],
        categories:[],
        select:function(item){
          vm.item = item;
          vm.quantity = 1;
          
          $scope.quantityModal.show();
        },
        getByCategory:function(category){
          var items = this;

          Item.getItemsByCategory(category).then(function(result){
            items.list = result;
          });
        },
        getCategories:function(category){
          var items = this;

          Item.getCategories(category).then(function(result){
            items.category !== null ? vm.showBack = true : vm.showBack = false;

            items.categories = result;
          });
        },
        openCategory:function(id){
          this.category = id;

          this.getCategories(this.category);

          this.getByCategory(this.category);
        },
        prevCategory:function(){
          this.category = this.category.substring(0,this.category.lastIndexOf('/'));
          
          if(this.category == 'category/null'){this.category = null;}

          this.getCategories(this.category);

          this.getByCategory(this.category);
        }
      };

      $scope.Uoms = {
        item:null,
        list:[],
        add:function(um){

        }
      };

      $scope.Customer = {
        active:{company:'Walk-in'},
        getAll:function(){
          return false;
        }
      };

      $scope.Order = {
        items:[],
        total_items:0,
        total_amount:0,
        ship_date:null,
        addItem:function(item){
          var order = this;

          item.quantity = vm.quantity;

          item.amount = vm.quantity * item.price;

          var inOrder = false;

          order.items.forEach(function(value,index){
            if(item._id == value._id){
              order.items[index].quantity = item.quantity;

              order.items[index].amount = item.amount;

              inOrder = true;
            }
          });

          if(!inOrder){
            order.items.push(item);
          }

          order.updateOrder();
        },
        remove:function(item){
          var order = this;

          $ionicPopup.confirm({
            title:'Confirm remove',
            template:'Remove item from order?'
          }).then(function(res){
            if(res){
              order.items.forEach(function(value, index){
                if(value._id == item._id){
                  order.items.splice(index,1);
                }
              });

              order.updateOrder();
            }
          });
        },
        reset:function(){
          var order = this;
          var discounts = $scope.Discounts;
          var payments = $scope.Payments;

          order.items = [];
          order.total_amount = 0;
          order.total_items = 0;
          order.ship_date = null;

          payments.clear();

          discounts.active = null;

          vm.amount = 0;
        },
        updateOrder:function(){
          var order = this;

          var discounts = $scope.Discounts;

          var amount = 0;

          order.total_items = order.items.length;

          order.items.forEach(function(value){
            amount += value.amount;
          });

          order.total_amount = amount;

          order.ship_date = moment().format("YYYY-MM-DD");
        },
        setShipDate:function(){
          var order = this;

          ionicDatePicker.openDatePicker({
            callback:function(value) {
              order.ship_date = moment(value).format("YYYY-MM-DD");
            }
          });
        },
        checkout:function(){
          var order = this;
          var payments = $scope.Payments;
          var discounts = $scope.Discounts;
          var customer = $scope.Customer;

          var date = moment().format('YYYY-MM-DD');
          var time = moment().format('kk:mm:ss');

          payments.change = payments.total() - payments.charge();

          var sale = {
            type : 'sale',
            _id : 'sale/'+date+'/'+time,
            ship_date:order.ship_date,
            date:date,
            time:time,
            subtotal:order.total_amount,
            charge:payments.charge(),
            change:payments.change,
            discount:discounts.active,
            customer:customer.active,
            items:order.items,
          };

          if(payments.total() < order.total_amount){
            alert('Insuficient amount.');
            return 0;
          }

          Sales.add(sale).then(function(result){
            console.log(result);
            if(result.ok){
              $scope.checkoutModal.hide();
              order.reset();
              // alert('Done!');
              // alert('Change : '+payments.change);
              $ionicPopup.alert({title:'CHANGE',template:'Php '+payments.change.toFixed(2)});
            }else if(result.error){
              alert(result.message);
            }
          });

          if($scope.Printer.auto_print){
            $scope.Printer.print(sale);
          }
        }
      };

      $scope.Customer = {
        list:[],
        active:{company:'Walk-in'},
        view:function(){
          var customer = this;

          Customer.getAll().then(function(result){
            customer.list = result;
            $scope.customerModal.show();
          });
        },
        select:function(cust){
          var customer = this;

          customer.active = cust;
          $scope.customerModal.hide();
        }
      }

      $scope.Discounts = {
        list:[],
        active:null,
        getAll:function(){
          var discounts = this;
          
          Discount.getAll().then(function(result){
            discounts.list = result;
          });
        },
        add:function(discount){
          var discounts = this;
          var order = $scope.Order;

          discounts.active = discount;
          order.updateOrder();
        },
        remove:function(){
          this.active = null;
        }
      };

      $scope.Payments = {
        list:{cash:{amount:0},terms:{amount:0,days:0,due:null},check:[],change:0},
        charge:function(){
          var payments = this;
          var discounts = $scope.Discounts;
          var order = $scope.Order;
          var amount = 0;

          if(discounts.active !== null){
            amount = order.total_amount - (order.total_amount * discounts.active.percentage)
          }else{
            amount = order.total_amount;
          }

          return amount;
        },
        total:function(){
          var amount = 0;
          //cash
          amount += this.list.cash.amount;
          //terms
          amount += this.list.terms.amount;
          //check
          this.list.check.forEach(function(value){
            amount += value.amount;
          });

          this.subtotal = amount;

          return amount;
        },
        add:function(){
          var payments = this;

          var menu = [
            {text:'Cash'},{text:'Terms'},{text:'Check'}
          ];

          var hideSheet = $ionicActionSheet.show({
            buttons: menu,
            cancelText: 'Cancel',
            cancel:function(){

            },
            buttonClicked:function(index){
              switch(index){
                case 0:
                  payments.list.cash.amount = vm.amount;
                  break;
                case 1:
                  var days = parseInt(prompt("Enter number of Days"),10);

                  if(days == "" || days == null || isNaN(days)) {
                    alert('Invalid number');
                    return 0;
                  }

                  var due = moment().add(days, "days");

                  payments.list.terms = {amount:vm.amount,days:days,due_date:due};
                  break;
                case 2:
                  break;
              }
              payments.total();
              return true;
            }
          });

        },
        clear:function(){
          this.list = {cash:{amount:0},terms:{amount:0,days:0,due_date:null},check:[]};
        }
      };

      $scope.Printer = {
        status:'offline',
        auto_print:false,
        device:null,
        checkSettings:function(){
          Local.getPriner().then(function(result){
            if(result.error){
              console.log(result);
              return 0;
            }

            vm.auto_print = result.auto_print;
          });
        },
        checkStatus:function(){
          var printer = this;

          $ionicLoading.show({template:'Checking printer...'});
          
          Local.getPrinter().then(function(result){
            if(result.error){
              $ionicLoading.hide();
              
              return 0;
            }

            printer.device = result.printer;

            printer.auto_print = result.auto_print;

            if(printer.auto_print){
              BTPrinter.connect(function(success){
                printer.status = 'online';
              },function(error){
                alert(error);
              },result.printer);

              BTPrinter.disconnect();
            }
            $ionicLoading.hide();
          });
        },
        print:function(data){
          var printer = this;

          var items = data.items;

          BTPrinter.connect(function(success){
            //center align
            BTPrinter.printPOSCommand(function(){},function(){},"1B 61 01");
            BTPrinter.printText(function(){},function(){},"Sari2x Store\n");
            BTPrinter.printText(function(){},function(){},"123 St. Somewhere\n\n\n");
            //left align
            BTPrinter.printPOSCommand(function(){},function(){},"1B 61 00");
            BTPrinter.printText(function(){},function(){},"Customer: "+data.customer.company+"\n");
            BTPrinter.printText(function(){},function(){},"Date: "+moment(data.date).format("YYYY-MM-DD")+"\n");
            BTPrinter.printText(function(){},function(){},"Time: "+moment(data.time).format("kk:mm:ss")+"\n\n");
            //print obj
            items.forEach(function(value){
              BTPrinter.printText(function(){},function(){},
                value.quantity+" "+
                value.print_description+
                "      @"+
                value.price+
                "      "+
                value.amount+
                "\n");
            });

            //center
            BTPrinter.printPOSCommand(function(){},function(){},"1B 61 01");

            BTPrinter.printText(function(){},function(){},"-------------------------\n");

            //left
            BTPrinter.printPOSCommand(function(){},function(){},"1B 61 00");
            BTPrinter.printText(function(){},function(){},"SUB-TOTAL        "+data.subtotal+"\n");
            // BTPrinter.printText(function(){},function(){},"DISCOUNT         "+data.discount.amount+"\n");
            BTPrinter.printText(function(){},function(){},"TOTAL            "+data.charge+"\n");
            BTPrinter.printText(function(){},function(){},"CHANGE           "+data.change+"\n\n\n");

            //center again
            BTPrinter.printPOSCommand(function(){},function(){},"1B 61 01");
            BTPrinter.printText(function(){},function(){},"Thank You!");

            //feed 3 lines
            BTPrinter.printPOSCommand(function(){},function(){},"1B 64 03");

            BTPrinter.disconnect();

          },function(error){
            console.log(error);
          },printer.device);
        }
      };

      $scope.promptQuantity = function(){
        $scope.data = {};

        $ionicPopup.show({
          template:'<input type="number" ng-model="data.quantity" placeholder="Quantity">',
          title:'Input Quantity',
          scope:$scope,
          buttons:[
            {text:'Cancel'},
            {
              text:'<b>Set</b>',
              type:'button-positive',
              onTap:function(e){
                return $scope.data.quantity;
              }
            }
          ]
        }).then(function(res){
          console.log(res);

          if(res == undefined){
            return 0;
          }

          if(res == "" || res == null || isNaN(res) || res == 0 || res == undefined || res < 1){
            alert('Invalid value');
            return 0;
          }

          vm.quantity = res;
        });
      };

      $scope.Items.getCategories($scope.Items.category);
      $scope.Items.getByCategory($scope.Items.category);
      $scope.Discounts.getAll();
      
      // prep modals
      $ionicModal.fromTemplateUrl('sales/templates/quantity-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.quantityModal = modal;
      });

      $ionicModal.fromTemplateUrl('sales/templates/checkout-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.checkoutModal = modal;
      });

      $ionicModal.fromTemplateUrl('sales/templates/customer-modal.html',{
        scope:$scope,
        animation:'slide-in-up',
      }).then(function(modal){
        $scope.customerModal = modal;
      });

      $ionicModal.fromTemplateUrl('sales/templates/payments-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.paymentsModal = modal;
      });
      // end of modals

      $scope.chooseFilter = function() {
        var menu = [
          {
            text: 'Items'
          },
          {
            text: 'Discounts'
          }
        ];

        var hideSheet = $ionicActionSheet.show({
          buttons: menu,
          cancelText: 'Cancel',
          cancel: function() {

          },
          buttonClicked: function(index) {
            vm.filterText = menu[index].text;
            return true;
          }
        });
      }

      $scope.$on('$destroy', function(){
        $scope.quantityModal.remove();
        $scope.checkoutModal.remove();
        $scope.customerModal.remove();
        $scope.paymentsModal.remove();
      });

      $scope.keyPressed = function(keyCode) {
        // TODO: process keycode here
        switch (keyCode) {
          case -1:
            vm.amount = 0;
            break;
          case -2:
            // addCustomValue();
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
  
        function enter(keyCode) {
          vm.amount = vm.amount * 10 + parseInt(keyCode.toString());
        }
      }

    }
})();
