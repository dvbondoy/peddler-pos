(function(){
	'use strict';

	angular.module('app.model')
	.factory('Uom', Uom);

	Uom.$inject = ['$q'];
	function Uom($q) {
		var _item;

		return {
			setItem:setItem,
			getItem:getItem,
			add:add,
			remove:remove,
			get:get,
			getAll:getAll
		};

		function setItem(item) {
			_item = item;
		};

		function getItem() {
			return _item;
		}

		function add(unit) {
			unit.type = 'uom';
			
			return $q.when(_db.put(unit).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}

		function remove(unit) {
			return $q.when(_db.remove(unit).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}

		function get(id) {
			return $q.when(_db.get(id).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}

		function getAll() {
			return $q.when(_db.allDocs({include_docs:true,startkey:'uom/',endkey:'uom/\uffff'})
				.then(function(result){
					result.rows.map(function(row){
						return row.doc;
					});
				}).catch(function(error){
					return error;
				}));
		}

	}

})();