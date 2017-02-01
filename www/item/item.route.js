(function() {
	'use strict';

	angular.module('app.item').run(appRun);

	appRun.$inject = ['routerHelper'];
	function appRun(routerHelper) {
		routerHelper.configureStates(getStates());
	}

	function getStates() {
		return [
			{
				state:'app.item-home',
				config:{
					url:'/item-home',
					templateUrl:'item/templates/item-home.html'
				}
			},
			{
				state:'app.category',
				config:{
					url:'/category',
					templateUrl:'item/templates/category.html'
				}
			},
			{
				state:'app.item',
				config:{
					url:'/item',
					templateUrl:'item/templates/item.html'
				}
			},
			{
				state:'app.discounts',
				config:{
					url:'/discounts',
					templateUrl:'item/templates/discounts.html'
				}
			},
			{
				state:'app.tax',
				config:{
					url:'/tax',
					templateUrl:'item/templates/tax.html'
				}
			}
		];
	}
})();