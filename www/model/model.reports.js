(function() {
'use strict';

    angular
        .module('app.model')
        .factory('Report', Report);

    Report.$inject = ['$q'];
    function Report($q) {
        return {
            salesToday:salesToday,
            salesYesterday:salesYesterday,
            dateRange:dateRange
        };

        function salesToday(){
            var now = moment().format('YYYY-MM-DD');

            return $q.when(_db.allDocs({include_docs:true,startkey:'sale/'+now,endkey:'sale/'+now+'\uffff'})
            .then(function(docs){
                return docs.rows.map(function(row){
                    return row.doc;
                });
            }).catch(function(error){
                return error;
            }));
        }

        function salesYesterday() {
            var yesterdate = moment().subtract(1, 'days').format('YYYY-MM-DD');

            return $q.when(_db.allDocs({include_docs:true,startkey:'sale/'+yesterdate,endkey:'sale/'+yesterdate+'uffff'})
            .then(function(docs){
                return docs.rows.map(function(row){
                    return row.doc;
                });
            }).catch(function(error){
                return error;
            }));
        }

        function dateRange(from_date, to_date) {
            return $q.when(_db.allDocs({include_docs:true,startkey:'sale/'+moment(from_date).format('YYYY-MM-DD').toString(),endkey:'sale/'+moment(to_date).format('YYYY-MM-DD')+'\uffff'})
            .then(function(docs){
                return docs.rows.map(function(row){
                    return row.doc;
                });
            }).catch(function(error){
                return error;
            }));
        }
    }
})();