// Get the world name from the query string

var world = document.location.href.split("world=")[1];

if (!world) {

  $("body").html("No world selected");

  throw Error;

}

var width = 600,
  height = 640,
  levelHeight = 130,
  topOffset = 70,
  spacing = 70;

var levels = [];

var levelCounter = 0;

while (levelCounter < 5) {

  levels.push(levelCounter * levelHeight + topOffset)

  levelCounter += 1;

}

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

d3.json(world + "/settings.json", function (error, graph) {

  // Set background

  window.graph = graph;

  $('html').css({
    'background-image': 'url(' + world + '/background.jpg)',
  });

  if (error) {

    $("body").html("That world doesn't exist");

  }

  var settings = graph.settings;

  var answerText = settings.completeText;
  var introText = settings.introText;
  var levelNames = settings.levelNames;

  // Add in level background div

  levels.forEach(function (element, index) {

    var offset = levelHeight * index;

    $("<div class='level' style='top:" + offset + "px; height:" + levelHeight + "px'><h2 class='level-name'>" + levelNames[index] + "</h2></div>").appendTo("body");

  });

  $("#help").html(settings.helpTextList);

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

  graph.links.forEach(function (link) {

    if (typeof link.target !== "number" || typeof link.source !== "number") {
      
      console.error("bad link", link);

    }

  })

  // Create array for levels to see how many nodes there are in each level

  window.totalPoints = graph.species.length;
  window.currentPoints = 0;

  var levelNodes = {};


  graph.species.forEach(function (node, index) {

    var defs = svg.append('svg:defs');

    defs.append("svg:pattern")
      .attr("id", node.name + "img")
      .attr("width", 1)
      .attr("height", 1)
      .append("svg:image")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("xlink:href", world + "/images/" + node.name + ".png")
      .attr("width", 70)
      .attr("height", 70)
      .attr("x", -5)
      .attr("y", -5)


    defs.selectAll("marker")
      .data([node.name])
      .enter().append("svg:marker") // This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 45)
      .style("fill", function (d) {

        return node.colour;

      })
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")

    // Add the animal to the answers section

    $("#answers").append('<div class="answer" data-index="' + index + '"><img draggable="false" data-index="' + index + '" src="' + world + '/images/' + node.name + '.png" id="' + node.name + '" /><button class="info" data-index="' + index + '">' + node.name.replace("-", " ") + '</button></div>');

    $("#answers").on("click", ".answer", function (e) {

      var animal = graph.species[$(e.target).attr("data-index")];

      current = animal.name;

      $("#answers").hide();

      $("#message").show().find(".inner").text(animal.description);
      $("#help").html(settings.helpTextSelected);

      $("#info-title").text(animal.name.toUpperCase());
      $("#info-image").attr("src", world + "/images/" + animal.name + ".png");
      $("#info-image-drag").attr("src", world + "/images/" + animal.name + ".png");


    });

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

      return "url(#" + d.target.name + ")";

    })

  node = node.data(graph.species)
    .enter().append("circle")
    .attr("id", function (d) {

      return d.name;

    })
    .attr("r", 25)
    .style("fill", function (d) {

      // Check if species should already be on food web

      if (d.done) {

        $("img#" + d.name).attr("draggable", "false").closest(".answer").addClass("done");

        return "url('#" + d.name + "img')";

      } else {
        return d.colour;
      }

    })
    .style("stroke", function (d) {

      if (d.highlight) {

        return d.highlight;

      } else if (d.done) {

        return d.colour;

      } else {

        return "black";

      }

    })
    .style('stroke-width', function (d) {

      if (d.highlight) {

        return 6;

      } else {

        return 3;

      }

    })
    .attr("ondragover", "event.preventDefault()")
    .on("drop", function (d) {

      d3.event.preventDefault();

      if (current === d.name) {

        d3.select(this).style("fill", "url('#" + d.name + "img')");


        d3.select(this).style("stroke", d.highlight || d.colour);

        $("img#" + d.name).attr("draggable", "false").closest(".answer").addClass("done");

        $("#message").hide();
        $("#answers").show();
        $("#help").html(settings.helpTextList);

        if (window.currentPoints === window.totalPoints) {

          // Stop timer

          window.clearInterval(window.timer);

          // Show complete message

          $.blockUI({
            message: '<p>' + answerText + '</p><p>You did it in ' + window.timerCounter + ' seconds.</p>'
          });

        }

      } else {

        $("#info-image").effect("shake", "left", 1000, 100);

      }

    })

  // Intro message

  $.blockUI({
    message: '<h1>Welcome</h1><p>' + introText + '</p><button class="unblock">Start</button>'
  });

  // Unblock buttons

  $("body").on("click", ".unblock", function () {

    // Start timer!

    window.timerCounter = 0;

    window.timer = window.setInterval(function () {

      window.timerCounter += 1;

    }, 1000);

    $.unblockUI();

  });

  $("#close-info").click(function () {

    $("#help").html(settings.helpTextList);
    $("#message").hide();
    $("#answers").show();

  })

});

function tick() {
  link.attr("x1", function (d) {
      return d.target.x;
    })
    .attr("y1", function (d) {
      return d.target.y;
    })
    .attr("x2", function (d) {
      return d.source.x;
    })
    .attr("y2", function (d) {
      return d.source.y;
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



}
