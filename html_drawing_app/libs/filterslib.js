//library for picture import, filters
//use this library to set ALL new variables that only these functions will use. 

//http://www.storminthecastle.com/2013/04/06/how-you-can-do-cool-image-effects-using-html5-canvas/
//reference to modular pattern: http://weblogs.asp.net/dwahlin/techniques-strategies-and-patterns-for-structuring-javascript-code-revealing-module-pattern

var img = new Image();

//prompt user to select pic from disk
var openFile = (function(){
return function(c){
	var fileInput = document.querySelector("#fileInput");

	function onFileChange(e){
	var files = e.target.files;
	if(files && files.length>0) //if a file has been selected
	   c(files)//do some function (defined by c) to that file
	}
	//bind the onFileChange function to fileInput. this triggers the next phase - getting the data from the picture file. 
	fileInput.addEventListener("change", onFileChange, false);
	fileInput.click(); 
}
})();

//remember that this function will be passed an array containing the selected file(s)
function handleFile(files){
var file = files[0];
var imageType = /image.*/;
if(!file.type.match(imageType)){
	return;
}

var reader = new FileReader();

//if reader is not working
reader.onerror = function(e){
alert('Error code ' + e.target.error);
}

//Create a closure (notice modular pattern here) to capture file information
//after the selected file is read, its contents are available and this function is executed
reader.onload = (function(file){  
	return function(evt){
		//attach the name of the file onto the webpage
		//document.getElementById('fileName').innerHTML = file.name;
		//set the img src to the file
		img.src = evt.target.result;
	}
})(file); //make sure file is passed to this function

//read in the file as a data url (why over here though?)
reader.readAsDataURL(file);

//send the pic to the canvas
//note that the image has to load first! so do img.onload...
img.onload = function(){
context.drawImage(img, 0, 0, 700, 700); //figure out how to get canvas.height here to work..?

//log pixels of picture (this is for my drawing/animating app)
pixelData();

//ah! reset the value for the HTML input file thing so that you can use the same pic for consecutive frames!  
document.querySelector("#fileInput").value = null;
//reset contrast value every time a new pic is imported
contrastVal = 0;
}
}

//BEGIN FILTERS
//general filtering function. pass any kind of filter through this function.
//bind to onclick in html! 
function filterCanvas(filter){
var imgData = context.getImageData(0, 0, 700, 700);
filter(imgData);
context.putImageData(imgData, 0, 0);
}

//grayscale filter using an arithmetic average of the color components
//the 'pixels' parameter will be the imgData variable. 
function grayscale(pixels){
var d = pixels.data;
for (var i = 0; i < d.length; i += 4) {
      var r = d[i];
      var g = d[i + 1];
      var b = d[i + 2];
	  //the value obtained by (r+g+b)/3 will be the value assigned to d[i], d[i+1], and d[i+2].  
      d[i] = d[i + 1] = d[i + 2] = (r+g+b)/3;
    }
    return pixels;
};

//sepia filter
function sepia(pixels){
var d = pixels.data;
for (var i = 0;i < d.length; i += 4){
	var r = d[i];
	var g = d[i+1];
	var b = d[i+2];
	d[i] = (r*.5) + (g*.2) + (b*.3); //red
	d[i+1] = (r*.2) + (g*.3) + (b*.5); //green
	d[i+2] = (r*.6) + (g*.3) + (b*.4); //blue	
}
	return pixels;
};

//source: http://www.qoncious.com/questions/changing-saturation-image-html5-canvas-using-javascript
//saturation filter yay
function saturate(pixels){
	var saturationValue = 2.5;
	var d = pixels.data;
	var lumR = .3086 //constant for determining luminance of red
	var lumG = .6094 //constant for determining luminance of green
	var lumB = .0820 //constant for determining luminance of blue
	
	//one of these equations per r,g,b
	var r1 = (1 - saturationValue) * lumR + saturationValue;
	var g1 = (1 - saturationValue) * lumG + saturationValue;
    var b1 = (1 - saturationValue) * lumB + saturationValue;	
	
	//then one of these for each
	var r2 = (1 - saturationValue) * lumR;
	var g2 = (1 - saturationValue) * lumG;
    var b2 = (1 - saturationValue) * lumB;	
	
	for(var i = 0; i < d.length; i+=4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		
		d[i] = r*r1 + g*g2 + b*b2;
		d[i+1] = r*r2 + g*g1 + b*b2;
	    d[i+2] = r*r2 + g*g2 + b*b1;
	}
	return pixels;
}

