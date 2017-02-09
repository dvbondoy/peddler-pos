(function(){
	'use strict';

	angular.module('app.model')
	.factory('Discount', Discount);

	Discount.$inject = ['$q'];
	function Discount($q) {
		return {
			getAll:getAll,
			get:get,
			add:add,
			remove:remove
		};

		function getAll() {
			return $q.when(_db.allDocs({include_docs:true,startkey:'discount',endkey:'discount\uffff'})
				.then(function(docs){
					return docs.rows.map(function(row){
						return row.doc;
					});
				}).catch(function(error){
					return error;
				}));
		}

		function get(id) {
			return $q.when(_db.allDocs({include_docs:true,startkey:id, endkey:id+'\uffff'})
				.then(function(result){
					return result.rows.map(function(row){
						return row.doc;
					});
				}).catch(function(error){
					return error;
				}));
		}

		function add(discount) {
			discount._id = 'discount/'+discount.description;
			discount.type = 'discount';
			discount.percentage = discount.percentage / 100;

			return $q.when(_db.put(discount).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}

		function remove(discount) {
			return $q.when(_db.remove(discount).then(function(result){
				return result;
			}).catch(function(error){
				return error
			}));
		}
	}
})();