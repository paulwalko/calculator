
var main;


function start(){
	var c=document.getElementById("screen");
	var screen = new Screen("100%","585",c);
	main = new backgrounds(screen);
	if(Math.random()>.7)
	main.addScene(15000, new lighting());
	if(Math.random()>.6)
	main.addScene(15000, new nodes());
	if(Math.random()>.6)
	main.addScene(15000, new islands());
	main.addScene(15000, new terrain());
	if(Math.random()>.2)
	main.addScene(15000, new title());
	if(Math.random()>.2)
	main.addScene(15000, new lighting());
	if(Math.random()>.2)
	main.addScene(15000, new nodes());
	if(Math.random()>.2)
	main.addScene(15000, new islands());
	if(Math.random()>.2)
	main.addScene(15000, new title());
	main.addScene(15000, new lighting());
	//main.addScene(15000, new classic());
	main.start();

	
}

function Screen(WIDTH, HEIGHT, CANVAS){

	var isPercentWidth  = (WIDTH+"").indexOf('%') === -1 ? false : true;
	var isPercentHeight = (HEIGHT+"").indexOf('%') === -1 ? false : true;
	var percentWidth = parseInt(WIDTH);
	var percentHeight = parseInt(HEIGHT);
	var width = parseInt(WIDTH);
	var height = parseInt(HEIGHT);
	var c = CANVAS;
	var ctx = c.getContext("2d");
	
	if(isPercentWidth || isPercentHeight)
		window.addEventListener('resize', resizeCanvas, false);
	resizeCanvas();
	
	
	
    function resizeCanvas() {
		if(window.innerWidth<767)
			height = 0;
		else if(window.innerWidth<992)
			height = 445;
		else if(window.innerWidth<1199)
			height = 505;
		else
			height = 595;
		if(isPercentWidth){
			ctx.width = parseInt(window.innerWidth*(percentWidth/100.0));
			width = ctx.width;
			c.width = ctx.width;
		}
		else{
			ctx.width = width;
			c.width = width;
		}
		if(isPercentHeight){
			ctx.height = parseInt(window.innerHeight*(percentHeight/100.0));
			height = ctx.height;
			c.height = ctx.height;
			
		}
		else{
			ctx.height = height;
			c.height =height;
		}
		//main.refresh();
    }
	
	function setWidth(WIDTH){
		isPercentWidth  = (WIDTH+"").indexOf('%') === -1 ? false : true;
		percentWidth = parseInt(WIDTH);
		width = parseInt(WIDTH);
		resizeCanvas();
	}
	
	function setHeight(HEIGHT){
		isPercentHeight  = (HEIGHT+"").indexOf('%') === -1 ? false : true;
		percentHeight = parseInt(HEIGHT);
		height = parseInt(HEIGHT);
		resizeCanvas();
	}
	
	return  {
		getWidth : function(){return width;},
		getHeight : function(){return height;},
		setWidth : setWidth,
		setHeight : setHeight,
		getCTX : function(){return ctx;}
		
	};
}



