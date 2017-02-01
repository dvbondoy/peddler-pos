(function(){
	'use strict';

	angular.module('app.model')
	.factory('Discount', Discount);

	Discount.$inject = ['$q'];
	function Discount($q) {
		return {
			getDiscounts:getDiscounts,
			getDiscount:getDiscount,
			addDiscount:addDiscount,
			removeDiscount:removeDiscount
		};

		function getDiscounts() {
			return $q.when(_db.allDocs({include_docs:true,startkey:'discount',endkey:'discount\uffff'})
				.then(function(docs){
					return docs.rows.map(function(row){
						return row.doc;
					});
				}).catch(function(error){
					return error;
				}));
		}

		function getDiscount(id) {
			return $q.when(_db.allDocs({include_docs:true,startkey:id, endkey:id+'\uffff'})
				.then(function(result){
					return result.rows.map(function(row){
						return row.doc;
					});
				}).catch(function(error){
					return error;
				}));
		}

		function addDiscount(discount) {
			return $q.when(_db.put(discount).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}

		function removeDiscount(id) {
			return $q.when(_db.remove(id).then(function(result){
				return result;
			}).catch(function(error){
				return error
			}));
		}
	}
})();