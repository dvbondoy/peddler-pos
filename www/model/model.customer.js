(function(){
	'use strict';

	angular.module('app.model')
	.factory('Customer',Customer);

	Customer.$inject = ['$q'];
	function Customer($q){
		return {
			add:add,
			get:get,
			getAll:getAll,
			remove:remove
		};

		function add(customer) {
			customer._id = 'customer/'+customer.company;
      customer.type = 'customer';
      
			return $q.when(_db.put(customer).then(function(result){
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

		function getAll() {
			return $q.when(_db.allDocs({include_docs:true,startkey:'customer/',endkey:'customer/\uffff'})
				.then(function(docs){
					return docs.rows.map(function(row){
						return row.doc;
					});
				}).catch(function(error){
					return error;
				}));
		}

		function remove(customer) {
			return $q.when(_db.remove(customer).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}
	}
})();