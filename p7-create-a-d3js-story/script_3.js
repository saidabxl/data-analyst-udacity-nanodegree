////////////////////////////////////////////////////////////
//////////////////////// Set-Up ////////////////////////////
////////////////////////////////////////////////////////////

var margin = {left:20, top:20, right:20, bottom:20},
	width = Math.min(window.innerWidth, 700) - margin.left - margin.right,
    height = Math.min(window.innerWidth, 700) - margin.top - margin.bottom,
    innerRadius = Math.min(width, height) * .39,
    outerRadius = innerRadius * 1.1;

var Names = ["Co 1","Co 2","Co 3","Co 4","Co 5", "Co 6",
						"Part 1", "Part 2", "Part 3" ,"Part 4","Part 5", "Part 6",
						"Prod 1","Prod 2","Prod 3",
						"S 1", "S 2", "S 3" ,"S 4"],
    colors = ["#F00000", "#C00000", "#A00000", "#800000", "#600000",  "#400000",
							"#00F000", "#00C000", "#00A000", "#008000", "#006000",  "#004000",
							"#FFA000", "#FF7F00", "#FF3300",
							"#0000F0", "#0000B0", "#000070", "#000050"],
    opacityDefault = 0.8;

var superCategories = [["Companies",0,5,"#FFcccc"],
	                   ["Partners",6,11,"#A0E2A0"],
								 		 ["Products",12,14,"#FFD5B4"],
								 		 ["Services",15,18,"#d1fcfa"]]

var matrix = [
  [0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0, 1,0,0,1],
  [0,0,0,0,0,0, 0,0,0,0,0,0, 1,1,1, 1,0,0,1],
  [0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0, 1,1,1,1],
  [0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0, 0,0,1,1],
  [0,0,0,0,0,0, 0,0,0,0,0,0, 1,0,1, 0,0,1,1],
  [0,0,0,0,0,0, 0,0,0,0,0,0, 0,1,0, 0,0,1,1],

	[0,0,0,0,0,0, 0,0,0,0,0,0, 1,1,1, 0,0,1,1],
	[0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0, 0,0,1,1],
	[0,0,0,0,0,0, 0,0,0,0,0,0, 0,1,0, 0,0,1,1],
	[0,0,0,0,0,0, 0,0,0,0,0,0, 1,1,1, 0,0,1,1],
	[0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0, 1,1,1,1],
	[0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0, 1,0,0,1],

	[0,1,0,0,1,0, 1,0,0,1,0,0, 0,0,0, 0,0,0,0],
  [0,1,0,0,0,1, 1,0,1,1,0,0, 0,0,0, 0,0,0,0],
  [0,1,0,0,1,0, 1,0,0,1,0,0, 0,0,0, 0,0,0,0],

	[1,1,1,0,0,0, 0,0,0,0,1,1, 0,0,0, 0,0,0,0],
	[0,0,1,0,0,0, 0,0,0,0,1,0, 0,0,0, 0,0,0,0],
	[0,0,1,1,1,1, 1,1,1,1,1,0, 0,0,0, 0,0,0,0],
	[1,1,1,1,1,1, 1,1,1,1,1,1, 0,0,0, 0,0,0,0]
];
////////////////////////////////////////////////////////////
/////////// Create scale and layout functions //////////////
////////////////////////////////////////////////////////////

var colors = d3.scaleOrdinal()
    .domain(d3.range(Names.length))
	.range(colors);

//A "custom" d3 chord function that automatically sorts the order of the chords in such a manner to reduce overlap
var chord = d3.chord()
  .padAngle(.015);

var arc = d3.arc()
    .innerRadius(innerRadius*1.01)
    .outerRadius(outerRadius);

var superArc = d3.arc()
    .innerRadius(innerRadius*1.15)
    .outerRadius(outerRadius*1.16);


var path = d3.ribbon()
	.radius(innerRadius);

////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
		.datum(chord(matrix));

////////////////////////////////////////////////////////////
////////////////// Draw outer Arcs /////////////////////////
////////////////////////////////////////////////////////////

var outerArcs = svg.selectAll("g.group")
	.data(function(chords) { return chords.groups; })
	.enter().append("g")
	.attr("class", "group")
	.on("mouseover", fade(.1))
	.on("mouseout", fade(opacityDefault));

outerArcs.append("path")
	.style("fill", function(d) { return colors(d.index); })
	.attr("d", arc)
	.each(function(d,i) {
		//Search pattern for everything between the start and the first capital L
		var firstArcSection = /(^.+?)L/;

		//Grab everything up to the first Line statement
		var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
		//Replace all the comma's so that IE can handle it
		newArc = newArc.replace(/,/g , " ");


		//Create a new invisible arc that the text can flow along
		svg.append("path")
			.attr("class", "hiddenArcs")
			.attr("id", "arc"+i)
			.attr("d", newArc)
			.style("fill", "none");
	});

////////////////////////////////////////////////////////////
////////////////// Super Arcs /////////////////////////
////////////////////////////////////////////////////////////

superNames = []
superCategories.forEach(function(d){
  superNames.push(d[0])
})

superGroups = []
superCategories.forEach(function(d){
	superGroups.push({index: 0,
										startAngle: chord(matrix).groups[d[1]].startAngle,
										endAngle: chord(matrix).groups[d[2]].endAngle,
										value: 160, // magic number: because we had 17 arcs?
										color: d[3],
										firstGroup: d[1],
										lastGroup: d[2]} )
})


