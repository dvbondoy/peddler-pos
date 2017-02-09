(function() {
'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', SettingsController);

    SettingsController.$inject = ['$scope', 'PouchHelper', 'Discount', 'Customer', '$ionicModal', '$ionicLoading','Local','Item','Uom'];
    function SettingsController($scope,PouchHelper,Discount,Customer,$ionicModal,$ionicLoading,Local,Item,Uom) {
      var vm = this;

      $scope.Items = {
        list:[],
        category:null,
        categories:[],
        getCategories:function(category){
          var items = this;

          category == undefined ? category = items.category : category;

          category !== null ? vm.showBack = true : vm.showBack = false;

          // get categories
          Item.getCategories(category).then(function(result){
            items.categories = result;
          });

          // get items inside this category
          Item.getItemsByCategory(category).then(function(result){
            items.list = result;
          });
        },
        addCategory:function(){
          var items = this;

          var category = prompt("Enter new category");
        
          if(category == undefined || category == ""){
            return 0;
          }

          var id = items.category == null ? 'category/'+items.category+'/'+category : items.category+'/'+category;

          var data = {
            _id:id,
            category:category,
            parent_category:items.category,
            type:'category'
          };

          Item.addCategory(data).then(function(result){
            if(result.error){
              alert(result.message);
            }

            items.getCategories();
          });
        },
        openCategory:function(category){
          var items = this;

          category == undefined ? category = items.category : category;
          console.log(category);

          items.category = category.id;

          items.getCategories(items.category);
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

          if(confirm('Delete '+i.description+'?')){
            Item.removeItem(i).then(function(result){
              if(result.error){
                alert(result.message);
              }

              $scope.itemModal.hide();

              items.getCategories();
            });
          }
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
        view:function(disc){
          var discount = this;

          vm.discount = disc;

          
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
        check:function(){
          var printer = this;

          $ionicLoading.show({template:'Connecting...'});

          Local.getPrinter().then(function(device){
            if(device.error){
              alert(error.message);
              return 0;
            }

            printer.device = device;
            
            BTPrinter.connect(function(success){
              printer.status = 'online';
              alert(printer.status);
            },function(error){
              alert(error);
            },device);

            BTPrinter.disconnect();
            $ionicLoading.hide();
          });

        },
        set:function(print){
          var printer = this;

          var data = {
            printer:print,
          };

          Local.addPrinter(data).then(function(result){
            if(reslt.error){
              alert(error.message);
            }

            alert('Printer is now set to '+result.printer);
            printer.device = result.printer
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
        }
      }

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
      }

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

      $scope.Customer.getAll();
      $scope.Discount.getAll();
      $scope.Items.byCategory();
      $scope.Items.getCategories();

      $scope.$on('$destroy',function(){
        $scope.discountModal.remove();
        $scope.customerModal.remove();
        $scope.printerModal.remove();
        $scope.itemModal.remove();
        $scope.unitsModal.remove();
      });

    }
    
})();
