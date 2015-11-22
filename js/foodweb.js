 var width = 800,
   height = 640,
   levelHeight = 130,
   topOffset = 70,
   spacing = 100,
   levelNames = ["hello", "world", "this", "another", "what"],
   levels = [],
   answerText = "Congratulations, you have won",
   introText = "Welcome to the Food Web game";

 var levelCounter = 0;

 while (levelCounter < 5) {

   levels.push(levelCounter * levelHeight + topOffset)

   levelCounter += 1;

 }

 // Add in level background div

 levels.forEach(function (element, index) {

   var offset = levelHeight * index;

   $("<div class='level' style='top:" + offset + "px; height:" + levelHeight + "px'><h2 class='level-name'>" + levelNames[index] + "</h2></div>").appendTo("body");

 });

 var force = d3.layout.force()
   .size([width, height])
   .charge(-400)
   .linkDistance(200)
   .on("tick", tick);

 var svg = d3.select("body").append("svg")
   .attr("width", width)
   .attr("height", height)
   .attr("id", "world");

 var link = svg.selectAll(".link"),
   node = svg.selectAll(".node");

 d3.json("data/data.json", function (error, graph) {
   if (error) throw error;

   // Convert link animal names to index numbers

   graph.links.forEach(function (link, index) {

     graph.species.forEach(function (animal, animalIndex) {

       if (link.source === animal.name) {

         graph.links[index].source = animalIndex;

       }

       if (link.target === animal.name) {

         graph.links[index].target = animalIndex;

       }

     });

   })

   var defs = svg.append('svg:defs');

   // Create array for levels to see how many nodes there are in each level

   window.totalPoints = graph.species.length;
   window.currentPoints = 0;

   var levelNodes = {};

   graph.species.forEach(function (node, index) {

     defs.append("svg:pattern")
       .attr("id", node.name)
       .attr("width", 1)
       .attr("height", 1)
       .append("svg:image")
       .attr("patternUnits", "userSpaceOnUse")
       .attr("xlink:href", "images/" + node.name + ".png")
       .attr("width", 70)
       .attr("height", 70)
       .attr("x", -5)
       .attr("y", -5);

     // Add the animal to the answers section

     $("#answers").append('<div class="answer"><img ondragstart="drag(event)" draggable="true" src="images/' + node.name + '.png" id="' + node.name + '" /><button class="info" data-index="' + index + '">' + node.name + '</button></div>');

     $("#answers").on("click", ".answer button", function (e) {

       var animal = graph.species[$(e.target).attr("data-index")];

       console.log(animal.description);

     });

     // build the arrow.
     svg.append("svg:defs").selectAll("marker")
       .data([node.name])
       .enter().append("svg:marker") // This section adds in the arrows
       .attr("id", String)
       .attr("viewBox", "0 -5 10 10")
       .attr("refX", 30)
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

   graph.species.forEach(function (node, number) {

     node.y = levels[node.level - 1];

     // Calculate centre offset

     var offset = width / 2 - ((levelNodes[node.level].length * spacing) / 2);

     levelNodes[node.level].forEach(function (item, index) {

       if (item === node) {

         node.x = index * spacing + offset;

       }

     })

     node.fixed = true;

   })

   force
     .nodes(graph.species)
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

   node = node.data(graph.species)
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

       d3.event.preventDefault();

       if (current === d.name) {

         d3.select(this).style("fill", "url('#" + d.name + "')");

         $("img#" + d.name).closest(".answer").css("visibility", "hidden");
         window.currentPoints += 1;

         if (window.currentPoints === window.totalPoints) {

           $("#complete").text(answerText).show();


         }

       } else {

         $("#answers").effect("shake", "left", 1000, 100);

       }

     })

   // Add in intro text

   $("#intro").html(introText);

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
