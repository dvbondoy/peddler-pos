(function(){
	'use strict';

	angular.module('app.model')
	.factory('Local',Local);

	Local.$inject = ['$q'];
	function Local($q) {
		return {
			addPrinter:addPrinter,
			getPrinter:getPrinter,
			addAppInfo:addAppInfo,
			getAppInfo:getAppInfo
		};

		function addPrinter(printer) {
			printer._id = '_local/printer';

			return $q.when(_db.put(printer).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}

		function getPrinter() {
			return $q.when(_db.get('_local/printer').then(function(printer){
				return printer;
			}).catch(function(error){
				return error;
			}));
		}

		function addAppInfo(info){
			info._id = '_local/info';

			return $q.when(_db.put(info).then(function(result){
				return result;
			}).catch(function(error){
				return error;
			}));
		}

		function getAppInfo(){
			return $q.when(_db.get('_local/info').then(function(info){
				return info;
			}).catch(function(error){
				return error;
			}));
		}
	}
})();