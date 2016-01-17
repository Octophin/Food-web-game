// Show a special message relating to vultures at the end of the game

// Prepare extra patterns for full size hyaena and feral dog images

defs.append("svg:pattern")
  .attr("id", "feral-dog-big" + "img")
  .attr("width", 1)
  .attr("height", 1)
  .append("svg:image")
  .attr("patternUnits", "userSpaceOnUse")
  .attr("xlink:href", world + "/images/feral-dog.png")
  .attr("width", 90)
  .attr("height", 90)
  .attr("x", -5)
  .attr("y", -5)

defs.append("svg:pattern")
  .attr("id", "carrion-big" + "img")
  .attr("width", 1)
  .attr("height", 1)
  .append("svg:image")
  .attr("patternUnits", "userSpaceOnUse")
  .attr("xlink:href", world + "/images/carrion.png")
  .attr("width", 90)
  .attr("height", 90)
  .attr("x", -5)
  .attr("y", -5)

$("body").on("click", ".unblock", function () {

  if (window.currentPoints === window.totalPoints) {

    $("#help").text("Select the vulture to remove it from the food web.");

    $("circle#vulture").css("cursor", "move");

    $("body").on("click", "circle#vulture", function () {

      $("circle#vulture").attr("r", "10");
      $("circle#feral-dog").css("fill", "url('#" + "feral-dog-big" + "img')").attr("r", "40");
      $("circle#carrion").css("fill", "url('#" + "carrion-big" + "img')").attr("r", "40");

      $("#help").text("Feral dog and hyaena numbers will go up.");

    })

  }

})