var sArcs = svg.selectAll("super.group")
	.data(superGroups)
	.enter().append("g")
	.attr("class", "group")
	.on("mouseover", mouseoverSuper)
  .on("mouseout", mouseoutSuper);

  sArcs.append("path")
	.style("fill", function (d) {return d.color})
	.attr("d", superArc)
	.each(function(d,i) {
		//Search pattern for everything between the start and the first capital L
		var firstArcSection = /(^.+?)L/;

		//Grab everything up to the first Line statement
		var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
		//Replace all the comma's so that IE can handle it
		newArc = newArc.replace(/,/g , " ");


		//Create a new invisible arc that the text can flow along
		svg.append("path")
			.attr("class", "hiddenArcs")
			.attr("id", "super-arc"+i)
			.attr("d", newArc)
			.style("fill", "none");
	});

//Append the label names on the outside
sArcs.append("text")
	.attr("class", "titles")
	.attr("dy", 24)
  .append("textPath")
	.attr("startOffset","50%")
  .style("fill", "black")
	.style("text-anchor","middle")
	.attr("xlink:href",function(d,i){return "#super-arc"+i;})
	.text(function(d,i){ return superNames[i]; });


////////////////////////////////////////////////////////////
////////////////// Append Names ////////////////////////////
////////////////////////////////////////////////////////////

//Append the label names on the outside
outerArcs.append("text")
	.attr("class", "titles")
	.attr("dy", 18)
	.append("textPath")
	.attr("startOffset","50%")
	.style("fill", "white")
	.style("text-anchor","middle")
	.attr("xlink:href",function(d,i){return "#arc"+i;})
	.text(function(d,i){ return Names[i]; });

////////////////////////////////////////////////////////////
////////////////// Draw inner chords ///////////////////////
////////////////////////////////////////////////////////////

svg.selectAll("path.chord")
	.data(function(chords) { return chords; })
	.enter().append("path")
	.attr("class", "chord")
	.style("fill", function(d) { return colors(d.source.index); })
	.style("opacity", opacityDefault)
	.attr("d", path)
	//.on("mouseover", mouseoverChord)
	//.on("mouseout", mouseoutChord);

////////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
////////////////////////////////////////////////////////////

//Returns an event handler for fading a given chord group.
function fade(opacity) {
  return function(d,i) {
    svg.selectAll("path.chord")
        .filter(function(d) { return d.source.index !== i && d.target.index !== i; })
		.transition()
        .style("opacity", opacity);
  };
}//fade

//Highlight hovered over chord
function mouseoverChord(d,i) {

	//Decrease opacity to all
	svg.selectAll("path.chord")
		.transition()
		.style("opacity", 0.1);
	//Show hovered over chord with full opacity
	d3.select(this)
		.transition()
        .style("opacity", 1);

	//Define and show the tooltip over the mouse location
	$(this).popover({
		placement: 'auto top',
		title: function() {
			return Names[d.source.index]},
		container: 'body',
		mouseOffset: 10,
		followMouse: true,
		trigger: 'hover',
		html : true,
		content: function() {
			return "<p style='font-size: 11px; text-align: center;'><span style='font-weight:900'>" + Names[d.source.index] +
				   "</span> hier <span style='font-weight:900'>" + Names[d.target.index] +
				   "</span> folgt ein Text zur Zielgruppe <span style='font-weight:900'>" + d.source.value + "</span>  </p>"; }
	});
	$(this).popover('show');
}//mouseoverChord

//Bring all chords back to default opacity
function mouseoutChord(d) {
	//Hide the tooltip
	$('.popover').each(function() {
		$(this).remove();
	});
	//Set opacity back to default for all
	svg.selectAll("path.chord")
		.transition()
		.style("opacity", opacityDefault);
}//function mouseoutChord

//Highlight hovered over chord
function mouseoverChord(d,i) {

	//Decrease opacity to all
	svg.selectAll("path.chord")
		.transition()
		.style("opacity", 0.1);
	//Show hovered over chord with full opacity
	d3.select(this)
		.transition()
				.style("opacity", 1);

	//Define and show the tooltip over the mouse location
	$(this).popover({
		//placement: 'auto top',
		title: 'test',
		placement: 'right',
		container: 'body',
		animation: false,
		offset: "20px -100px",
		followMouse: true,
		trigger: 'click',
		html : true,
		content: function() {
			return "<p style='font-size: 11px; text-align: center;'><span style='font-weight:900'>"  +
					 "</span> text <span style='font-weight:900'>"  +
					 "</span> folgt hier <span style='font-weight:900'>" + "</span> erklären </p>"; }
	});
	$(this).popover('show');
}
//Bring all chords back to default opacity
function mouseoutChord(d) {
	//Hide the tooltip
	$('.popover').each(function() {
		$(this).remove();
	})
	//Set opacity back to default for all
	svg.selectAll("path.chord")
		.transition()
		.style("opacity", opacityDefault);
	}      //function mouseoutChord


// Super hover
//Highlight hovered over chord
function mouseoverSuper(d,i) {

	//Decrease opacity to all
	svg.selectAll("path.chord")
		.transition()
		.style("opacity", 0.1);


	firstGroup = d.firstGroup
	lastGroup = d.lastGroup
	svg.selectAll("path.chord")
			.filter(function(d) { return (((d.source.index >= firstGroup) &&
																		 (d.source.index <= lastGroup)) ||
																		((d.target.index >= firstGroup) &&
																		 (d.target.index <= lastGroup))
																	 )})
			.transition()
			.style("opacity", 1);
}

function mouseoutSuper(d) {

	//Set opacity back to default for all
	svg.selectAll("path.chord")
		.transition()
		.style("opacity", opacityDefault);
	}      //function mouseoutChord
