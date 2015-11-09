 var width = 960,
   height = 500;

 var levels = [400, 250, 100];

 var force = d3.layout.force()
   .size([width, height])
   .charge(-400)
   .linkDistance(200)
   .on("tick", tick);

 var svg = d3.select("body").append("svg")
   .attr("width", width)
   .attr("height", height)

 var link = svg.selectAll(".link"),
   node = svg.selectAll(".node");

 d3.json("data/data.json", function (error, graph) {
   if (error) throw error;

   var defs = svg.append('svg:defs');

   // Create array for levels to see how many nodes there are in each level

   var levelNodes = {};

   graph.nodes.forEach(function (node, index) {

     defs.append("svg:pattern")
       .attr("id", node.name)
       .attr("width", 100)
       .attr("height", 100)
       .append("svg:image")
       .attr("patternUnits", "userSpaceOnUse")
       .attr("xlink:href", "images/" + node.name + ".jpg")
       .attr("width", 100)
       .attr("height", 100)
       .attr("x", 0)
       .attr("y", 0);

     // Add the animal to the answers section

     $("#answers").append('<img ondragstart="drag(event)" draggable="true" src="images/' + node.name + '.jpg" id="' + node.name + '" />');

     // build the arrow.
     svg.append("svg:defs").selectAll("marker")
       .data([node.name])
       .enter().append("svg:marker") // This section adds in the arrows
       .attr("id", String)
       .attr("viewBox", "0 -5 10 10")
       .attr("refX", 40)
       .style("fill", node.colour)
       .attr("refY", 0)
       .attr("markerWidth", 12)
       .attr("markerHeight", 12)
       .attr("orient", "auto")
       .append("svg:path")
       .attr("d", "M0,-5L10,0L0,5");

     if (!levelNodes[node.level]) {

       levelNodes[node.level] = [];

     }

     levelNodes[node.level].push(node);

   });

   graph.nodes.forEach(function (node, number) {

     node.y = levels[node.level];

     // Calculate centre offset

     var offset = 500 - levelNodes[node.level].length * 200;

     levelNodes[node.level].forEach(function (item, index) {

       if (item === node) {

         node.x = index * 100 + 200 + offset;

       }

     })

     node.fixed = true;

   })

   force
     .nodes(graph.nodes)
     .links(graph.links)
     .start();

   link = link.data(graph.links)
     .enter().append("line")
     .attr("class", "link")
     .style("stroke", function (d) {

       return d.source.colour;

     })
     .attr("marker-end", function (d) {

       return "url(#" + d.source.name + ")";

     })

   node = node.data(graph.nodes)
     .enter().append("circle")
     .attr("id", function (d) {

       return d.name;

     })
     .attr("r", 30)
     .style("fill", function (d) {

       return d.colour;

     })
     .style("stroke", "black")
     .attr("ondragover", "event.preventDefault()")
     .on("drop", function (d) {

       if (current === d.name) {

         d3.select(this).style("fill", "url('#" + d.name + "')");

       } else {

       }

     })
 });

 function tick() {
   link.attr("x1", function (d) {
       return d.source.x;
     })
     .attr("y1", function (d) {
       return d.source.y;
     })
     .attr("x2", function (d) {
       return d.target.x;
     })
     .attr("y2", function (d) {
       return d.target.y;
     });

   node.attr("cx", function (d) {
       return d.x;
     })
     .attr("cy", function (d) {
       return d.y;
     });
 }

 var current = null;

 var drag = function (e) {

   current = e.target.getAttribute("id");

 }
