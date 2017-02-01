(function(){
	'use strict';

	// var _db;
	

	angular.module('app.pouch')
	.factory('PouchHelper',PouchHelper);

	PouchHelper.$inject = ['$q'];
	function PouchHelper($q) {
		return {
			createID:createID,
			purgeDB:purgeDB
		};

		// function initDB() {
		// 	_db = new PouchDB('peddlerpos', {adapter:'websql'});
		// }

		function createID(type, id, connector) {
			connector == undefined ? connector = '/' : connector;

		}

		function purgeDB() {
			return $q.when(_db.destroy().then(function(result){
				return result;
			}));
		}

		// return service;
	}
	
})();