function backgrounds(SCREEN){	
	var end=null, last=null, last=null, temp=null; 
	var ctx = SCREEN.getCTX();
	var date = new Date();
	var list = new Array();
	var listTime = new Array();
	var startTime = null;
	var startSceneTime = null;
	var endSceneTime = null;
	var difSceneTime = -1;
	var activeScene=0;
	var activeThread = -1;
	var nextThreadWait = -1;
	var screen = SCREEN;
	
	var timeoutSceneLoopID = null, timeoutSceneID = null;
	
	function addScene(time, refreshCallback) {
		refreshCallback.setScreen( screen);
		list[list.length] = refreshCallback;
		listTime[listTime.length] = time;
	}
	
	function start() {	
		var pos = 0;
		startTime = date.getTime();
		sceneLoop(null,pos);
	}
	
	function sceneLoop(last,pos){
		clearInterval(nextThreadWait);
		runScene(last, pos%list.length, (pos+1)%list.length);
		timeoutSceneLoopID = window.setTimeout(function(){	
			nextThreadWait = window.setInterval(function() {
				if(difSceneTime == -1 && Date.now() > endSceneTime){
					sceneLoop(pos, (pos+1)%list.length);
					clearInterval(nextThreadWait);
				}
			}, 16); 	
			
		}, getSceneTime(pos));
	}
	
	function runScene(LAST, CUR, NEXT){
		
		//timeoutSceneID = window.setTimeout(function(){	
			if(LAST != null){
				getScene(LAST).end();
				clearInterval(activeThread);
			}
			else{
				getScene(CUR).setup();
				preLoadImg(getScene(CUR));
			}
			getScene(CUR).start();
			activeThread = window.setInterval(function() {
					getScene(CUR).update(getScene(activeScene).refreshRate());
					getScene(CUR).render(ctx);
				}, getScene(CUR).refreshRate()); 	
			
			activeScene = CUR;
			startSceneTime = Date.now();
			endSceneTime = Date.now()+getSceneTime(CUR);	
			if(getScene(NEXT)!=null)
			{
				getScene(NEXT).setup();
				preLoadImg(getScene(NEXT));
			}	
		//}, getSceneTime(CUR));
	}
	
	function pause() {
		if(difSceneTime == -1)
		{
		
			difSceneTime = Date.now()-startSceneTime;
			clearInterval(activeThread);
			activeThread = window.setInterval(function() {
					
					getScene(activeScene).render(ctx);
			
				}, getScene(activeScene).refreshRate()); 	
		}
		else
		{
			clearInterval(activeThread);
			endSceneTime = Date.now()+getSceneTime(activeScene);		
			startSceneTime = Date.now()-difSceneTime;
			activeThread = window.setInterval(function() {
					getScene(activeScene).update(getScene(activeScene).refreshRate());
					getScene(activeScene).render(ctx);
				}, getScene(activeScene).refreshRate()); 	
			
			
			difSceneTime = -1;
		}
	}
	
	function getScene(POS){
		
		return list[POS];
	}
	
	function getSceneTime(POS){
		return listTime[POS];
	}
	
	
	function preLoadImg(refreshCallback){
		for (i=0;i<refreshCallback.imgLoc.length;i++) 
		{
			if(refreshCallback.img[i]==null){
				refreshCallback.img[i] = new Image();
				//if(refreshCallback.loading!=null)
				//	refreshCallback.loading += 1;
				refreshCallback.img[i].onload = function() {
					//if(refreshCallback.loading!=null)
					//	refreshCallback.loading -= 1;
					console.log ( 'Image loaged' );
				};
				refreshCallback.img[i].src = refreshCallback.imgLoc[i] ;
			}
		}
	}
	function refresh(){
		if(getScene(activeScene)!== undefined)
			getScene(activeScene).render(ctx);
	}
	function getDone(){
		if(difSceneTime == -1)
		return 100-100.0*(Date.now()-startSceneTime)/(endSceneTime-startSceneTime);
		else
		return 100-100.0*(difSceneTime)/(endSceneTime-startSceneTime);
	}
	function getList(){
		var send = new Array();
		for(var i = 0;i< list.length;i++){
			send[send.length] = list[i];
		}
		return send;
	}
	function getActive(){
		return activeScene;
	}
	
	function playScene(num){
		alert(num);
		clearInterval(timeoutSceneLoopID);
		sceneLoop(activeScene,(num)%list.length);
	}
	
	function nextScene(){
		clearInterval(timeoutSceneLoopID);
		sceneLoop(activeScene,(activeScene+1)%list.length);
	}
	function backScene(){
		clearInterval(timeoutSceneLoopID);
		if(Date.now()-startSceneTime<500)
		{
			var next = activeScene-1;
			if(next<0)next=list.length-1;
			sceneLoop(activeScene,next);
		}
		else
			sceneLoop(activeScene,activeScene);
	}
	function changeOrder(OLD, NEW){
		if(OLD<NEW){
			for(var i =0;i<Math.abs(OLD-NEW);i++){
				var tempObj = list[OLD+i];
				var tempTime = listTime[OLD+i];
				list[OLD+i] = list[OLD+i+1];
				listTime[OLD+i] = listTime[OLD+i+1];
				list[OLD+i+1] = tempObj;
				listTime[OLD+i+1] = tempTime;
			}
		}
		else{
			for(var i =Math.abs(OLD-NEW);i>0;i--){
				var tempObj = list[NEW+i-1];
				var tempTime = listTime[NEW+i-1];
				list[NEW+i-1] = list[NEW+i];
				listTime[NEW+i-1] = listTime[NEW+i];
				list[NEW+i] = tempObj;
				listTime[NEW+i] = tempTime;
			}
		}
		if(OLD == activeScene)activeScene = NEW;
		else if(OLD >= activeScene&& NEW <= activeScene)activeScene++;
		else if(OLD <= activeScene&& NEW >= activeScene)activeScene--;
		
	}
	
	return  {
		backScene : backScene,
		addScene : addScene,
		changeOrder : changeOrder,
		nextScene : nextScene,
		playScene : playScene,
		pause : pause,
		start : start,
		refresh : refresh,
		getDone : getDone,
		getList : getList,
		getCtx : function(){return ctx;},
		getActive : getActive
	};
}