/*
* this function swaps colors
*/
function swap(pixels){
	var d = pixels.data;
	for(var i=0;i<d.length;i+=4){
		var r = d[i];
		var g = d[i+1];
	    var b = d[i+2];
	
	d[i] = b;
	d[i+1] = r;
	d[i+2] = g
	}
	return pixels;
}

/*
* this function creates bands
*/
function banded(pixels){
	var d = pixels.data;
	for(var i=0; i<d.length;i+=12){
		var r = d[i];
		var g = d[i+1];
	    var b = d[i+2];
		
	d[i] = "#FFFFFF";
	d[i+1] = "#FFFFFF";
	d[i+2] = "#FFFFFF";
	}
}

/*
* this function creates a light purplish 'chrome' effect
*/
function purpleChrome(pixels){
	var d = pixels.data;
	for(var i=0; i<d.length;i++){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		
		d[i+1] = b;
		d[i+2] = g;
		d[i] = r;
	}
	return pixels;
}

/*
* this filter turns any white spots purple
*/
function purplizer(pixels){
	//aka purplefier - all pixels with green=red or green>red become purple
	var d = pixels.data;
		for(var i=0; i<d.length; i+=4){
				var r = d[i];
				var g = d[i+1];
				var b = d[i+2];
				var a = d[i+3];
		
		        if(g >= r){
					d[i+2] = d[i+2]*2;
					d[i+1] = d[i+2]/2;
				}
		/*
		for(j=0;j<5;j++){
				d[i] = d[((j*(pixels.width*4)) + (j*4)) + 2];
				d[i+1] = d[((j+2)*(pixels.width*4)) + ((j+1)*4)];
		}
		*/
	}
		
	return pixels;
}

/*
* this filter turns everything dark 
*/
function scary(pixels){
	var saturationValue = 2.5;
	var d = pixels.data;
	
	//making the lumR,G,andB values nearly the same is equivalent to blacking out the picture i.e. 255,255,255 = black
	var lumR = .6020//constant for determining luminance of red
	var lumG = .6094 //constant for determining luminance of green
	var lumB = .6086////constant for determining luminance of blue
	
	//one of these equations per r,g,b
	var r1 = (1 - saturationValue) * lumR + saturationValue;
	var g1 = (1 - saturationValue) * lumG + saturationValue;
    var b1 = (1 - saturationValue) * lumB + saturationValue;	
	
	//then one of these for each
	var r2 = (1 - saturationValue) * lumR;
	var g2 = (1 - saturationValue) * lumG;
    var b2 = (1 - saturationValue) * lumB;	
	
	for(var i = 0; i < d.length; i+=4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		
		d[i] = r*r1 + g*g2 + b*b2;
		d[i+1] = r*r2 + g*g1 + b*b2;
	    d[i+2] = r*r2 + g*g2 + b*b1;
	}
	return pixels;
}

/*
* this filter saturates and darkens some colors and produces an interesting palette
*/
function heatwave(pixels){
	var d = pixels.data;
	for(var i=0; i < d.length; i++){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		if(g > 100 && g < 200){
			d[i+1] = 0;
		}
		if(r < 100){
			d[i] = d[i]*2;
		}
	}
	return pixels;
}

/*
* I think this function should have been called 'noise'. it pretty much just shifts all the pixels around.
*/
function randomize(pixels){
	var d = pixels.data;
	
	for(var i=0; i < d.length; i+=4){
		
		var rand = Math.floor(Math.random()*5 + 1); //random from 1 to 5
		
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		var a = d[i+3];
		
		//if there is a pixel that is not white (not 255,255,255)
		if(r !== 255 || g !== 255 || b !== 255){
			//then move the pixel in a random direction (up, down, left, or right)
			//depending on the random number
			//1 = up, 2 = down, 3 = left, 4 = right, 5 = no movement
			switch(rand){
				case 1: 
					if(i <= 2400){
						//move down
						d[i+2400] = r;
						d[i+2401] = g;
						d[i+2402] = b;
						d[i+2403] = a;
					} else {
						d[i-2403] = r;
						d[i-2402] = g;
						d[i-2401] = b;
						d[i-2400] = a;
					}
					break;
				case 2:
					//move down 
					d[i+2400] = r;
					d[i+2401] = g;
					d[i+2402] = b;
					d[i+2403] = a;
					break;
				case 3:
				    d[i-4] = r;
					d[i-3] = g;
					d[i-2] = b;
					d[i-1] = a;
					break;
				case 4:
					d[i+4] = r;
					d[i+5] = g;
					d[i+6] = b;
					d[i+7] = a;
					break;
				case 5:
					//do nothing
					break;
			}
		}
	}
	return pixels;
}

