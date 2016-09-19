    // This is the javascript code for 'chordinateur'. A tool to show guitar chords on a fretboard
	// It uses the look and feel of the chordacus used on spytunes.com, a guitar site from Dan Lundholm. 
	// Visit <http://www.spytunes.com> in order to learn guitar
	// This code uses the D3 library for a visual representation of the chords. Visit <https://d3js.org/>. 
	// For the definition of the chords the file <chordinateur_layouts.json> is needed.
	// Contact me via GitHub https://github.com/rumburak74/chordinateur
    // Copyright (C) 2016  Christian Grafelmann

    // This program is free software: you can redistribute it and/or modify
    // it under the terms of the GNU General Public License as published by
    // the Free Software Foundation, either version 3 of the License, or
    // (at your option) any later version.

    // This program is distributed in the hope that it will be useful,
    // but WITHOUT ANY WARRANTY; without even the implied warranty of
    // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    // GNU General Public License for more details.

    // You should have received a copy of the GNU General Public License
    // along with this program.  If not, see <http://www.gnu.org/licenses/>.
	// version = v20160915
	
	
chordinate();
		
function chordinate(options) {

	var $ = jQuery;
	
	d3.json("chordinateur_layouts.json", function(error, json) {
		if (error) return console.warn(error);
		 
		//get data attributes for every chord div in html
		$('.cgc-div').each(function(i) {
			parent_div_id = $(this).attr('id');
			maxbar = parseInt($(this).attr('data-maxbar'), 10)
			root = $(this).attr('data-root');
			shape = $(this).attr('data-shape');
			detail = $(this).attr('data-detail');
			show_barnumbers = $(this).attr('data-showbars');
			show_stringnumbers = $(this).attr('data-showstrings');
			show_buttons = $(this).attr('data-showbuttons');
			
		//set default values
		maxbar = maxbar || 16;
		root = root || undefined;
		shape = shape || undefined;
		detail = detail || undefined;
		if (show_barnumbers === "false") {show_barnumbers = false } else {show_barnumbers = true };
		if (show_stringnumbers === "false") {show_stringnumbers = false } else {show_stringnumbers = true };
		if (show_buttons === "false") {show_buttons = false } else {show_buttons = true };
		
		//setting beginning values
		minbar = 0;
		width = 700;
		margin = { 	top:    0.02 * width, 
					right:  0.01 * width, 
					bottom: 0.01 * width, 
					left:   0.02 * width },
		height = width / 3.5 - margin.top - margin.bottom,
		gridSize = Math.floor(width / 25);
		xStretchfactor = 1.2;
		xGridSize = gridSize * xStretchfactor;
		left_offset_fretboard = 40;
		fingersShrinkfactor = 0.8,
		strings = ["1", "2", "3", "4", "5", "6"];
		bars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
		major = ["A", "C", "D", "E", "G"];
		minor = ["Am", "Cm", "Dm", "Em", "Gm"];
		intsort = ["R","b2","2","m3","3","4","#4","b5","5","b6","6","bb7","b7","7"];
		ini_layout = json;
		
		//defining variables
		var parent_div_id,
			shapetype,
			lowest_bar, highest_bar, 
			lowerthreshold, upperthreshold,
			selectedlayout,
			root, shape, detail,
			selected_root, selected_shape, selected_detail,
			layout, intervals, layout_json, layout_p12, layout_m12;
					
		//remove old fretboard
			$( "#"+ parent_div_id + "_svg_fret" ).empty();
		//create divs for fretboard and svg
			$("#" + parent_div_id + "").append("<div id='" + parent_div_id + "_svg_fret'></div>");			
			$("#" + parent_div_id + "").append("<div id='" + parent_div_id + "_buttons'></div>");

		var svg_fret = define_svg(parent_div_id);
			// draw_headline(svg_fret, parent_div_id);
			draw_fretboard(svg_fret, maxbar);
			setSelector(parent_div_id, root, shape, detail);
			draw_selectbuttons(svg_fret, parent_div_id);
			showDetailButtons(parent_div_id, shape);
			draw_layout(selectedlayout, svg_fret, maxbar, parent_div_id);
			
		function define_svg(parent_div_id) {
			var svg_fret = d3.select("#"+ parent_div_id + "_svg_fret")
				.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
					
				return svg_fret;
	}
		
		function setSelector(parent_div_id, root, shape, detail) {
			//get the selected root, shape and detail - otherwise replace it by defaults
			layout = [];
			if (root === undefined || root === null || root === "")
				{
				selectedlayout = "none";
				//d3.select("#message").html("Select a root please");
				//d3.select("#selector").html(selectedlayout, root, shape, detail);
				} 
			else {
				if (shape === undefined || shape === null || shape === "") {
					selectedlayout = "root";		
					}
				else if (detail === undefined || detail === null || detail === "") {
					selectedlayout = shape;
					}
				else {
					selectedlayout = shape + "|" + detail;
					}
					//d3.select("#message").html("");
					//d3.select("#selector").html(selectedlayout, root, shape, detail);
				}
		}

		function disableChordButtons( parent_div_id, shape) {
		//	enable all chordbuttons
			$( "#"+ parent_div_id + " .majshape").prop( "disabled", false );
			$( "#"+ parent_div_id + " .minshape").prop( "disabled", false );
		
		// disable specific chordbuttons per shape
		if (shape === "A") {
			$( "#"+ parent_div_id + " .chord_9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_7flat9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_69" ).prop( "disabled", true );
		}
		else if (shape === "C") {
			$( "#"+ parent_div_id + " .chord_sus2" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_delta9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_7sharp9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_7sharp5" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_13" ).prop( "disabled", true );
		}
		else if (shape === "D") {
			$( "#"+ parent_div_id + " .chord_11" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_add9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_7sharp5" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_6" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_13" ).prop( "disabled", true );
		}
		else if (shape === "E") {
			$( "#"+ parent_div_id + " .chord_sus2").prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_11" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_7sharp9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_7flat9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_69" ).prop( "disabled", true );
		}
		else if (shape === "G") {
			$( "#"+ parent_div_id + " .chord_delta9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_7sharp9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_7flat9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_7sharp5" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_13" ).prop( "disabled", true );
		}
		else if (shape === "Am") {
			$( "#"+ parent_div_id + " .chord_m9" ).prop( "disabled", true );
		}
		else if (shape === "Cm") {
			$( "#"+ parent_div_id + " .chord_dim" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_m11" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_madd9" ).prop( "disabled", true );
		}
		else if (shape === "Dm") {
			$( "#"+ parent_div_id + " .chord_madd9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_m9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_min6" ).prop( "disabled", true );
		}
		else if (shape === "Em") {
			$( "#"+ parent_div_id + " .chord_dim" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_mdelta" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_m11" ).prop( "disabled", true );
		}
		else if (shape === "Gm") {
			$( "#"+ parent_div_id + " .chord_madd9" ).prop( "disabled", true );
			$( "#"+ parent_div_id + " .chord_m9" ).prop( "disabled", true );
		}
		}
		
	function redraw(parent_div_id, maxbar) {
		//remove old fretboard
		$( "#"+ parent_div_id + "_svg_fret" ).empty();
		
		//create new svg
		var svg_fret = define_svg(parent_div_id);
		draw_fretboard(svg_fret, maxbar, parent_div_id);
		draw_layout(selectedlayout, svg_fret, maxbar);
	}
		
	function draw_layout(selectedlayout, svg_fret, maxbar){              
		//set layout to the basic layout
		layout = JSON.parse(JSON.stringify(ini_layout));                 
		//get shift of the root
		var index_selectedlayout = getById(root);
		if (index_selectedlayout.length == 0) {
				var shift = 0;
				} else {    
					var shift = index_selectedlayout[0].shift;
				};          
		                    
		//get index of the selection
		var index_selectedlayout = getById(selectedlayout);
		                    
		//                  
		function getById(id) {
			return layout.filter(
				function(layout){
								return layout.id == id}
							  );
							};
                            
		var index_selectedlayout = getById(selectedlayout);
		                    
		// check if selection is possible
		if (index_selectedlayout.length == 0) {
			                
			//d3.select("#message").html(" No such combination, sorry :o(");
			//d3.select("#selector").html(selectedlayout);
			selectedlayout = "none";
			layout = [];    
			}               
		else {              
		                    
		//dynamic chord shift	
			//get basic layout
			layout_json = index_selectedlayout[0].notes;            
			//determine the span of a shape
			shape_lowest_bar = maxbar;
			shape_highest_bar = 0;
			for (i = 0; i < layout_json.length; ++i) {
				if (layout_json[i].b < shape_lowest_bar) {
					shape_lowest_bar = layout_json[i].b;
				}           
				if (layout_json[i].b > shape_highest_bar) {
					shape_highest_bar = layout_json[i].b;
				}           	        
			}               
			
			//if only root selected,than shape has no span
			if (selectedlayout == "root") {
				span_shape = 1;
				}
			else {
				span_shape = shape_highest_bar - shape_lowest_bar + 1; 
				}	  
			var i;          
			//shift and offset the basic layout depending on root and shape
			var offset = index_selectedlayout[0].offset;               
			for (i = 0; i < layout_json.length; ++i) {
				layout_json[i].b = layout_json[i].b + shift + offset;
			}               
			//triple the basic layout 
			layout_p12 = JSON.parse(JSON.stringify(layout_json)); 
			layout_m12 = JSON.parse(JSON.stringify(layout_json));			           
			//shift one plus 12 bars and one minus 12 bars               
			for (i = 0; i < layout_p12.length; ++i) {
				layout_p12[i].b = layout_p12[i].b + 12;
			}                              
			for (i = 0; i < layout_m12.length; ++i) {
				layout_m12[i].b = layout_m12[i].b - 12;
			}                            
			//concatenate the three layouts
			layout = layout_json.concat(layout_p12);
			layout = layout.concat(layout_m12);              
			//see which layout can be shown in the actual fretboard
			//delete all negative bars 	and all bars higher than maxbar
			for (i = 0; i < layout.length; ++i) {
				if (layout[i].b < 0 || layout[i].b > maxbar) {
					layout.splice(i, 1);
					i = i - 1; //the index will be shortened
				}           
			}                             
			//determine lowest bar
			lowest_bar = maxbar;
			for (i = 0; i < layout.length; ++i) {
				if (layout[i].b < lowest_bar) {
					lowest_bar = layout[i].b;
				}           
			}               
			//span of shape = lowerthreshold
			lowerthreshold = lowest_bar + span_shape - 1;
			//determine highest bar and subtract span of shape = upperthreshold
			highest_bar = 0;
			for (i = 0; i < layout.length; ++i) {
				if (layout[i].b > highest_bar) {
					highest_bar = layout[i].b;
				}           
			}	            
			upperthreshold = highest_bar - span_shape + 1;
			//low end - if there is a note in the lowerthreshold bar it fits, otherwise delete all bars lower than lowerthreshold
			for (i = 0; i < layout.length; ++i) {
				if (layout[i].b == lowerthreshold) {
					lowerthreshold = 0;
				}           
			}	                          
			//high end - if there is a note in the upperthreshold it fits, otherwise delete all bars higher than upperthreshold
			for (i = 0; i < layout.length; ++i) {
				if (layout[i].b == upperthreshold) {
					upperthreshold = maxbar;
				}           
			}               
			//delete bars that do not fit
			for (i = 0; i < layout.length; ++i) {
				if (layout[i].b < lowerthreshold || layout[i].b > upperthreshold) {
					layout.splice(i, 1);
					i = i - 1; //the index will be shortened
				}           
			}                        
			};              			
		
		//get intervals of layout
		var intervals = [];
		var sortedintervals = [];
		for (a = 0; a < layout.length; ++a) {
				intervals[a] = layout[a].i;
			} 
		var intervals = intervals.filter( onlyUnique ); 
		
		function onlyUnique(value, index, self) { 
			return self.indexOf(value) === index;
		}
		
		//sort intervals
		for (a = 0; a < intsort.length; ++a) {
			for (b = 0; b < intervals.length; ++b) {
				if (intsort[a] == intervals[b]) {
					sortedintervals[a] = intsort[a];
				}
			}
		} 
		//print intervals to html
		var intervals = [];
		for (a = 0; a < sortedintervals.length; ++a) {
			if (typeof sortedintervals[a] !== 'undefined')
				intervals.push(sortedintervals[a]);
			} 
		d3.select("#intervals").html(intervals);
		
		// draw	the fingers (circles)
		var fingers = svg_fret.selectAll(".bar")
						.data(layout)
			                
			fingers.enter()     
					.append("circle")
					// .transition()
					// .delay(50 * i)
					.attr("class", function(d) { return "cgc " + (d.sy)})            
					.attr("cx", function(d) { return (d.b) * xGridSize + xGridSize/2 + left_offset_fretboard})				//x-Position
					.attr("cy", function(d) { return (d.s - 1) * gridSize + gridSize/2})									//y-Position
					.attr("r", (gridSize / 2) * fingersShrinkfactor)
				         
		                    
		// draw the text of the fingers
		var fingersText = svg_fret.selectAll(".fingersTxt")
			.data(layout)   
			.enter()        
			.append("text")
			// .transition()
			// .delay(150 * b)
				.attr("class", function(d) { return "cgc " + (d.sy)})
				.attr("x", function(d) { return (d.b) * xGridSize + xGridSize/2 + left_offset_fretboard})
				.attr("y", function(d) { return (d.s - 1) * gridSize + gridSize/2 + gridSize/6})
				.text(function(d) { return d.i });
		                    
				            
		//legend		    
		fingers.on("mouseover", function (d) {
					d3.select("#bar").text(d.b),
					d3.select("#string").text(d.s), 
					d3.select("#ival").text(d.i)
					        
					});     
	};                                 
				            
	function draw_fretboard(svg_fret, maxbar) {         
		if (show_stringnumbers === true) {
			//draw the string labels	
			var stringLabels = svg_fret.selectAll(".stringLabel")
					.data(strings)
					.enter()
					.append("text")
						.attr("class", "cgc label")
						.text(function (d) { return d; })
						.attr("x", left_offset_fretboard)
						.attr("y", function (d, i) { return i * gridSize; })
						.style("text-anchor", "end")
						.attr("transform", "translate(-6," + gridSize / 1.5 + ")")
						;   
			}                           
		//draw the bar labels
		//make an actual array with maxbars
		bars.length = 0;    
		for (i = 0; i < maxbar + 1; ++i) {
				bars.push(i); 
			}                               
		if (show_barnumbers === true) {
        var barLabels = svg_fret.selectAll(".barLabel")
              .data(bars)   
              .enter()      
			  .append("text")
                .attr("class", "cgc label")
				.text(function(d) { return d; })
                .attr("x", function(d, i) { return i * xGridSize + left_offset_fretboard; })
                .attr("y", 0)
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + xGridSize / 2 + ", -6)")
                ;	        
		}                                  
		// draw the "wooden" fretboard
		var wood = svg_fret.append("rect").attr("class", "cgc wood")
							.attr("x", xGridSize + left_offset_fretboard)
							.attr("y", gridSize/2)
							.attr("rx", 1)
							.attr("ry", 1)
							.attr("width", xGridSize * maxbar)
							.attr("height", gridSize * 6 - gridSize);            
		// draw the bars - beginning with the second
		var bar = svg_fret.selectAll(".bar").data(bars).enter()	
				.append("line").attr("class", "cgc bars")
					.attr("x1", function(d) { if (d > 1) {return (d * xGridSize + left_offset_fretboard) }})
					.attr("y1", function(d) { if (d > 1) {return 0 + gridSize/2 }})
					.attr("x2", function(d) { if (d > 1) {return (d * xGridSize + left_offset_fretboard) }})
					.attr("y2", function(d) { if (d > 1) {return gridSize * 5.5 }});                
		// draw the open position line
		var open_pos = svg_fret.append("line").attr("class", "cgc bars")
						.attr("x1", xGridSize + left_offset_fretboard - 5).attr("y1", 0 + gridSize/2)
						.attr("x2", xGridSize + left_offset_fretboard - 5).attr("y2", gridSize * 5.5)
						.attr("stroke-width", 2);               
		// draw the strings 
		var string1 = svg_fret.append("line").attr("class", "cgc string").attr("x1", xGridSize + left_offset_fretboard).attr("y1", gridSize * 1.5 - 1 * gridSize).attr("x2", xGridSize*(maxbar + 1) + left_offset_fretboard).attr("y2", gridSize * 1.5 - 1 * gridSize);
		var string2 = svg_fret.append("line").attr("class", "cgc string").attr("x1", xGridSize + left_offset_fretboard).attr("y1", gridSize * 1.5 + 0 * gridSize).attr("x2", xGridSize*(maxbar + 1) + left_offset_fretboard).attr("y2", gridSize * 1.5 + 0 * gridSize);
		var string3 = svg_fret.append("line").attr("class", "cgc string").attr("x1", xGridSize + left_offset_fretboard).attr("y1", gridSize * 1.5 + 1 * gridSize).attr("x2", xGridSize*(maxbar + 1) + left_offset_fretboard).attr("y2", gridSize * 1.5 + 1 * gridSize);
		var string4 = svg_fret.append("line").attr("class", "cgc string").attr("x1", xGridSize + left_offset_fretboard).attr("y1", gridSize * 1.5 + 2 * gridSize).attr("x2", xGridSize*(maxbar + 1) + left_offset_fretboard).attr("y2", gridSize * 1.5 + 2 * gridSize);
		var string5 = svg_fret.append("line").attr("class", "cgc string").attr("x1", xGridSize + left_offset_fretboard).attr("y1", gridSize * 1.5 + 3 * gridSize).attr("x2", xGridSize*(maxbar + 1) + left_offset_fretboard).attr("y2", gridSize * 1.5 + 3 * gridSize);
		var string6 = svg_fret.append("line").attr("class", "cgc string").attr("x1", xGridSize + left_offset_fretboard).attr("y1", gridSize * 1.5 + 4 * gridSize).attr("x2", xGridSize*(maxbar + 1) + left_offset_fretboard).attr("y2", gridSize * 1.5 + 4 * gridSize);
		                    
		// draw the inlay dots depending on maxbar
		var dot1 = svg_fret.append("circle").attr("class", "cgc inlaydot").attr("cx", xGridSize *  3 + xGridSize/2 + left_offset_fretboard).attr("cy", + gridSize * 3).attr("r", 3)
		var dot2 = svg_fret.append("circle").attr("class", "cgc inlaydot").attr("cx", xGridSize *  5 + xGridSize/2 + left_offset_fretboard).attr("cy", + gridSize * 3).attr("r", 3)
		var dot3 = svg_fret.append("circle").attr("class", "cgc inlaydot").attr("cx", xGridSize *  7 + xGridSize/2 + left_offset_fretboard).attr("cy", + gridSize * 3).attr("r", 3)
		var dot4 = svg_fret.append("circle").attr("class", "cgc inlaydot").attr("cx", xGridSize *  9 + xGridSize/2 + left_offset_fretboard).attr("cy", + gridSize * 3).attr("r", 3)
		var dot5 = svg_fret.append("circle").attr("class", "cgc inlaydot").attr("cx", xGridSize * 12 + xGridSize/2 + left_offset_fretboard).attr("cy", + gridSize * 2).attr("r", 3)
		var dot6 = svg_fret.append("circle").attr("class", "cgc inlaydot").attr("cx", xGridSize * 12 + xGridSize/2 + left_offset_fretboard).attr("cy", + gridSize * 4).attr("r", 3)
		if (maxbar >=15 ){  
			var dot7 = svg_fret.append("circle").attr("class", "cgc inlaydot").attr("cx", xGridSize * 15 + xGridSize/2 + left_offset_fretboard).attr("cy", + gridSize * 3).attr("r", 3)
		}                   
		if (maxbar >=17 ){  
			var dot8 = svg_fret.append("circle").attr("class", "cgc inlaydot").attr("cx", xGridSize * 17 + xGridSize/2 + left_offset_fretboard).attr("cy", + gridSize * 3).attr("r", 3)	
		}                   
                            
		//draw copyright    
		var copyright = svg_fret.append("text").attr("class", "cgc copyrightlabel").attr("x", xGridSize * (maxbar + 1) + left_offset_fretboard).attr("y", gridSize * 6).text("chordinateur \u00A9 2016 Lundholm/Grafelmann");
		                    
	}                       
		                    
	function draw_selectbuttons(svg_fret, parent_div_id) {	
			if (show_buttons === true) {
				var buttons_html = [
'<table id="changeme" class="cgc table-legend">	',
// '			<tr>',
// '				<td class="cgc rowname">name</td>',
// '				<td class="cgc" id="name"></td>',
'			<tr>',
'				<td class="cgc rowname">root</td>',
'				<td class="cgc" id="root">	',
'				<div class="cgc btn-group">',
'					<button type="button" class="cgc btn root-sel root_A" 	id="root_A"     >A</button>',
'					<button type="button" class="cgc btn root-sel root_Bb_Asharp" id="root_Bb_Asharp" >B<sup>b</sup>/A<sup>#</sup></button>',
'					<button type="button" class="cgc btn root-sel root_B" 	id="root_B"     >B</button>',
'					<button type="button" class="cgc btn root-sel root_C" 	id="root_C"     >C</button>',
'					<button type="button" class="cgc btn root-sel root_Db_Csharp" id="root_Db_Csharp" >D<sup>b</sup>/C<sup>#</sup></button>',
'					<button type="button" class="cgc btn root-sel root_D" 	id="root_D"     >D</button>',
'					<button type="button" class="cgc btn root-sel root_Eb_Dsharp" id="root_Eb_Dsharp" >E<sup>b</sup>/D<sup>#</sup></button>',
'					<button type="button" class="cgc btn root-sel root_E" 	id="root_E"     >E</button>',
'					<button type="button" class="cgc btn root-sel root_F" 	id="root_F"     >F</button>',
'					<button type="button" class="cgc btn root-sel root_Gb_Fsharp" id="root_Gb_Fsharp" >G<sup>b</sup>/F<sup>#</sup></button>',
'					<button type="button" class="cgc btn root-sel root_G" 	id="root_G"     >G</button>',
'					<button type="button" class="cgc btn root-sel root_Ab_Gsharp" id="root_Ab_Gsharp" >A<sup>b</sup>/G<sup>#</sup></button>',
'				</div>',
'				</td>',
'			</tr>	',
'			<tr>',
'				<td class="cgc rowname">shape</td>',
'				<td class="cgc" id="shape">',
'					<div class="cgc btn-group">',
'						<button type="button" class="cgc btn maj shape-sel A" id="A" >A</button>',
'						<button type="button" class="cgc btn maj shape-sel C" id="C" >C</button>',
'						<button type="button" class="cgc btn maj shape-sel D" id="D" >D</button>',
'						<button type="button" class="cgc btn maj shape-sel E" id="E" >E</button>',
'						<button type="button" class="cgc btn maj shape-sel G" id="G" >G</button>',
'					</div>',
'					<div class="cgc btn-group">',
'						<button type="button" class="cgc btn min shape-sel Am" id="Am" >Am</button>',
'						<button type="button" class="cgc btn min shape-sel Cm" id="Cm" >Cm</button>',
'						<button type="button" class="cgc btn min shape-sel Dm" id="Dm" >Dm</button>',
'						<button type="button" class="cgc btn min shape-sel Em" id="Em" >Em</button>',
'						<button type="button" class="cgc btn min shape-sel Gm" id="Gm" >Gm</button>',
'					</div>',
'				</td>',
'			</tr>	',
'			<tr>',
'				<td class="cgc rowname">scale</td>',
'				<td class="cgc" id="scale">',
'					<div class="cgc btn-group majshape" style="display: none;">',
'						<button class="cgc btn majshape detail-sel MajPent" type="button"    id="MajPent" >Major Pentatonic</button>',
'						<button class="cgc btn majshape detail-sel Ionian" type="button"     id="Ionian"  >Ionian</button>',
'						<button class="cgc btn majshape detail-sel Lydian" type="button"     id="Lydian"  >Lydian</button>',
'						<button class="cgc btn majshape detail-sel Mixoly" type="button"     id="Mixoly"  >Mixolydian</button>',
'				</div>	',
'					<div class="cgc btn-group minshape" style="display: none;">',
'						<button class="cgc btn minshape detail-sel MinPent" type="button"    id="MinPent"    >Minor Pentatonic</button>',
'						<button class="cgc btn minshape detail-sel Aeolian" type="button"    id="Aeolian"    >Aeolian</button>',
'						<button class="cgc btn minshape detail-sel Dorian" type="button"     id="Dorian"     >Dorian</button>',
'						<button class="cgc btn minshape detail-sel Phrygian" type="button"   id="Phrygian"   >Phrygian</button>',
'						<button class="cgc btn minshape detail-sel PhrygDom" type="button"   id="PhrygDom"   >Phrygian Dom</button>',
'						<button class="cgc btn minshape detail-sel Blues" type="button"      id="Blues"      >Blues</button>',
'						<button class="cgc btn minshape detail-sel Conspirian" type="button" id="Conspirian" >Conspirian</button>',
'					</div>',
'				</td>',
'			</tr>	',
'			<tr>',
'				<td class="cgc rowname">chord</td>',
'				<td class="cgc" id="chord">',
'				<div class="cgc btn-group majshape" style="display: none;">',
'					<button type="button" class="cgc btn majshape detail-sel chord_delta"   id="chord_delta"  >&#x394</button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_7"       id="chord_7"      >7</button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_sus4"    id="chord_sus4"   >sus<sup>4</sup></button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_7sus4"   id="chord_7sus4"  ><sup>7</sup>sus<sup>4</sup></button>',
'				</div>',
'				<div class="cgc btn-group majshape" style="display: none;">',
'					<button type="button" class="cgc btn majshape detail-sel chord_sus2"    id="chord_sus2"   >sus<sup>2</sup></button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_11"      id="chord_11"     >11</button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_add9"    id="chord_add9"   >add<sup>9</sup></button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_delta9"  id="chord_delta9" >&#x394 9</button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_9"       id="chord_9"      >9</button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_7sharp9" id="chord_7sharp9">7#9</button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_7flat9"  id="chord_7flat9" >7b9</button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_7sharp5" id="chord_7sharp5">7#5</button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_6"       id="chord_6"      >6</button>		',
'					<button type="button" class="cgc btn majshape detail-sel chord_69"      id="chord_69"     >6/9</button>',
'					<button type="button" class="cgc btn majshape detail-sel chord_13"      id="chord_13"     >13</button>',
'				</div>',
'				<div class="cgc btn-group minshape" style="display: none;">',
'					<button type="button" class="cgc btn minshape detail-sel chord_m7"      id="chord_m7"     ><sub>m</sub>7</button>',
'					<button type="button" class="cgc btn minshape detail-sel chord_m7flat5" id="chord_m7flat5"><sub>m</sub>7b5</button>',
'				</div>	',
'				<div class="cgc btn-group minshape" style="display: none;">	',
'					<button type="button" class="cgc btn minshape detail-sel chord_dim"     id="chord_dim"    >dim</button>',
'					<button type="button" class="cgc btn minshape detail-sel chord_mdelta"  id="chord_mdelta" ><sub>m</sub>&#x394</button>',
'					<button type="button" class="cgc btn minshape detail-sel chord_m11"     id="chord_m11"    ><sub>m</sub>11</button>',
'					<button type="button" class="cgc btn minshape detail-sel chord_madd9"   id="chord_madd9"  ><sub>m</sub>add9</button>',
'					<button type="button" class="cgc btn minshape detail-sel chord_m9"      id="chord_m9"     ><sub>m</sub>9</button>',
'					<button type="button" class="cgc btn minshape detail-sel chord_min6"    id="chord_min6"   ><sub>min</sub>6</button>',
'				</div>',
'				</td>	',
'			</tr>',
'			<tr>',
'				<td class="cgc rowname">arpeggio</td>',
'				<td class="cgc" id="arpeggio">',
'				<div class="cgc btn-group majshape" style="display: none;">',
'					<button type="button" class="cgc btn majshape detail-sel arp_delta"   id="arp_delta"  >&#x394</button>',
'					<button type="button" class="cgc btn majshape detail-sel arp_7"       id="arp_7"      >7</button>',
'				</div>',
'				<div class="cgc btn-group minshape" style="display: none;">',
'					<button type="button" class="cgc btn minshape detail-sel arp_m7"      id="arp_m7"     ><sub>m</sub>7</button>',
'					<button type="button" class="cgc btn minshape detail-sel arp_m7flat5" id="arp_m7flat5"><sub>m</sub>7b5</button>',
'				</div>',
'				</td>	',
'			</tr>',
'			<tr>',
'				<td class="cgc rowname">intervals</td>',
'				<td class="cgc" id="intervals"></td>',
'			</tr>	',
// '			<tr>',
// '				<td class="cgc rowname">bar</td>',
// '				<td class="cgc" id="bar"></td>',
// '			</tr>	',
// '			<tr>',
// '				<td class="cgc rowname">string</td>',
// '				<td class="cgc" id="string"></td>',
// '			</tr>	',
// '			<tr>',
// '				<td class="cgc rowname">ival</td>',
// '				<td class="cgc" id="ival"></td>',
// '			</tr>	',
'		</table>'
].join('');

			//insert html for buttons
			$( "#"+ parent_div_id + "_buttons" ).html(buttons_html);                
			$("#changeme").attr("id",""+parent_div_id+"");			                
			}               	                
		}                   
 
	function showDetailButtons(parent_div_id, shape){
		shapetype = getShapetype(shape);
		//show buttons depending on shapetype, div parent_div_id
			if (shapetype == "major"){
					$("#"+parent_div_id+" .majshape").show()
					$("#"+parent_div_id+" .minshape").hide()
				}           
			else if (shapetype == "minor"){
				$("#"+parent_div_id+" .majshape").hide()
				$("#"+parent_div_id+" .minshape").show()
				}           
			else if (shapetype == "" || shapetype === undefined || shapetype === null){
				$("#"+parent_div_id+" .majshape").hide()
				$("#"+parent_div_id+" .minshape").hide()
			}       
		//set buttons to selected if defaulted
		if (root != undefined) {
			$("#"+parent_div_id+"_buttons ."+root+"").addClass('selected');
			//selected_root = $(this); DELETEME
			}           
		if (shape != undefined) {
			$("#"+parent_div_id+"_buttons ."+shape+"").addClass('selected');
			//selected_shape = $(this); DELETEME
			}	
		if (detail != undefined) {
			$("#"+parent_div_id+"_buttons ."+detail+"").addClass('selected');
			//selected_shape = $(this); DELETEME
			}
		disableChordButtons(parent_div_id, shape);
	}       

	function getShapetype(shape){
		//show buttons depending on shapetype, div parent_div_id
			if (shape == "A" || shape == "C" || shape == "D" || shape == "E" || shape == "G"){
				shapetype = "major";
				}           
			else if (shape == "Am" || shape == "Cm" || shape == "Dm" || shape == "Em" || shape == "Gm"){
				shapetype = "minor";
				}           
			else if (shape == "" || shape === undefined || shape === null){
				shapetype = null;
			}       
			return shapetype;
	} 	
	                        
	//Click on root-buttons		.root-sel
		$('.root-sel').off().on('click', function() {
			//get actual div, maxbar and if applicable the shape and the detail
			parent_div_id = $(this).closest("table").attr("id");
			maxbar = parseInt($(this).closest("div.cgc-div").attr("data-maxbar"));
			shape = $(this).closest("div.cgc-div").attr("data-shape");
			detail = $(this).closest("div.cgc-div").attr("data-detail");
			//is actual object already selected --> then deselect, if not then select it and deselect all other
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				root = null;  
				}  else {        
				$("#"+parent_div_id+" .root-sel").removeClass('selected');
				$(this).addClass('selected');
				root = this.id;
			}    
			
			//set the actual root --> write it to div attribute
			$(this).closest("div.cgc-div").attr("data-root", root);
			setSelector(parent_div_id, root, shape, detail);
			redraw(parent_div_id, maxbar);       
		});                 
		                    
	//Click on shape-buttons		 
		$('.shape-sel').off().on('click', function() {
			
			//get actual div, maxbar and if applicable the shape and the detail
			parent_div_id = $(this).closest("table").attr("id");
			maxbar = parseInt($(this).closest("div.cgc-div").attr("data-maxbar"));
			root = $(this).closest("div.cgc-div").attr("data-root");
			shape = $(this).closest("div.cgc-div").attr("data-shape");
			detail = $(this).closest("div.cgc-div").attr("data-detail");
			oldShapetype = getShapetype(shape);
			
			//is actual object already selected --> then deselect, if not then select it and deselect all other
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				shape = null;  
				}  else {        
				$("#"+parent_div_id+" .shape-sel").removeClass('selected');
				$(this).addClass('selected');
				shape = this.id;
			}    
			
			//set the actual shape --> write it to div attribute
			$(this).closest("div.cgc-div").attr("data-shape", shape);
			shapetype = getShapetype(shape);
			//change from maj to min and vice versa --> delete detail 
			if (shapetype != oldShapetype) {
			//empty detail, delete and unselect
			detail = null;
			$(this).closest("div.cgc-div").attr("data-detail", detail);
			$("#"+parent_div_id+" .detail-sel").removeClass('selected');
			}
			setSelector(parent_div_id, root, shape, detail);
			disableChordButtons(parent_div_id, shape);
			redraw(parent_div_id, maxbar);       
			showDetailButtons(parent_div_id, shape);
		});                 
		                    
	//Click on detail-buttons	.detail-sel
		$('.detail-sel').off().on('click', function() {
			//get actual div, maxbar and if applicable the shape and the detail
			parent_div_id = $(this).closest("table").attr("id");
			maxbar = parseInt($(this).closest("div.cgc-div").attr("data-maxbar"));
			root = $(this).closest("div.cgc-div").attr("data-root");
			shape = $(this).closest("div.cgc-div").attr("data-shape");
			detail = $(this).closest("div.cgc-div").attr("data-detail"); 
			
			//is actual object already selected --> then deselect, if not then select it and deselect all other
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				detail = null;  
				}  else {        
				$("#"+parent_div_id+" .detail-sel").removeClass('selected');
				$(this).addClass('selected');
				detail = this.id;
			}    
			//set the actual detail --> write it to div attribute
			$(this).closest("div.cgc-div").attr("data-detail", detail); 
			//selected_detail = $(this);                
			setSelector(parent_div_id, root, shape, detail);
			redraw(parent_div_id, maxbar)       
		});                 
		                    
		})   //end each     
		}); //endif         
	}                       
		                    