function classic(){
	var img = new Array();
	var imgLoc = ["http://davidjokinen.com/water.gif","http://davidjokinen.com/dirt1.gif","http://davidjokinen.com/grass1.gif","http://davidjokinen.com/grass2.gif","http://davidjokinen.com/grass3.gif","http://davidjokinen.com/grass4.gif","http://davidjokinen.com/tree2.gif","http://davidjokinen.com/housealpha2.gif"];
	var screen = null;
	var mx=0, my=0;

	var noiceGen;
	var houseCount = 0;
	
	function mouseMove(event) {
		mx = event.pageX;
		my = event.pageY;
	}
		
	function setup() {
		
	}

	function refreshRate(){
		return 100;
	}
	
	function start() {
		window.addEventListener("mousemove", mouseMove, false);
		
		noiceGen = new perlinNoise(1);
		
		return end;
	}

	function render(ctx){
		houseCount = 0;
		for(var y=0;y<ctx.height/20+1;y++)
		for(var x=ctx.width/70;x>=-1;x--)
			{
				var ax =0,ay=-20;
				if(y%2==1){ax-=35;}
				//console.log ( mx );
				if(Math.abs(x*70-mx)<210&&Math.abs(y*20-my)<80)
					if((Math.abs(x-mx/70)+Math.abs(y-my/20))<=4)
						ay -= (4-(Math.abs(x-mx/70)+Math.abs(y-my/20)));
				if(noiceGen.getHeight(x/2.0,y/2.0)<-.2)
				ctx.drawImage(img[0],x*70+ax,y*20+ay);
				//else if(noiceGen.getHeight(x/2.0,y/2.0)<-.13)
				//ctx.drawImage(img[1],x*70+ax,y*20+ay);
				else{
					if(parseInt((1)*noiceGen.getHeight(x/2.0,y/2.0)*600)%2==1)ctx.drawImage(img[2],x*70+ax,y*20+ay);
					else if(parseInt((1)*noiceGen.getHeight(x/2.0,y/2.0)*600)%3==0)ctx.drawImage(img[3],x*70+ax,y*20+ay);
					else if(parseInt((1)*noiceGen.getHeight(x/2.0,y/2.0)*600)%2==0)ctx.drawImage(img[5],x*70+ax,y*20+ay);
					else ctx.drawImage(img[4],x*70+ax,y*20+ay);
				}
				if(noiceGen.getHeight(x/2.0,y/2.0)>.6&&parseInt((1)*noiceGen.getHeight(x/2.0,y/2.0)*600)%2==1)ctx.drawImage(img[6],x*70+ax,y*20+ay-80);
				else if(noiceGen.getHeight(x/2.0,y/2.0)>.4&&parseInt((1)*noiceGen.getHeight(x/2.0,y/2.0)*600)%3==0)ctx.drawImage(img[6],x*70+ax,y*20+ay-80);
				else if(noiceGen.getHeight(x/2.0,y/2.0)>.1&&parseInt((1)*noiceGen.getHeight(x/2.0,y/2.0)*600)%15==0)ctx.drawImage(img[6],x*70+ax,y*20+ay-80);
				else if(houseCount<2&&noiceGen.getHeight(x/2.0,y/2.0)>.1&&noiceGen.getHeight(x/2.0,y/2.0)<.2&&parseInt((1)*noiceGen.getHeight(x/2.0,y/2.0)*600)%100==1){ctx.drawImage(img[7],x*70+ax,y*20+ay-75);houseCount++;}
			}

	}

	function update(delta){


	}
	
	function end(){
		window.removeEventListener("mousemove", mouseMove, false);
	}
	
	return  {
		end : end,
		img : img,
		imgLoc : imgLoc,
		refreshRate : refreshRate,
		update : update,
		render : render,
		start : start,
		setScreen : function(m){screen = m;},
		setup : function(){return setup();},
		run : function(ctx,t){return run(ctx,t);},
		toString : function(){return "Iso-World";}
	};
}