/*
* this function inverts colors
*/
function invert(pixels){
	
	var d = pixels.data;
	var r,g,b,x,y,z;
	
	for(var i = 0; i < d.length; i+=4){
		
		r = d[i];
		g = d[i+1];
		b = d[i+2];
		
		d[i] = 255 - r;
		d[i+1] = 255 - g;
		d[i+2] = 255 - b;
		
	}

	return pixels;
}


/*
* this function causes a blurring effect. I believe it is a Gaussian blur? 
*/
function blurry(pixels){

var d = pixels.data;

for(i = 0; i < d.length; i+=4){
		
		//if these conditions are not undefined, then that pixel must exist.
		//right pixel (check if 4 pixel radius ok)
		var cond1 = (d[i+4] == undefined);
		//left pixel
		var cond2 = (d[i-4] == undefined);
		//pixel below
		var cond3 = (d[i+2800] == undefined);
		//pixel above
		var cond4 = (d[i-2800] == undefined);
		
		if(!cond1 && !cond2 && !cond3 && !cond4){
		
			var newR = (d[i+4]*.2 + d[i-4]*.2 + d[i+2800]*.2 + d[i-2800]*.2 + d[i]*.2);
			var newG = (d[i+5]*.2 + d[i-3]*.2 + d[i+2801]*.2 + d[i-2799]*.2 + d[i+1]*.2);
			var newB = (d[i+6]*.2 + d[i-2]*.2 + d[i+2802]*.2 + d[i-2798]*.2 + d[i+2]*.2);
			var newA = (d[i+7]*.2 + d[i-1]*.2 + d[i+2803]*.2 + d[i-2797]*.2 + d[i+3]*.2);
		
			d[i] = newR;
			d[i+1] = newG;
			d[i+2] = newB;
			d[i+3] = newA;
		}
}
return pixels;
}

/*
* this function creates fisheye distortion! 
*/
//source: http://popscan.blogspot.com/2012/04/fisheye-lens-equation-simple-fisheye.html
//http://paulbourke.net/dome/fisheye/
function fisheye(imgData, xPos, yPos, rad){
	
	//this is the array you edit with the translated pixels
	var data = imgData.data;
	
	var height = Math.sqrt(data.length/4);
	var width = Math.sqrt(data.length/4);
	
	//this is the original data set you want to refer to
	//to put the correctly colored pixels in the right place
	//remember to make a deep copy so that any editing to 'data' will not
	//alter the elements in this array!
	var oldData = new Uint8ClampedArray(data);

	var pixelCounter = 0;
	
	//rows
	for(var y = 0; y < height; y++){
	
		//normalize y coordinate to -1...+1
		var normY = (2*y)/(height) - 1;
		
		//calculate normY squared
		var normY2 = normY * normY;
		
		//columns
		for(var x =0; x < width; x++){

			//collect old data for this pixel
			var start = pixelCounter*4;
			
			//normalize x coordinate to -1...+1
			var normX = (2*x)/(width) - 1;
			
			//calculate normX squared
			var normX2 = normX * normX;
			
			//calculate distance from center
			var dist = Math.sqrt(normX2 + normY2);

			//only alter pixels inside of radius
			//changing the dist range affects the scope of the lens. i.e. less range (.5 => .6) gives you a 'telescoping' lens. 
			//a larger range (0 => 1) gives you a full circle.
			if( (0 <= dist) && (dist <= 1) ){
		
				var newR = Math.sqrt(1 - dist*dist);
				
				//new distance between 0 and 1
				newR = (dist + (1 - newR)) / 2;
				
				//discard any radius greater than 1
				if(newR <= 1){
					
					//calculate angle for polar coordinates
					var theta = Math.atan2(normY, normX);
					
					//calculate new X position with new distance in same angle
					var newX = newR * Math.cos(theta);
					
					//calculate new Y position with new distance in same angle
					var newY = newR * Math.sin(theta);
					
					//map from -1 to 1 to image coordinates
					var x2 = Math.floor(( (newX + 1)*(width) ) / 2);
					var y2 = Math.floor(( (newY + 1)*(height) ) / 2);

					srcPos = ((width)*(y2))+x2;
				    srcPos *= 4;
					
					data[start] = oldData[srcPos];
					data[start + 1] = oldData[srcPos + 1];
					data[start+ 2] = oldData[srcPos + 2];
					data[start + 3] = oldData[srcPos + 3];		
				}
			}
			pixelCounter++;
		}//end inner for loop
	}//end outer for loop
	
	//yPos and xPos are the coordinates of the center of the area of interest
	context.putImageData(imgData, xPos-rad, yPos-rad);
}

