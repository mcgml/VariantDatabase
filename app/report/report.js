'use strict';

//todo turn off up/downstream effects + intergenic effects
//todo add validated transcript fields
//todo fix exac conversion
//todo add population frequency modal to report page
//todo add new gene panels
//todo add drop down rows to annotation table -- include protein domains. Also add LSDB links
//todo add fields and output for SHIRE import

angular.module('variantdatabase.report', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/report', {
            templateUrl: 'report/report.html',
            controller: 'ReportCtrl'
        });
    }])

    .controller('ReportCtrl', ['$scope', '$window', '$http', 'Notification', '$uibModal', function ($scope, $window, $http, Notification, $uibModal) {

        var cat20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896"];
        $scope.items = ['item1', 'item2', 'item3'];
        $scope.selectedVariantFilter = -1;

        $scope.donutChartOptions = {
            chart: {
                type: 'pieChart',
                height: 250,
                noData: "",
                donut: true,
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || cat20[key % cat20.length]; },
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: false,
                pie: {
                    dispatch: {
                        elementClick: function(e) {
                            $scope.selectedVariantFilter = e.index;
                            $scope.$apply();
                        }
                    }
                },
                transitionDuration: 500
            }
        };

        function checkInput(field, value){
            if (value === '' || value === undefined){
                Notification.error('Check ' + field + ' input');
                return false;
            }
            return true;
        }

        function convertVariantToRangeFunction(variantId){
            var split1 = variantId.split(":");
            var split2 = split1[1].split(">");

            var refLength = split2[0].match(/\D/g).length;
            var altLength = split2[1].match(/\D/g).length;

            var startPosition = split2[0].replace(/\D/g, '');
            var endPosition = (startPosition - refLength) + altLength;

            return split1[0] + ":" + startPosition + "-" + endPosition;
        }

        $scope.openEnsemblLink = function(variantId){
            $window.open('http://grch37.ensembl.org/Homo_sapiens/Location/View?r=' + convertVariantToRangeFunction(variantId), '_blank');
        };

        $scope.openUCSCLink = function(variantId){
            $window.open('http://genome.ucsc.edu/cgi-bin/hgTracks?org=human&db=hg19&position=chr' + convertVariantToRangeFunction(variantId), '_blank');
        };

        $scope.openExACLink = function(variantId){

            var split1 = variantId.split(":");
            var split2 = split1[1].split(">");
            var startPosition = split2[0].replace(/\D/g, '');
            var refAllele = split2[0].replace(/\d/g, '');
            var altAllele = split2[1].replace(/\d/g, '');

            $window.open('http://exac.broadinstitute.org/variant/' + split1[0] + '-' + startPosition + '-' + refAllele + '-' + altAllele, '_blank');
        };

        $scope.getFiteredVariants = function () {

            //reset piechart filter
            $scope.selectedVariantFilter = -1;

            //check input
            if (!checkInput("Sample", $scope.selectedAnalysis)) return;
            if (!checkInput("Panel", $scope.selectedVirtualPanel)) return;
            if (!checkInput("Workflow", $scope.selectedWorkflow)) return;

            $http.post('/api/variantdatabase' + $scope.selectedWorkflow.Path,
                {
                    'RunInfoNodeId' : $scope.selectedAnalysis.RunInfoNodeId,
                    'PanelNodeId' : $scope.selectedVirtualPanel.PanelNodeId
                })
                .then(function(response) {
                    $scope.filteredVariants = response.data;
                    Notification('Operation successful');
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

        };

        $scope.openVariantInformationModal = function (variant) {

            $http.post('/api/variantdatabase/populationfrequency',
                {
                    'NodeId' : variant.VariantNodeId
                })
                .then(function(response) {
                    variant.PopulationFrequency = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            $http.post('/api/variantdatabase/functionalannotation',
                {
                    'NodeId' : variant.VariantNodeId
                })
                .then(function(response) {
                    variant.Annotation = response.data;
                }, function(response) {
                    Notification.error(response);
                    console.log("ERROR: " + response);
                });

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'templates/VariantInformationModal.html',
                controller: 'VariantInformationCtrl',
                windowClass: 'app-modal-window',
                size: 'lg',
                resolve: {
                    items: function () {
                        return variant;
                    }
                }
            });
        };

        $scope.exportVariants = function(){
            var saved = [];

            //skip missing dataset
            if ($scope.filteredVariants === null) return;

            for (var key in $scope.filteredVariants.Variants) {
                if ($scope.filteredVariants.Variants.hasOwnProperty(key)) {
                    if ($scope.filteredVariants.Variants[key].Selected){

                        var tempObj = $scope.filteredVariants.Variants[key];
                        saved.push(tempObj);

                    }
                }
            }

            //write output file
            var blob = new Blob([JSON.stringify(saved)]);
            saveAs(blob, "export.json");

        };

        $scope.launchIGV = function (remoteBamFilePath, variantId){
            $window.open('http://localhost:60151/load?file=' + remoteBamFilePath + '&locus=' + convertVariantToRangeFunction(variantId) + '&genome=37', '_blank');
        };

        $http.get('/api/variantdatabase/analyses', {

        }).then(function(response) {
            $scope.analyses = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

        $http.get('/api/variantdatabase/panels', {

        }).then(function(response) {
            $scope.virtualPanels = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

        $http.get('/api/variantdatabase/workflows', {

        }).then(function(response) {
            $scope.workflows = response.data;
        }, function(response) {
            Notification.error(response);
            console.log("ERROR: " + response);
        });

    }]);