function lighting(){
	var img = new Array();
	var imgLoc = [];
	var screen = null;
	var mx=0, my=0;

	var noiceGen;
	var houseCount = 0;
	var time = Date.now();
	
	var faceList = new Array();
	var lightList = new Array();
	
	function mouseMove(event) {
		mx = event.pageX;
		my = event.pageY;
	}
	
	function point3D(X,Y,Z){
		var x = X;
		var y = Y;
		var z = Z;

		return  {
			setX : function(a){x=a},
			setY : function(a){y=a},
			setZ : function(a){z=a},
			getX :  function(){return x;},
			getY :  function(){return y;},
			getZ :  function(){return z;},
			sub :  function(pnt){x -= pnt.getX();y -= pnt.getY();z -= pnt.getZ();},
			add :  function(pnt){x += pnt.getX();y += pnt.getY();z += pnt.getZ();},
			mul :  function(pnt){x *= pnt.getX();y *= pnt.getY();z *= pnt.getZ();},
			getSub :  function(pnt){return new point3D(x - pnt.getX(),y - pnt.getY(),z - pnt.getZ());},
			getAdd :  function(pnt){return new point3D(x + pnt.getX(),y + pnt.getY(),z + pnt.getZ());},
			getCross :  function(pnt){return new point3D(y*pnt.getZ()-pnt.getY()*z,z*pnt.getX()-pnt.getZ()*x,x*pnt.getY()-pnt.getX()*y);},
			getNormal :  function(){var len = Math.sqrt(x*x+y*y+z*z);return new point3D(x/len,y/len,z/len);},
			getLength :  function(){var len = Math.sqrt(x*x+y*y+z*z);return len;},
			getDot :  function(pnt){return x*pnt.getX()+y*pnt.getY()+z*pnt.getZ();}
		};
	}
	
	function face(colorSet){
		var list = new Array();
		var color = colorSet;
		var render = function(ctx){
			var x = list[list.length-1].getX(),
				y = list[list.length-1].getY();
			ctx.beginPath();	
			ctx.moveTo(x,y);
			for (var i = 0; i < list.length ; i++) {
				x = list[i].getX();
				y = list[i].getY();
				ctx.lineTo(x,y);
			}
			ctx.closePath();
			ctx.strokeStyle = "#CCCCCC";
		//	ctx.stroke();
			ctx.fillStyle = color;
			ctx.fill();
		}
		var lightSource = function(pnt1,pnt2,pnt3){
			var x = 0,
				y = 0,
				z = 0;
			for (var i = 0; i < 3 ; i++) {
				x += list[i].getX();
				y += list[i].getY();
				z += list[i].getZ();
			}
			x /= 3;y /= 3;z /= 3;
			var sumPnt = new point3D(x,y,z);
		
			var normal1 = list[1].getSub(list[0]).getCross(list[2].getSub(list[0])).getNormal();
			var normal2 = pnt1.getSub(sumPnt).getNormal();
			var normal3 = pnt2.getSub(sumPnt).getNormal();
			var normal4 = pnt3.getSub(sumPnt).getNormal();
			var distance1 = pnt1.getSub(sumPnt).getLength();
			var distance2 = pnt2.getSub(sumPnt).getLength();
			var distance3 = pnt3.getSub(sumPnt).getLength();

			var num1 = normal1.getDot(normal2)*(800/distance1)+.2;
			var num2 = normal1.getDot(normal3)*(800/distance2)+.2;
			var num3 = normal1.getDot(normal4)*(800/distance3)+.2;		
			color = "rgb("+parseInt(num1*255)+","+parseInt(num2*255)+","+parseInt(num3*255)+")";
		}
		return  {
			add  : function(i){list[list.length]=i;},
			get  : function(i){return list[i];},
			render : function(ctx){ render(ctx);},
			lightSource : function(pnt1,pnt2,pnt3){ lightSource(pnt1,pnt2,pnt3);},
			size :  function(i){return list.length;}
		};
	}
		
	function setup() {
		noiceGen = new perlinNoise(1);
	}

	function refreshRate(){
		return 32;
	}
	
	function start() {
		window.addEventListener("mousemove", mouseMove, false);
		var size = 40;
		var noiceMul =100;
		var noiceScale = 6;
		var width = screen.getWidth()/size+1;
		var height = 15;
		for(var x = 0;x<width;x++){
			for(var y = 0;y<height;y++){
				faceList[(x*height+y)*2] = face("#DDDDDD");
				faceList[(x*height+y)*2].add(point3D(x*size,y*size,noiceMul*noiceGen.getHeight(x*noiceScale,y*noiceScale)));
				faceList[(x*height+y)*2].add(point3D(x*size+size,y*size,noiceMul*noiceGen.getHeight(x*noiceScale+noiceScale,y*noiceScale)));
				faceList[(x*height+y)*2].add(point3D(x*size+size,y*size+size,noiceMul*noiceGen.getHeight(x*noiceScale+noiceScale,y*noiceScale+noiceScale)));
				faceList[(x*height+y)*2+1] = face("#DDDDDD");
				
				faceList[(x*height+y)*2+1].add(point3D(x*size+size,y*size+size,noiceMul*noiceGen.getHeight(x*noiceScale+noiceScale,y*noiceScale+noiceScale)));
				faceList[(x*height+y)*2+1].add(point3D(x*size,y*size+size,noiceMul*noiceGen.getHeight(x*noiceScale,y*noiceScale+noiceScale)));
				faceList[(x*height+y)*2+1].add(point3D(x*size,y*size,noiceMul*noiceGen.getHeight(x*noiceScale,y*noiceScale)));
			}
		}

		
		
		lightList[0] = point3D(300,300,1000);
		lightList[1] = point3D(200,800,1000);
		lightList[2] = point3D(700,300,1000);
		return end;
	}

	function render(ctx){
		for(var i = 0;i<faceList.length;i++)
			faceList[i].render(ctx);
	}

	function update(delta){
		time += delta;
		lightList[0].setX( 700+600*Math.sin(-time/1400+12000));
		lightList[0].setY( 300+400*Math.cos(-time/1400+12000));
		lightList[1].setX( 700+500*Math.sin(time/2200));
		lightList[1].setY( 300+500*Math.cos(time/2200));
		lightList[2].setX( 900+800*Math.sin(time/1000+17000));
		lightList[2].setY( 200+400*Math.cos(time/1000+17000));
		for(var i = 0;i<faceList.length;i++)
			faceList[i].lightSource(lightList[0],lightList[1],lightList[2]);
		
	}
	
	function end(){
		window.removeEventListener("mousemove", mouseMove, false);
	}
	
	return  {
		end : end,
		img : img,
		imgLoc : imgLoc,
		refreshRate : refreshRate,
		update : update,
		render : render,
		start : start,
		setScreen : function(m){screen = m;},
		setup : function(){return setup();},
		run : function(ctx,t){return run(ctx,t);},
		toString : function(){return "Lighting";}
	};
}