//the above function can be used like so below:
//first, a default fisheye that encompasses the canvas:
function defaultFisheye(){
	var data = context.getImageData(0, 0, theCanvas.width, theCanvas.height);
	fisheye(data, 0, 0, 0);
}

//this one is a mobile one, in which the user should be able to specify a 
//a radius and can click anywhere on the canvas to generate a fisheye distortion within the 
//specified radius.

//It works by making a new image data array with only the pixels from the area specified by the user (after an image has been imported),
//doing the distortion function on that array, and then putting the results in the same location it came from onto the canvas.
function mobileFisheye(radius, xPos, yPos){
	
	//xPos and yPos are the coordinates of the center of the area of interest
	var diameter = radius*2;

	//xPos-radius = the x coordinate of the upper left corner of the area of interest!
	var data = context.getImageData(xPos-radius, yPos-radius, diameter, diameter);
	
	fisheye(data, xPos, yPos, radius);
}

/*example implementation:
$('#canvas0').mousedown(function(e){

	//specified radius of effect = 50;
	var rad = 100;
	var xPos = e.offsetX;
	var yPos = e.offsetY;

	mobileFisheye(rad, xPos, yPos);
})
*/

/**** END FISHEYE *****/

//control brightness - increase
function incBright(pixels){
	
	var d = pixels.data;
	
	for(var i = 0; i < d.length; i+=4){
			
			d[i] += 5;
			d[i+1] += 5;
			d[i+2] += 5;
			//d[i+3] += 5;
	}
	
	return pixels;
	
}

//control brightness - decrease
function decBright(pixels){
	
	var d = pixels.data;
	
	for(var i = 0; i < d.length; i+=4){
			
			d[i] -= 5;
			d[i+1] -= 5;
			d[i+2] -= 5;
			//d[i+3] -= 5;
	}
	
	return pixels;
}

//change contrast
//set range -128 to 128 for now
//I don't think it's working quite right...
//basically, all dark colors should get darker, and light colors should get lighter right?
var contrastVal = 0;

function inContrast(pixels){
	
	var d = pixels.data;
	
	//var contrastFactor = (259*(contrastValue + 255)) / (255*(259 - contrastValue));
	
	if(contrastVal < 128){
		contrastVal++;
	}
	
	var contrastFactor = Math.max( ((128 + contrastVal) / 128), 0 )
		
	for(var i = 0; i < d.length; i+=4){		
		
		d[i] = d[i]*contrastFactor;
		d[i+1] = d[i+1]*contrastFactor;
		d[i+2] = d[i+2]*contrastFactor;
		d[i+3] = d[i+3]*contrastFactor;
			
	}
	return pixels;
}

function deContrast(pixels){
	
	var d = pixels.data;
	
	//var contrastFactor = (259*(contrastValue + 255)) / (255*(259 - contrastValue));
	
	if(contrastVal > -128){
		contrastVal--;
	}
	
	var contrastFactor = Math.max( ((128 + contrastVal) / 128), 0 )
		
	for(var i = 0; i < d.length; i+=4){		
		
		d[i] = d[i]*contrastFactor;
		d[i+1] = d[i+1]*contrastFactor;
		d[i+2] = d[i+2]*contrastFactor;
		d[i+3] = d[i+3]*contrastFactor;
			
	}
	return pixels;
}

//RESET PICTURE
function reset(){
	context.clearRect(0, 0, theCanvas.width, theCanvas.height);
	context.drawImage(img, 0, 0, 700, 700);
}





