
window.onload = function() {
  const LINELEN = Math.sqrt(50*50 + 50 * 50);

	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		width = canvas.width = window.innerWidth,
		height = canvas.height = window.innerHeight;

	var points = [],
		sticks = [],
		bounce = 0.9,
		gravity = 1.1,
		friction = 0.999;
		  
  var following = false;
  var pointToFollow = null;
	
	generate_lattice(10, 4, 100, 100)
	
	function generate_lattice(width, height, x ,y) {
	  var prevTop = [];
	
	  for (let j = 0; j < height; j++) {
	    var topPoints = prevTop;
	    
	    if(j == 0) {
	      for (let i = 0; i < width; i++) {
	        var point = {
	          static: j == 0,
	          isCenter: false,
		        x: x*(i+1),
		        y: y + j * 100,
		        oldx: x*(i+1),
		        oldy: y + j * 100
	        };
	      
	        topPoints.push(point);
	        points.push(point);
	      }
	    }
	    
	    var bottomPoints = [];
	    for (let i = 0; i < width; i++) {
	      var point = {
	        static: i == 0 || i == width - 1,
	        isCenter: false,
		      x: x*(i+1),
		      y: y + 100 + j * 100,
		      oldx: x*(i+1),
		      oldy: y + 100 + j * 100
	      };
	      bottomPoints.push(point);
	      points.push(point);
	    }
	    
	    for (let i = 0; i < width - 1; i++) {
	      var middlePoint = {
	        static: false,
	        isCenter: true,
		      x: x*(i+1) + 50,
		      y: y + 50 + j * 100,
		      oldx: x*(i+1) + 50,
		      oldy: y + 50 + j * 100
	      };
	    
	      points.push(middlePoint);
	      
	      stick(topPoints[i], middlePoint);
	      stick(topPoints[i+1], middlePoint);
	      stick(bottomPoints[i], middlePoint);
	      stick(bottomPoints[i+1], middlePoint);
	    }
	    
	    prevTop = bottomPoints;
	  }
	}
	
	function stick(start, end) {
		sticks.push({
		  p0: start,
		  p1: end,
		  length: LINELEN
	  });
	}

	function distance(p0, p1) {
		var dx = p1.x - p0.x,
			dy = p1.y - p0.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	update();

	function update() {	
		updatePoints();
		constrainPoints();
		// for(var i = 0; i < 5; i++) {
			updateSticks();
		// }
		context.clearRect(0, 0, width, height);
		renderRings();
		renderPoints();
		renderSticks();
		requestAnimationFrame(update);
	}

  var mouseX = null;
  var mouseY = null;
  document.onmousemove = handleMouseMove;
  function handleMouseMove(event) {
    var eventDoc, doc, body;
    mouseX = event.x;
    mouseY = event.y;
  }

	function updatePoints() {	
	  if(mouseX != null && mouseY != null && following && pointToFollow != null) {
	    pointToFollow.x = mouseX;
	    pointToFollow.y = mouseY;
	  }
	
		for(var i = 0; i < points.length; i++) {
			var p = points[i],
				vx = (p.x - p.oldx) * friction;
				vy = (p.y - p.oldy) * friction;
			if(p.static) {
			  continue;
			}

			p.oldx = p.x;
			p.oldy = p.y;
			p.x += vx;
			p.y += vy;
			p.y += gravity;
		}
	}

	function constrainPoints() {
		for(var i = 0; i < points.length; i++) {
			var p = points[i],
				vx = (p.x - p.oldx) * friction;
				vy = (p.y - p.oldy) * friction;

			if(p.x > width) {
				p.x = width;
				p.oldx = p.x + vx * bounce;
			}
			else if(p.x < 0) {
				p.x = 0;
				p.oldx = p.x + vx * bounce;
			}
			if(p.y > height) {
				p.y = height;
				p.oldy = p.y + vy * bounce;
			}
			else if(p.y < 0) {
				p.y = 0;
				p.oldy = p.y + vy * bounce;
			}
		}
	}

	function updateSticks() {
		for(var i = 0; i < sticks.length; i++) {
			var s = sticks[i],
				dx = s.p1.x - s.p0.x,
				dy = s.p1.y - s.p0.y,
				distance = Math.sqrt(dx * dx + dy * dy),			
			  difference = Math.min(s.length - distance, 0),
				percent = difference / distance / 2,
				offsetX = dx * percent,
				offsetY = dy * percent;
				
			if(!s.p0.static && !s.p1.static) {
			  s.p0.x -= offsetX;
			  s.p0.y -= offsetY;
			  s.p1.x += offsetX;
			  s.p1.y += offsetY;
			}	else if(s.p0.static) {
			  s.p1.x += 2 * offsetX;
			  s.p1.y += 2 * offsetY;
			} else if(s.p1.static) {
			  s.p0.x -= 2 * offsetX;
			  s.p0.y -= 2 * offsetY;
			} else {
			  //nothing
			}
		}
	}

	function renderRings() {
		for(var i = 0; i < points.length; i++) {
			var p = points[i];
			if(!p.isCenter) {
			  continue;
			}
			context.beginPath();
			context.arc(p.x, p.y, LINELEN, 0, Math.PI * 2);
			context.stroke();
		}
	}

	function renderPoints() {
		for(var i = 0; i < points.length; i++) {
			var p = points[i];
			if(p.static) {
			  context.fillStyle = "#FF0000";
			}
			context.beginPath();
			context.arc(p.x, p.y, 5, 0, Math.PI * 2);
			context.fill();
			context.fillStyle = "#000000";
		}
	}

	function renderSticks() {
		context.beginPath();
		for(var i = 0; i < sticks.length; i++) {
			var s = sticks[i];
			context.moveTo(s.p0.x, s.p0.y);
			context.lineTo(s.p1.x, s.p1.y);
		}
		context.stroke();
	}
	
	function gaussianRand() {
    var rand = 0;

    for (var i = 0; i < 6; i += 1) {
      rand += Math.random();
    }

    return rand / 6;
  }
  
  function gaussianRandom(start, end) {
    return Math.floor(start + gaussianRand() * (end - start + 1));
  }
  
  document.onclick = function(event) {
    if(following) {
      following = !following;
      pointToFollow = null;
      return;
    }
    
    var eventPoint = {
      x: event.x,
      y: event.y
    };
    
    for (let i = 0; i < points.length; i++) {
      if(distance(points[i], eventPoint) <= 5) {
        pointToFollow = points[i];
        following = true;
        break;
      }
    }
  };
};