function terrain(){
	var img = new Array();
	var imgLoc = [];
	var screen = null;
	var mx=0, my=0;

	var noiceGen;
	var time = Date.now();
	var t = 0;
	
	var noiseList = new Array();
	var renderList = new Array();
	var map;
	var ratioX = 40;
	var ratioY = 20;
	var ratioZ = 60;
	var camera = new Point(0,0);
	
	function mouseMove(event) {
		mx = event.pageX;
		my = event.pageY;
	}
		
	function setup() {
		
	}

	function refreshRate(){
		return 32;
	}
	
	function createNoise(noise)
	{ 
		var canvas = document.createElement("canvas"),  
		ctx = canvas.getContext('2d');
		canvas.width	= 50;
		canvas.height 	= 50;
		
		for ( x = 0; x < canvas.width; x++ ) {  
		  for ( y = 0; y < canvas.height; y++ ) {  
			   number = Math.floor( Math.random() * 20 );  
			   ctx.fillStyle = "rgba(" + (number+230) + "," + (number+230) + "," + (number+245) + ",.65)";  
			   ctx.fillRect(x, y, 1, 1);  
		  }
		}  
		return canvas.toDataURL("image/png") ; 
	}
	
	function isoPoint(X,Y,Z){
	var x = X;
	var y = Y;
	var z = Z;
	var getScreenPoint = function(){
		var X1 = (x)*ratioX-(y)*ratioX;
		var Y1 = (x)*ratioY+(y)*ratioY-getZ()*ratioZ;
		return new Point(X1,Y1);
	}
	return  {
	    setX : function(a){x=a},
		setY : function(a){y=a},
		setZ : function(a){z=a},
	    getX :  function(){return x;},
		getY :  function(){return y;},
		getZ :  function(){return z;},
		getScreenPoint : function(){return getScreenPoint();},
		getScreenX : function(){return (x)*ratioX-(y)*ratioX;},
		getScreenY : function(){return (x)*ratioY+(y)*ratioY-(z)*ratioZ;}
	};
}

function isoFace(colorSet){
    var isoList = new Array();
	var color = colorSet;
	var render = function(ctx){
		var x = isoList[isoList.length-1].getScreenX()+camera.getX(),
			y = isoList[isoList.length-1].getScreenY()+camera.getY();
		ctx.beginPath();	
		ctx.moveTo(x,y);
		for (var i = 0; i < isoList.length ; i++) {
			x = isoList[i].getScreenX()+camera.getX();
			y = isoList[i].getScreenY()+camera.getY();
			ctx.lineTo(x,y);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.fillStyle = color;
		ctx.fill();
	}
	return  {
		add  : function(i){isoList[isoList.length]=i;},
		get  : function(i){return isoList[i];},
	    render : function(ctx){ render(ctx);},
		size :  function(i){return isoList.length;}
	};
}

function Point(X,Y){
    var x = X;
	var y = Y;
	return  {
	    setX : function(a){x=a},
		setY : function(a){y=a},
	    getX :  function(){return x;},
		getY :  function(){return y;}
	};
}
	
function Grid(X,Y){
	var canvas = document.createElement("canvas"),  
	 ctx = canvas.getContext('2d');
	canvas.width	= screen.getWidth();
	canvas.height 	= screen.getHeight();
	var image  = new Image(screen.getWidth(), screen.getHeight());
	var imagesrc = canvas.toDataURL("image/png");
	image.src = imagesrc;
	var map = new Array(X);
	var self = this;
	for (var i = 0; i < map.length ; i++) {
		map[i] = new Array(Y);
	}
	var color = new Array(X-1);
	for (var i = 0; i < map.length ; i++) {
		color[i] = new Array(Y-1);
	}
	var noiceGen = new perlinNoise(1);
	var noiceGen2 = new perlinNoise(1);
	for (var x = 0; x < map.length ; x++) {
	for (var y = 0; y < map[0].length ; y++) {
	    
		//alert(noiceGen.getHeight(x,y));
		map[x][y] = new isoPoint(x,y,noiceGen.getHeight(x*2,y*2)+4*noiceGen2.getHeight(x/2,y/2));
		if(x>=1&&y>=1){
			//var r=170, g=170, b=90;
			var r=0, g=90, b=0;
			r -= parseInt(40*(map[x][y].getZ()-map[x-1][y].getZ()+map[x][y].getZ()-map[x][y-1].getZ()) );
			g -= parseInt(40*(map[x][y].getZ()-map[x-1][y].getZ()+map[x][y].getZ()-map[x][y-1].getZ()) );
			b -= parseInt(40*(map[x][y].getZ()-map[x-1][y].getZ()+map[x][y].getZ()-map[x][y-1].getZ()) );
			color[x-1][y-1] = "rgba("+r+","+g+","+b+", 1)";
			//alert((x-1)+" "+(y-1));
		}
	}}
	
	var render = function(ctx2){
	    // Store the current transformation matrix
ctx.save();

// Use the identity matrix while clearing the canvas
ctx.setTransform(1, 0, 0, 1, 0, 0);
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Restore the transform
ctx.restore();
		var count =0; 
		var count2 =0; 
		
		for (var x = 0; x < map.length-1 ; x++) {
		for (var y = 0; y < map[0].length-1 ; y++) {
		//alert(map[x][y].getScreenX());
		    count2++;
		    var x1 = map[x][y].getScreenX()+camera.getX();
			var y1 = map[x][y].getScreenY()+camera.getY();
			var x2 = map[x][y+1].getScreenX()+camera.getX();
			var y2 = map[x][y+1].getScreenY()+camera.getY();
			var x3 = map[x+1][y+1].getScreenX()+camera.getX();
			var y3 = map[x+1][y+1].getScreenY()+camera.getY();
			var x4 = map[x+1][y].getScreenX()+camera.getX();
			var y4 = map[x+1][y].getScreenY()+camera.getY();
		    if((x1<0&&x2<0&&x3<0&&x4<0))
				continue;
			if((y1<0&&y2<0&&y3<0&&y4<0))
				continue;
			if((x1>screen.getWidth()&&x2>screen.getWidth()&&x3>screen.getWidth()&&x4>screen.getWidth()))
				continue;
			if((y1>screen.getHeight()&&y2>screen.getHeight()&&y3>screen.getHeight()&&y4>screen.getHeight()))
				continue;
			count++;	
			
			ctx.beginPath();
			ctx.moveTo(x1,y1);
			ctx.lineTo(x2,y2);
			ctx.lineTo(x3,y3);
			ctx.lineTo(x4,y4);
			ctx.lineTo(x1,y1);
			ctx.closePath();//This affects teh alpha.
			ctx.fillStyle = color[x][y];
			ctx.strokeStyle = "rgba(10,60,10, .4)";
			ctx.fill();
			ctx.stroke();
			
			//
		}}
		
		ctx2.globalAlpha = 0.45;
		ctx2.drawImage(canvas,0,0);
		ctx2.globalAlpha = 1;
	}
	
	var getHeight = function(x,y){
		if(x<0||y<0)
			return 0;
		if(x>map.length-1||y>map[0].length-1)
			return 0;
		var X = Math.floor(x);	
		var Y = Math.floor(y);
		var riX = (x-X);
		var riY = (y-Y);
		var rX = 1-(x-X);
		var rY = 1-(y-Y);
		
		return (rX*rY*map[X][Y].getZ()+riX*rY*map[X+1][Y].getZ()+riY*riX*map[X+1][Y+1].getZ()+riY*rX*map[X][Y+1].getZ())

	}
	
	return  {
		render : function(g){render(g);},
		getHeight : function(x,y){return getHeight(x,y);}
	};
}
	
	function start() {
		
		window.addEventListener("mousemove", mouseMove, false);
		map = new Grid(parseInt(screen.getWidth()/ratioX)+3,parseInt(screen.getHeight()/ratioY)+3);
		
		for(var i=0;i<5;i++){
			noiseList[i] = new Image(40,40);
			noiseList[i].src = createNoise(noiseList[i]);
		}

		return end;
	}
	
	

	function render(ctx){
		var pat2 =ctx.createPattern(noiseList[t%5],"repeat");
		var grd = ctx.createLinearGradient(0, 0, 0, 1200);
		
		// light blue
		grd.addColorStop(0, '#FFF');   
		// dark blue
		grd.addColorStop(1, '#000');
		ctx.fillStyle = grd;
		ctx.fillRect (0, 0, screen.getWidth(), screen.getHeight());
		ctx.fillStyle = pat2;
		ctx.fillRect (0, 0, screen.getWidth(), screen.getHeight());
		ctx.fillStyle = "rgba(70,40,0, .4)";
		map.render(ctx);
	}

	function update(delta){
		camera.setY(-100);
		camera.setX(2*screen.getWidth()/5);
		time += delta;
		t++;
		if(time>3000){
			time = 0;
			map = new Grid(parseInt(screen.getWidth()/ratioX/2)+3,parseInt(screen.getHeight()/ratioY/2)+3);
		
		}
	}
	
	function end(){
		window.removeEventListener("mousemove", mouseMove, false);
	}
	
	return  {
		end : end,
		img : img,
		imgLoc : imgLoc,
		refreshRate : refreshRate,
		update : update,
		render : render,
		start : start,
		setScreen : function(m){screen = m;},
		setup : function(){return setup();},
		run : function(ctx,t){return run(ctx,t);},
		toString : function(){return "Terrain";}
	};
}


function nodes(){
	/* Needed Vars for scene */
	var img = new Array();
	var imgLoc = [];
	var screen = null;
	
	var list = new Array();
	var t = 0;
	
	function drawNode(ctx,x,y,r){
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'yellow';
		ctx.fill();
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#003300';
		ctx.stroke();
	}
	function drawLine(ctx, con1, con2){
		 ctx.beginPath();
		 ctx.moveTo(con1.getX(), con1.getY());
		 ctx.lineTo(con2.getX(), con2.getY());
		 ctx.stroke();
	}
	function connector(X,Y,W){
		var x = X;
		var y = Y;
		var attached = new Array();
		var width = W;
		return  {
			clear : function(){attached = new Array()},
			add : function(add){attached[attached.length]=add;add.add2(this);},
			add2 : function(add){attached[attached.length]=add;},
			clicked : function(x2,y2){return (Math.sqrt(Math.pow(x-x2,2)+Math.pow(y-y2,2))<width);},
			addX : function(a){x=x+a},
			addY : function(a){y=y+a},
			width :  width,
			getX :  function(){return x;},
			getY :  function(){return y;},
			dis :  function(con){return Math.sqrt(Math.pow(x-con.getX(),2)+Math.pow(y-con.getY(),2));},
			ang :  function(con){return Math.atan((y-con.getY())/(x-con.getX()));},
			negx :  function(con){return Math.abs(x-con.getX())/(x-con.getX());},
			negy :  function(con){return Math.abs(y-con.getY())/(y-con.getY());},
			drawLines : function(ctx){ 
			for(var q=0;q<attached.length;q++)
				drawLine(ctx,this, attached[q]);},
			drawNode : function(ctx){ drawNode(ctx,x,y,width)},
			think : function(list){
				var fx = 0;
				var fy = 0;
				for(var q =0;q<attached.length;q++ )
				{
					var dis = (attached[q].dis(this) -200) / 100.0;
					var ang = attached[q].ang(this);
					var negx = attached[q].negx(this);
					var negy = attached[q].negx(this);
					fx += negx*16*dis*Math.cos(ang);
					fy += negy*16*dis*Math.sin(ang);
				}
				for(var q =0;q<list.length;q++ )
				{
					if(list[q]==this)continue;
					var dis = 1.0/(list[q].dis(this))  ;
					var ang = list[q].ang(this);
					var negx = list[q].negx(this);
					var negy = list[q].negx(this);
					fx -= negx*Math.pow(600.0,2)*dis*dis*Math.cos(ang);
					fy -= negy*Math.pow(600.0,2)*dis*dis*Math.sin(ang);
				}
				fx -= (x-screen.getWidth()/2)/60.0;
				fy -= (y-screen.getHeight()/2)/15.0;
				
				x += fx;
				y += fy;
				
			}
		};
	}

	function setup() {
		
	}

	function refreshRate(){
		return 44;
	}
	
	function start() {
		for(var q= 0;q<15;q++)
			list[q] = new connector(50+(screen.getWidth()-100)*Math.random(),50+(screen.getHeight()-100)*Math.random(),35);
		for(var q= 0;q<15;q++)
		{
			var n1 = parseInt(list.length*Math.random()); 
			var n2 = parseInt(list.length*Math.random()); 
			if(n1!=n2)
			list[n1].add(list[n2]);
			else
			q--;
		}
		return end;
	}
	
	function render(ctx){
		ctx.fillStyle = '#DDD';
		ctx.fillRect(0,0,ctx.width,ctx.height);
		for(var q= 0;q<list.length;q++)
			list[q].drawLines(ctx);
		for(var q= 0;q<list.length;q++)
			list[q].drawNode(ctx);
	}
	
	function update(delta){
		t += delta;
		for(var q= 0;q<list.length;q++)
			list[q].think(list);
		if(t>10000)
		{
			for(var q= 0;q<list.length;q++)
				list[q].clear();
			for(var q= 0;q<list.length;q++)
			{
				var n1 = parseInt(list.length*Math.random()); 
				var n2 = parseInt(list.length*Math.random()); 
				if(n1!=n2)
				list[n1].add(list[n2]);
				else
				q--;
			}
			t = 0;
		}	

	}
	
	function end(){
	
	}
	
	return  {
		end : end,
		img : img,
		imgLoc : imgLoc,
		refreshRate : refreshRate,
		update : update,
		render : render,
		start : start,
		setScreen : function(m){screen = m;},
		setup : function(){return setup();},
		run : function(ctx,t){return run(ctx,t);},
		toString : function(){return "Force Graph";}
	};
}

function islands(){
	var img = new Array();
	var imgLoc = [];
	var screen = null;
	
	var yellow = new Array();
	var green = new Array();
	var orange = new Array();
	for(var q = 0;q< 16;q++){
		yellow[q] = randomColor({hue: 'yellow'});
		green[q] = randomColor({hue: 'green'});
		orange[q] = randomColor({hue: 'orange'});
	}
	
	var noiceGen = new perlinNoise(1);
	var count = 0;
	var pixelSize = 1024;
	var scale = 1;
	var pos = 0;
	var list ;
	var noiseScale = 64 + 64*Math.random();
	var noiseMulti = .5 + Math.random();
	var noiseAdd = -.2 + Math.random();
	var width = 0;
	var maxSize	= 0;
	var t=0;		
	function reset() {noiceGen = new perlinNoise(1);count = 0;pixelSize = 1024;pos = 0;scale=1;noiseScale = 64 + 64*Math.random(); noiseMulti = .5 + Math.random();noiseAdd = -.2 + Math.random();}
	
	function buildList() {
		width = parseInt(screen.getWidth()/pixelSize+2);
		maxSize	= parseInt(screen.getWidth()/pixelSize+2)*parseInt(screen.getHeight()/pixelSize+2);
		var list= new Array();
		for(var x = 0;x<maxSize;x++)
			list[x] = x;
		
		for(var x = 0;x<maxSize;x++){
			var pos1 = parseInt(maxSize*Math.random());
			var temp = list[pos1];
			list[pos1] = list[x];
			list[x] = temp;
		}
		return list;
	}
	
	var count = 0;

	function drawList(ctx){
		for(var q = pos;q<pos+count;q++)
		{
		
			var test;
			var x =  parseInt(list[q]%width);
			var y =  parseInt(list[q]/width);
			var h = noiceGen.getHeight(x*noiseScale/scale-pixelSize/2/scale,y*noiseScale/scale-pixelSize/2/scale)*noiseMulti+noiseAdd;
			if(h<0)
				test ='#00435b';
			else if(h<.3)
				test ='#007BA7';
			else if(h<.39)
				test ='#00b3f4';
			else if(h<.48){
				
				test = yellow[q%16];
			}else if(h<.80){
		
				test = green[q%16];
			}else{
			
				test =orange[q%16];
			}	
				
			ctx.fillStyle = test;
			ctx.fillRect(parseInt((x)*pixelSize-pixelSize),parseInt((y)*pixelSize-pixelSize),pixelSize,pixelSize);
			
		}
		pos+=count;
		if(pos>=list.length)
		{
			if(pixelSize<5){
				reset();
				list = buildList();
			}
			else{
				pixelSize =parseInt( pixelSize/2);
				scale *= 2;
				list = buildList();
				
				pos = 0;
			}
		}
	}
	
	function setup() {
		noiceGen = new perlinNoise(1);
	}

	function refreshRate(){
		return 60;
	}
	
	function start() {
		reset();
		list = buildList();
		
		return end;
	}

	function render(ctx){
		drawList(ctx);
	}
	
	function update(delta){
		t += delta;
		if(t > 30){
			count = 4*scale;
			t = 0;
		}
	}
	
	function end(){
		
	}
	
	return  {
		end : end,
		img : img,
		imgLoc : imgLoc,
		refreshRate : refreshRate,
		update : update,
		render : render,
		start : start,
		setScreen : function(m){screen = m;},
		setup : function(){return setup();},
		run : function(ctx,t){return run(ctx,t);},
		toString : function(){return "Pixel Islands";}
	};
	
	
}



function title(){
	//Please dont judge me this is old code. -David

	/* Needed Vars for scene */
	var img = new Array();
	var imgLoc = [];
	var screen = null;
	
	var letterS = [1,0, 2,0, 3,0, 0,1, 0,2, 1,2, 2,2, 3,2, 3,3,   2,4, 1,4, 0,4];
	var letterP = [0,0, 1,0, 2,0, 0,1, 0,2, 1,2,2,2, 2,1, 0,3,0,4];
	var letterE = [0,0, 1,0, 2,0, 0,1, 0,2, 1,2, 0,3,0,4,1,4,2,4];
	var letterD = [0,0, 1,0,2,0,  0,1, 0,2, 0,3,0,4,1,4 ,2,4 ,3,1,3,2,3,3];
	
	var letterA = [0,0, 1,0, 2,0, 3,0,2,2, 0,1, 0,2, 1,2, 0,3, 0,4, 3,4,3,1,3,2,3,3];
	var letterC = [0,0, 1,0, 2,0, 0,1, 0,2, 0,3,0,4,1,4,2,4];
	var letterM = [0,0, 2,0,1,0, 0,2, 0,1, 2,1,2,2,2,3,2,4, 4,4,  0,3, 0,4 ,3,0 ,4,1 ,4,2, 4,3, 4,4, 4,4];
	var R1 = 200;
	var G1 = 200;
	var B1 = 200;
	var R2 = 138;
	var G2 = 181;
	var B2 = 255;
	var S1 = Math.random()*500+500;
	var S2 = Math.random()*500+500;
	var S3 = Math.random()*500+500;
	var t = Date.now();
	function ranA(){return Math.random()-.5;} 
		var ar = 1+ranA(), ag = 2+ranA(), ab = 2+ranA();
	
	function setup() {
		
	}

	function refreshRate(){
		return 60;
	}
	
	function start() {
	
	
		return end;
	}

	function render(ctx){
		Color2 = '#A0C8FF';	
		function c(num,a) 
				{return ('0' + Math.floor((num-(num/3))+Math.sin((t*a)*6.28/18000) *(num/3)).toString(16)).substr(-2);}
			
		function l(letter,x,y){
			
			for(var q=0;q<letter.length;q+=2)
				if(letter[q]==x&&letter[q+1]==y) return 80-50*Math.floor(Math.sin(((t*ar+t*ag+t*ab)/3-1)*6.28/18000)); 
			return 0;} 
		function a(num,x,y) 
			{	return num;
			
			}
		function m(num,x,y) 
			{return num - 4+4*Math.sin(12  +(t/S1-y*Math.cos(t/4300)+Math.floor(x*Math.tan(t/4100))))
						 - 4+4*Math.cos(12  +(t/S1-Math.floor(y*Math.tan(t/4300))+x*Math.sin(t/4100)))
						//- 4+4*Math.cos(152 +(t/S2-y*Math.cos(t/4300)+x*Math.sin(t/1200)))//;}
						- 2+Math.floor(2*Math.atan(234 +(t/15-y/x)));}
		function newColor(x,y) 
			{return '#' + c(a(m(R1,x,y),x,y),ar) + c(a(m(G1,x,y),x,y),ag) + c(a(m(B1,x,y),x,y),ab);}	
		
		pixelSize = 30;
		for(var x = 1;x<ctx.width/pixelSize+1;x++)
			for(var y = 1;y<ctx.height/pixelSize+1;y++)
			{
				ctx.fillStyle = newColor(x,y);
				ctx.fillRect(x*pixelSize-pixelSize,y*pixelSize-pixelSize,pixelSize,pixelSize);
			}
	
	}

	function update(delta){
		t += delta;

	}
	
	function end(){
	
	}
	
	return  {
		end : end,
		img : img,
		imgLoc : imgLoc,
		refreshRate : refreshRate,
		update : update,
		render : render,
		start : start,
		setScreen : function(m){screen = m;},
		setup : function(){return setup();},
		run : function(ctx,t){return run(ctx,t);},
		toString : function(){return "TV Fuzz";}
	};
}


function perlinNoise(SEED){
	var seed = SEED;
	var size = 256;
	var values = new Array();
	for(var i =0;i< size*2;i++)
		values[i] =  Math.floor(100*Math.random());
	
	function Fade(t){
		return t*t*t*(t*(t*6-15)+10);
	}
	function Lerp(t,a,b){
	 //   alert(t+" "+a+" "+b);
		return a+t*(b-a);
	}
	function Grad(hash,x,y){
	    var h = hash ;
		
		var u = x;
		if(hash%4==1||hash%4==2)
			u = -x;
		var v = y;
		if(hash%2==0)
			v = -y;
	//	alert(u+" "+v+" "+(u  + v)+ " "+hash);
		return u  + v;
	}
	function Noise(X,Y){
		X /= 10;
		Y /= 10;
		var x = Math.floor(X%(size/2));
		var y = Math.floor(Y%(size/2));
		X -= x;
        Y -= y;
		var u = Fade(X);
        var v = Fade(Y);
		var A = values[x] + y;
		var B = values[x+1] + y;
		//alert( B+" "+v+" "+y);
		
		
		return Lerp(v, Lerp(u,Grad(values[A],X,Y),
		            Grad(values[B],X-1,Y)),
					Lerp(u,Grad(values[A+1],X,Y-1),
		            Grad(values[B+1],X-1,Y-1)));
	}
	return  {
		
		getHeight : function(x,y){
		return Noise(x,y);}
	};
}



start();
