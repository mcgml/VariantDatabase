'use strict';

// Declare app level module which depends on views, and components
angular.module('variantdatabase', [ 'ngRoute', 'variantdatabase.login', 'variantdatabase.report', 'variantdatabase.search', 'variantdatabase.account', 'variantdatabase.admin'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise(
            {
                redirectTo: '/login'
            });
    }])

    .config(function(NotificationProvider) {
        NotificationProvider.setOptions(
            {
                delay: 2500,
                startTop: 20,
                startRight: 10,
                verticalSpacing: 20,
                horizontalSpacing: 20,
                positionX: 'right',
                positionY: 'bottom'
            }
        )
    })

    .controller('VariantOccurrenceCtrl', function ($scope, $uibModalInstance, items, $window) {
        $scope.items = items;

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    })

    .controller('VariantAnnotationCtrl', function ($scope, $uibModalInstance, items, $window) {

        var cat20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896"];
        $scope.items = items;

        $scope.barChartOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 250,
                noData: "",
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || cat20[key % cat20.length]; },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: false,
                showXAxis: false,
                showYAxis: true,
                "yAxis": {
                    "axisLabel": "Percentage Coverage"
                },
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                transitionDuration: 500
            }
        };

        function keywordSearchFromAnnotationObject(annotation){
            var keywords = '';

            if (annotation.hasOwnProperty('SymbolId')){
                keywords += " \"";
                keywords += annotation.SymbolId;
                keywords += "\"";
            }

            if (annotation.hasOwnProperty('HGVSc')){
                keywords += " \"";
                keywords += annotation.HGVSc.substring(2);
                keywords += "\"";
            }

            if (annotation.hasOwnProperty('HGVSp')){
                if (annotation.HGVSp !== "p.="){
                    keywords += " \"";
                    keywords += annotation.HGVSp.substring(2);
                    keywords += "\"";
                }
            }

            return keywords;
        }

        $scope.openGoogleScholarLink = function(annotation){
            var search = keywordSearchFromAnnotationObject(annotation);
            if(search === undefined || search === ''){
                return;
            }
            $window.open('https://scholar.google.co.uk/scholar?q=' + search, '_blank');
        };

        $scope.openClinVarLink = function(annotation){
            var search = keywordSearchFromAnnotationObject(annotation);
            if(search === undefined || search === ''){
                return;
            }
            $window.open('http://www.ncbi.nlm.nih.gov/clinvar/?term=' + search, '_blank');
        };

        $scope.openPfamLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open('http://pfam.xfam.org/family/' + accessions[i], '_blank');
            }
        };

        $scope.openPantherLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open('http://www.pantherdb.org/panther/family.do?clsAccession=' + accessions[i], '_blank');
            }
        };

        $scope.openPrositeLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open('http://prosite.expasy.org/' + accessions[i], '_blank');
            }
        };

        $scope.openSuperfamilyLink = function(accessions){
            var arrayLength = accessions.length;
            for (var i = 0; i < arrayLength; i++) {
                $window.open('http://supfam.org/SUPERFAMILY/cgi-bin/scop.cgi?sunid=' + accessions[i].replace('SSF', ''), '_blank');
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    });
