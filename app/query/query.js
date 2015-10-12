'use strict';

angular.module('variantdb.query', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui-notification', 'nvd3'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/query', {
            templateUrl: 'query/query.html',
            controller: 'QueryCtrl'
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

    .filter('consequenceStrip', function() {
        return function (input) {
            return input.substring(4, input.length - 12);
        }
    })

    .filter('convertVariantToRange', function() {
        return function (input) {
            return input; //todo
        }
    })

    .filter('convertVariantToExAC', function() {
        return function (input) {
            return input; //todo
        }
    })

    .controller('QueryCtrl', ['$scope', '$http', 'Notification', function ($scope, $http, Notification) {

        function category20(n) {
            var cat20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896"];
            return cat20[n % cat20.length];
        }

        $scope.chevronClass = "glyphicon glyphicon-chevron-down";

        $scope.testData = [
            {
                values: [
                    {
                        "label" : "FBN1" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "BRCA1" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "BRCA2" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "ARSE" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "TEST" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "GENE" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "NF1" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "PsS2" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "df" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "evrv" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "vsvsd" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "sdvds" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "dsv" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "sds" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "ebrebrt" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "erve" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "ververe" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "chyy" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "bik7jv" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "wdqwdwq" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "regrebre" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "regver" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "lkn" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "iojo" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "wcw" ,
                        "value" : Math.random() * 100
                    } ,
                    {
                        "label" : "lmlkmce" ,
                        "value" : Math.random() * 100
                    }
                ]
            }
        ];

        $scope.toggleDetail = function($index, variantId) {

            //get annotation
            $http.post('/api/seraph', {
                cache: true,
                query:
                "OPTIONAL MATCH (v:Variant {VariantId:\"" + variantId + "\"})-[c]-(a:Annotation)-[]-(f:Feature)-[b:HAS_PROTEIN_CODING_BIOTYPE]-(sy:Symbol) " +
                "RETURN f.FeatureId as Feature,a.Exon as Exon, a.Intron as Intron,type(c) as Consequence,a.HGVSc as HGVSc,a.HGVSp as HGVSp,a.Sift as SIFT,a.Polyphen as PolyPhen,sy.SymbolId as Symbol",
                params: {}
            }).then(function(response) {
                $scope.annotations = response.data;
            }, function(response) {
                console.log("ERROR: " + response);
            });

            //show row
            $scope.activePosition = $scope.activePosition == $index ? -1 : $index;
            if ($scope.chevronClass == "glyphicon glyphicon-chevron-down"){
                $scope.chevronClass =  "glyphicon glyphicon-chevron-up";
            } else if ($scope.chevronClass == "glyphicon glyphicon-chevron-up"){
                $scope.chevronClass =  "glyphicon glyphicon-chevron-down";
            }

        };

        //get available filtering workflows todo: plugin
        $http.get('/api/workflows').then(function(response) {
            $scope.workflows = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

        //get all analyses todo: plugin
        $http.post('/api/seraph', {
            query:
            "MATCH (s:Sample)-[:HAS_ANALYSIS]->(r:RunInfo) " +
            "RETURN s.SampleId as SampleId,r.LibraryId as LibraryId, r.RunId as RunId",
            params: {}
        }).then(function(response) {
            $scope.analyses = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

        //get all virtual panels todo: plugin
        $http.post('/api/seraph', {
            query:
                "MATCH (v:VirtualPanel) RETURN v.PanelName as PanelName",
            params: {}
        }).then(function(response) {
            $scope.virtualPanels = response.data;
        }, function(response) {
            console.log("ERROR: " + response);
        });

        //stratify variants
        $scope.filterVariants = function(){
            $http.post('/api/variantfilter',
                {
                    SampleId : $scope.selectedAnalysis.SampleId,
                    RunId : $scope.selectedAnalysis.RunId,
                    LibraryId : $scope.selectedAnalysis.LibraryId,
                    PanelName : $scope.selectedPanel.PanelName,
                    WorkflowPath : $scope.selectedWorkflow.Path
                }
            ).then(function(response) {
                    $scope.selectedFilter = -1;
                    $scope.filteredVariants = response.data;
                    $scope.coverageData = $scope.testData;
                    Notification('Operation successful');
                }, function(response) {
                    console.log("ERROR: " + response);
                });
        };

        //create pie navigation chart
        $scope.donutChartOptions = {
            chart: {
                type: 'pieChart',
                height: 250,
                donut: true,
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || category20(key); },
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: false,
                pie: {
                    //startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
                    //endAngle: function(d) { return d.endAngle/2 -Math.PI/2 },
                    dispatch: {
                        elementClick: function(e) {
                            $scope.selectedFilter = e.index;
                            $scope.activePosition = -1;
                            $scope.$apply();
                        }
                    }
                },
                transitionDuration: 500
            }
        };

        $scope.barChartOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 250,
                color : function (d, i) { var key = i === undefined ? d : i; return d.color || category20(key); },
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

    }]);