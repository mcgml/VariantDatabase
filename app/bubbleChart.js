// Define bubble chart
var BubbleChart = d3Kit.factory.createChart(
    // First argument is the default options for this chart
    {
        margin: {right: 400, left: 400, top: 50},
        initialWidth: 800,
        initialHeight: 100
    },
    // The second argument is an Array that contains
    // names of custom events from this chart.
    // In this example chart,
    // it will dispatch event "bubbleClick" when users click on a bubble.
    ['bubbleClick'],
    // The third argument is an internal constructor.
    // This is where you would implement a bubble chart
    // inside the passed skeleton.
    function(skeleton){
        var layers = skeleton.getLayerOrganizer();
        var dispatch = skeleton.getDispatcher();
        var color = d3.scale.category10();

        layers.create(['content', 'x-axis']);

        var x = d3.scale.linear()
            .range([0, skeleton.getInnerWidth()]);

        var visualize = d3Kit.helper.debounce(function(){
            if(!skeleton.hasData()){
                d3Kit.helper.removeAllChildren(layers.get('content'));
                return;
            }
            var data = skeleton.data();

            x.domain(d3.extent(data, function(d){return d.x;}))
                .range([0, skeleton.getInnerWidth()]);

            var selection = layers.get('content').selectAll('circle')
                .data(data);

            selection.exit().remove();

            selection.enter().append('circle')
                .attr('cx', function(d){return x(d.x);})
                .on('click', dispatch.bubbleClick);

            selection
                .attr('cx', function(d){return x(d.x);})
                .attr('r', function(d){return d.r;})
                .style('fill', function(d, i){return color(i);});

        }, 10);

        skeleton
            .autoResize('width')
            .on('resize', visualize)
            .on('data', visualize);
    }
);