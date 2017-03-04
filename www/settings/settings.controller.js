(function() {
'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', SettingsController);

    SettingsController.$inject = ['$scope', 'PouchHelper', 'Discount', 'Customer', '$ionicModal', '$ionicLoading','Local','Item','Uom','$ionicPopover','$ionicPopup'];
    function SettingsController($scope,PouchHelper,Discount,Customer,$ionicModal,$ionicLoading,Local,Item,Uom,$ionicPopover,$ionicPopup) {
      var vm = this;

      Local.getPrinter().then(function(result){
        vm.auto_print = result.auto_print;
        console.log(vm.auto_print);
        console.log(JSON.stringify(result));
      });

      $scope.Items = {
        list:[],
        category:null,
        categories:[],
        getCategories:function(category){
          console.log('getCategories');
          console.log(category);
          var items = this;

          category == undefined ? category = items.category : category;

          category !== null ? vm.showBack = true : vm.showBack = false;

          console.log(category);

          // get categories
          Item.getCategories(category).then(function(result){
            console.log(JSON.stringify(result));
            items.categories = result;
          });

          // get items inside this category
          Item.getItemsByCategory(category).then(function(result){
            console.log(JSON.stringify(result));
            items.list = result;
          });
        },
        addCategory:function(){
          var items = this;

          $scope.data = {};

          // var category = prompt("Enter new category");
          $ionicPopup.show({
            template:'<input type="text" ng-model="data.category" placeholder="Category">',
            title:'New Category',
            scope:$scope,
            buttons:[
              {text:'Cancel'},
              {
                text:'<b>Save</b>',
                type:'button-positive',
                onTap:function(e){
                  return $scope.data.category;
                }
              }
            ]
          }).then(function(res){
            console.log(res);

            if(res == undefined){
              return 0;
            }

            var id = items.category == null ? 'category/'+items.category+'/'+res : items.category+'/'+res;

            var data = {
              _id:id,
              category:res,
              parent_category:items.category,
              type:'category'
            };

            Item.addCategory(data).then(function(result){
              console.log(JSON.stringify(result));
              if(result.error){
                alert(result.message);
              }

              items.getCategories();
            });
            
          });
        
          // if(category == undefined || category == ""){
          //   return 0;
          // }

          // var id = items.category == null ? 'category/'+items.category+'/'+category : items.category+'/'+category;

          // var data = {
          //   _id:id,
          //   category:category,
          //   parent_category:items.category,
          //   type:'category'
          // };

          // Item.addCategory(data).then(function(result){
          //   console.log(JSON.stringify(result));
          //   if(result.error){
          //     alert(result.message);
          //   }

          //   items.getCategories();
          // });
        },
        openCategory:function(category){
          var items = this;

          category == undefined ? category = items.category : category;
          console.log(category);

          items.category = category.id;

          items.getCategories(items.category);
        },
        removeCategory:function(category){
          var items = this;

          // if(!confirm('You are about to delete this category and all its items. Continue?')){
          //   return 0;
          // }
          $ionicPopup.confirm({
            title:'Corfirm DELETE',
            template:'Delete category? All items inside will be deleted too.'
          }).then(function(res){
            if(res){
              category == undefined ? category = items.category : category;
              
              Item.removeCategory(category).then(function(result){
                if(result.error){
                  alert(result.message);
                  return 0;
                }

                items.back();
                // alert('Deleted');
                $ionicPopup.alert({
                  title:'Done',
                  template:category+' Deleted!'
                });
              });
            }
          });

          // category == undefined ? category = items.category : category;

          // console.log(category);

          // Item.removeCategory(category).then(function(result){
          //   if(result.error){
          //     alert(result.message);
          //     return 0;
          //   }

          //   items.back();
          //   alert('Deleted');
          // });
        },
        addItem:function(){
          var items = this;

          var item = {
            _id:'item/'+items.category+'/'+vm.item.description,
            category:items.category,
            description:vm.item.description,
            print_description:vm.item.print_description,
            price:vm.item.price,
            type:'item'
          };

          Item.addItem(item).then(function(result){
            if(result.error){
              alert(result.message);
            }

            if(result.ok){
              $scope.itemModal.hide();
              items.getCategories();
            }

          });
        },
        removeItem:function(i){
          var items = this;

          console.log(i);

          $ionicPopup.confirm({
            title:'Confirm Delete',
            template:'Are you sure you want to DELETE?'
          }).then(function(res){
            if(res){
              Item.removeItem(i).then(function(result){
                if(result.error){
                  alert(result.message);
                }

                $scope.itemModal.hide();

                items.getCategories();
              });
            }
          });
          // if(confirm('Delete '+i.description+'?')){
          //   Item.removeItem(i).then(function(result){
          //     if(result.error){
          //       alert(result.message);
          //     }

          //     $scope.itemModal.hide();

          //     items.getCategories();
          //   });
          // }
        },
        byCategory:function(category){
          var items = this;

          category == undefined ? category = items.category : category;

          Item.getItemsByCategory(category).then(function(result){
            items.list = result;
          });
        },
        back:function(){
          var items = this;

          items.category = items.category.substring(0, items.category.lastIndexOf('/'));
          
          if(items.category == 'category/null'){items.category = null;}

          items.getCategories(items.category);
        },
        import:function(){
          alert('Not yet implemented.');
        }
      };

      $scope.Discount = {
        total_count:0,
        list:[],
        getAll:function(){
          var discount = this;

          Discount.getAll('discount/').then(function(result){
            discount.list = result;
            vm.discount_count = result.length;
          });
        },
        add:function(disc){
          var discount = this;

          Discount.add(disc).then(function(result){
            console.log(result);
            if(result.ok){
              $scope.discountModal.hide();
              discount.getAll();
            }else if(result.error){
              alert(result.message);
            }
          });
        },
        remove:function(disc){
          var discount = this;
          if(confirm('You\'re about to delete this discount. Continue?')){
            Discount.remove(disc).then(function(result){
              if(result.ok){
                $scope.discountModal.hide();
                discount.getAll();
                alert('Deleted.');
              }else if(result.error){
                alert(result.message);
              }
            });
          }
        },
        edit:function(disc){
          var discount = this;

          console.log(disc);

          vm.discount = {};

          vm.discount.description = disc.description;
          vm.discount.percentage = disc.percentage*100;

          $scope.discountModal.show();
        }
      };

      $scope.purgeDatabase = function() {
        var ask = confirm('You\'re about DELETE all records. Continue?');
        if(ask) {
          PouchHelper.purgeDB().then(function(result){
            console.log('purge');
            console.log(result);
          });
        }
      }

      $scope.Customer = {
        list:[],
        add:function(cust){
          var customer = this;

          Customer.add(cust).then(function(result){
            if(result.error){
              alert(result.message);
            }

            if(result.ok){
              customer.getAll();
              $scope.customerModal.hide();
            }
          });
        },
        getAll:function(){
          var customer = this;
          Customer.getAll().then(function(result){
            customer.list = result;
          });
        },
        remove:function(cust){
          var customer = this;

          if(confirm('You\'re about to delete '+cust.company+'. Continue?')){
            Customer.remove(cust).then(function(result){
              if(result.ok){
                $scope.customerModal.hide();
                customer.getAll();
                alert('Deleted.');
              }else if(result.error){
                alert(result.message);
              }
            });
          }
        }
      };

      $scope.Printer = {
        status:'offline',
        device:null,
        devices:[],
        auto_print:false,
        get:function(){
          var printer = this;

          Local.getPrinter().then(function(result){
            if(result.error){
              console.log(result);
              return 0;
            }

            printer.device = result.printer;

            printer.auto_print = result.auto_print;
            
            console.log(result);
          });
        },
        check:function(){
          var printer = this;

          $ionicLoading.show({template:'Searching...'});

          Local.getPrinter().then(function(device){
            if(device.error){
              alert(error.message);
              return 0;
            }

            printer.device = device.printer;

            console.log('SettingsController:279');
            console.log(JSON.stringify(device));
            
            BTPrinter.connect(function(success){
              printer.status = 'online';
              // alert(printer.status);
              vm.printer_status = 'online';
            },function(error){
              alert(error);
              printer.status = 'offline';
              vm.printer_status = 'offline';
            },printer.device);

            BTPrinter.disconnect();
            $ionicLoading.hide();
          });

        },
        set:function(print){
          var printer = this;

          var data = {
            printer:print,
            auto_print:false
          };

          Local.addPrinter(data).then(function(result){
            if(result.error){
              alert(result.message);
              return 0;
            }

            printer.device = data.printer;
          });
        },
        scan:function(){
          var printer = this;

          $ionicLoading.show({template:'Scanning...'})
          BTPrinter.list(function(data){
            printer.devices = data;

            $ionicLoading.hide();
            
            $scope.printerModal.show();
          },function(error){
            alert(error);
          });
        },
        toggleAutoPrint:function(){
          var printer = this;

          Local.getPrinter().then(function(result){
            if(result.error){
              return 0;
            }

            result.auto_print = vm.auto_print;
            Local.addPrinter(result).then(function(result){
              console.log(JSON.stringify(result));
            });
          });
        },
        test:function(){
          var printer = this;

          if(printer.device == null){
            alert('Set printer first');
            return 0;
          }

          var items = [
            {_id:'item001',quantity:'2',price:'12',amount:'24'},
            {_id:'item002',quantity:'1',price:'10',amount:'10'}
          ];

          BTPrinter.connect(function(success){
            //center align
            BTPrinter.printPOSCommand(function(){},function(){},"1B 61 01");
            BTPrinter.printText(function(){},function(){},"Sari2x Store\n");
            BTPrinter.printText(function(){},function(){},"123 St. Somewhere\n\n\n");
            //left align
            BTPrinter.printPOSCommand(function(){},function(){},"1B 61 00");
            BTPrinter.printText(function(){},function(){},"Customer: "+"XYZ Co\n");
            BTPrinter.printText(function(){},function(){},"Date: "+moment().format("YYYY-MM-DD")+"\n");
            BTPrinter.printText(function(){},function(){},"Time: "+moment().format("kk:mm:ss")+"\n\n");
            //print obj
            items.forEach(function(value){
              BTPrinter.printText(function(){},function(){},
                value.quantity+" "+
                value._id.slice(6)+
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
            BTPrinter.printText(function(){},function(){},"SUB-TOTAL        "+34.00+"\n");
            BTPrinter.printText(function(){},function(){},"DISCOUNT         "+0.00+"\n");
            BTPrinter.printText(function(){},function(){},"TOTAL            "+34.00+"\n\n\n");

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

      $scope.Uom = {
        list:[],
        add:function(unit){
          var uom = this;

          unit._id = 'uom/'+unit.description;
          Uom.add(unit).then(function(result){
            if(result.error){
              alert(result.message);
            }

            console.log(result);
          });
        }
      };

      // prep modals
      $ionicModal.fromTemplateUrl('settings/templates/customer-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.customerModal = modal;
      });

      $ionicModal.fromTemplateUrl('settings/templates/discount-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.discountModal = modal;
      });

      $ionicModal.fromTemplateUrl('settings/templates/printer-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.printerModal = modal;
      });

      $ionicModal.fromTemplateUrl('settings/templates/item-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.itemModal = modal;
      });

      $ionicModal.fromTemplateUrl('settings/templates/units-modal.html',{
        scope:$scope,
        animation:'slide-in-up'
      }).then(function(modal){
        $scope.unitsModal = modal;
      });
      // end of modals

      // popovers
      $ionicPopover.fromTemplateUrl('settings/templates/items-popover.html',{
        scope:$scope
      }).then(function(popover){
        $scope.itemsPopover = popover;
      });
      // end of popovers

      $scope.Items.getCategories(null);
      $scope.Items.byCategory(null);
      $scope.Discount.getAll();
      $scope.Customer.getAll();
      $scope.Printer.get();

      $scope.$on('$destroy',function(){
        $scope.discountModal.remove();
        $scope.customerModal.remove();
        $scope.printerModal.remove();
        $scope.itemModal.remove();
        $scope.unitsModal.remove();
        $scope.itemsPopover.remove();
      });

    }
    
})();
