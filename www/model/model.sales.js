(function(){
	'use strict';

	angular.module('app.model')
	.factory('Sales',Sales);

	Sales.$inject = ['$q'];
	function Sales($q) {
		return {
			add:add,
			get:get
		};

		function add(sale) {
			return $q.when(_db.put(sale).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}

		function get(id) {
			return $q.when(_db.get(id).then(function(doc){
				return doc;
			}).catch(function(error){
				return error;
			}));
		}
	}
})();