!function(){function a(){function a(){}function b(a){var b=$("#text_content");e(function(){b.find(".row1").html(a.label.title),a.label.comparison&&b.find(".row3").html(a.label.comparison.split("*").join(a.comparison_value.toFixed(1))),$(".row2 .number").text("0"),c(a),d()})}function c(a){d3.format(",d");$(".row2 .unit").text(a.unit);var b={val:parseInt($(".row2 .number").text())};TweenMax.to(b,1.5,{val:a.value,onUpdate:function(){$(".row2 .number").text(Math.ceil(b.val))}})}function d(a){TweenMax.set($("#text_content"),{x:-800,y:0,alpha:0,ease:Power2.easeOut}),TweenMax.set($("#text_container"),{x:-300,alpha:0,ease:Power2.easeOut}),TweenMax.to($("#text_container"),.5,{x:0,alpha:1,ease:Power2.easeOut}),TweenMax.to($("#text_content"),.5,{x:0,alpha:1,ease:Power2.easeOut,onComplete:function(){a&&a()}})}function e(a){TweenMax.to($("#text_content"),.5,{x:-800,ease:Power2.easeIn}),TweenMax.to($("#text_container"),.5,{x:-300,alpha:0,ease:Power2.easeOut,onComplete:function(){a&&a()}})}function f(a){TweenMax.to($("#text_content"),.5,{y:-40,ease:Power2.easeOut,delay:1,onComplete:function(){a&&a()}})}function g(a){b(a)}var h=this;h.updateValue=c,h.update=g,h.compare=f;a()}window.InfoLayer=a}(),function(){function a(){function a(){h.instrument_channel++,h.instrument_channel>APP.max_instruments&&(h.instrument_channel=1),h.transition_channel++,h.transition_channel>APP.max_transitions&&(h.transition_channel=1)}function b(){i.open()}function c(a,b){i.send({address:a,args:b}),lastMessage=_.last(a.split("/"))}function d(){console.log("new user"),c("/live/user/new",[1])}function e(){c("/live/"+h.transition_channel+"/trans/1/trigger",[1])}function f(){c("/live/"+h.transition_channel+"/trans/2/trigger",[1])}function g(a,b,d,e){c("/live/"+h.instrument_channel+"/u"+a+"/note/trigger",[10]),c("/live/"+h.instrument_channel+"/u"+a+"/"+b+"/position/x",[d]),c("/live/"+h.instrument_channel+"/u"+a+"/"+b+"/position/y",[e])}var h=this;h.transitionScene=e,h.transitionView=f,h.send=g,h.newUser=d,h.updateChannels=a,h.transition_channel=0,h.instrument_channel=0;var i=(APP.out_port,new osc.WebSocketPort({url:"ws://localhost:8080"}));b()}window.AudioController=a}(),function(){function a(){function a(){}var b=this;b.data=null;APP.BW,APP.BH;a()}window.Dataset=a}(),function(){function a(){function a(){}function b(){var a=$('<div class="graph"></div>'),b=d3.select(a.get(0)).append("svg").attr("width",h).attr("height",i).attr("version","1.1").attr("xmlns","http://www.w3.org/2000/svg").attr("viewBox","0 0 "+h+" "+i);return b}function c(a){var b=a.append("defs"),c=b.append("linearGradient").attr("id","enel-fe-gradient").attr("x1","0%").attr("x2","100%").attr("y1","0%").attr("y2","100%");return c.append("stop").attr("class","start").attr("offset","0%").attr("stop-color","#55be5a").attr("stop-opacity",1),c.append("stop").attr("class","end").attr("offset","100%").attr("stop-color","#41b9e6").attr("stop-opacity",1),b}function d(a){var d=b();c(d),d.append("g").attr("transform","translate("+h/2+","+i/2+")").append("circle").attr("cx",function(a){return 0}).attr("cy",function(a){return 0}).attr("r",function(b){return a/2}).style("fill",function(a){return"url(#enel-fe-gradient)"});return d.node()}function e(a,d){for(var e=b(),f=(c(e),.75*h),g=parseInt(d),j=d-g,k=[],l=0;g>l;l++)k.push({r:f/d});j&&k.push({r:f/d*j}),d3.packSiblings(k);var m=e.append("g").attr("transform","translate("+h/2+","+i/2+")"),n=m.selectAll("circle").data(k).enter();return n.append("circle").attr("transform",function(a){return"translate("+a.x+","+a.y+")"}).style("fill","url(#enel-fe-gradient)").attr("r",function(a){return.75*a.r}),e.node()}function f(a){var d=b(),e=(c(d),a.map(0,100,0,i));d.append("g").append("rect").attr("x",0).attr("y",h-e).attr("width",h).attr("height",e).style("fill",function(a){return"url(#enel-fe-gradient)"});return d.node()}var g=this;g.data=null,g.createCircleGraph=d,g.createFillGraph=f,g.createComparisonGraph=e;var h=APP.BW,i=APP.BH;a()}window.Graph=a}(),function(){function a(){function a(){}function b(a){a instanceof jQuery&&(a=a.get(0));var b=APP.resolution,f=d(a),g=[],h=f.data,k=1/a.width,l=1/a.width;for(i=0;i<h.length;i+=4*b)if(0!==h[i]){var m={};j=i/4,quo=Math.floor(j/a.width);var m={y:quo*l,x:(j-quo*a.width)*k};_.merge(m,c(_.slice(h,i,i+3))),g.push(m)}return e.map=g,g}function c(a){var b="rgba("+a[0]+", "+a[1]+", "+a[2]+", "+a[3]/255+")";return{c:rgb2hex(b)}}function d(a){var b=a.getContext("2d"),c=b.getImageData(0,0,APP.BW,APP.BH);return c}var e=this;e.map=null,e.scan=b,a()}window.BufferMap=a}(),function(){function a(a,b){function c(){g.graphics=new PIXI.Sprite(a),g.graphics.alpha=_.random(.5,1),g.graphics.blendMode=PIXI.BLEND_MODES.NORMAL;var b=_.random(APP.min_r,APP.max_r);g.graphics.width=b,g.graphics.height=b,g.graphics.tint=5619290}function d(a,b){g.graphics.x=a,g.graphics.y=b}function e(){return{x:g.graphics.x,y:g.graphics.y}}function f(a){APP.system.colorRange;if(a){var b=g.graphics.width.map(APP.min_r,APP.max_r,20,30),c=6;TweenMax.to(g.graphics,c,{overwrite:!0,physics2D:{velocity:b,angle:360*Math.random(),accelerationAngle:180,friction:.01},pixi:{tint:g.graphics.oc},onComplete:f,onCompleteParams:[!0]})}else g.random=!1,TweenMax.killTweensOf(g.graphics)}var g=this;g.id=b,g.graphics=null,g.pos=d,g.getPos=e,g.tweening=!1,g.randomMovement=f,g.random=!1,c()}window.Particle=a}(),function(){function a(a){function b(){m=a.views,a.live?$.get(APP.api[a.live],function(b){o=b[a.value],j.value=o,f()}):f()}function c(b){n=b/a.comparison,j.comparison_value=n}function d(a,b){switch(a){case"circle":svg=APP.graph.createCircleGraph(b);break;case"fill":svg=APP.graph.createFillGraph(b);break;case"comparison":svg=APP.graph.createComparisonGraph(b,n);break;default:svg=APP.graph.createCircleGraph(b)}return svg}function e(){if(l>=m.length)return void APP.changeScene();var b=m[l];if(_.includes(b.graph,".svg"))$.get(b.graph,function(a){var b=$(a).find("svg").first().eq(0);svgToCanvas(b,APP.buffer,APP.system.createPositionMap)});else{var c=d(b.graph,a.value);svgToCanvas(c,APP.buffer,APP.system.createPositionMap)}"comparison"===b.graph&&APP.info.compare(),APP.audio.transitionView(),setTimeout(function(){k=setTimeout(e,1e3*b.duration)},1e3*APP.transitionTime),l++}function f(){a.comparison?c(o):o=a.value,e(),APP.audio.transitionScene(),APP.info.update(j),APP.audio.updateChannels()}function g(){k&&(clearTimeout(k),k=null)}var h=this;h.create=b,h.destroy=g;var i=(APP.BW,APP.BH,{id:null,value:50,max:1e4,unit:"kWh",comparison:null,live:!1,transition:1}),a=_.defaultsDeep(a,i),j=_.cloneDeep(a),k=null,l=0,m=null,n=null,o=null;b()}window.Scene=a}(),function(){function a(a){function b(b){var c=new PIXI.Graphics;c.beginFill(16777215),c.drawCircle(50,50,i),c.endFill(),c.cacheAsBitmap=!0;for(var d=c.generateCanvasTexture(),e=[],f=0;b>f;f++){var j=new Particle(d,f);a.addChild(j.graphics),j.pos(_.random(0,g),_.random(0,h)),e.push(j)}return e}function c(a){var b=(new BufferMap).scan(a),c=_.minBy(b,function(a){return parseInt(a.c)}).c,d=_.maxBy(b,function(a){return parseInt(a.c)}).c;setTimeout(function(){f.colorRange=[c,d]},m/2*1e3),setTimeout(function(){e(b)},200)}function d(c,d,e){if(!lastEmit[c]||lastEmit[c].distance(new Victor(d,e))>4){lastEmit[c]=new Victor(d,e);var g=b(4);g.forEach(function(b){b.pos(d,e),b.graphics.width=b.graphics.height=1.5*_.random(APP.min_r,APP.max_r);var c=b.graphics.width.map(j,i,200,300);b.graphics.tint=parseInt(f.colorRange[Math.floor(Math.random()*f.colorRange.length)]),b.graphics.alpha=1;var g=b.graphics.width.map(j,i,1.5,2.5);TweenMax.to(b.graphics,g,{overwrite:!0,physics2D:{velocity:c,angle:360*Math.random(),accelerationAngle:180,friction:.1},pixi:{alpha:0,width:0,height:0},onComplete:function(){a.removeChild(b.graphics),b=null}})})}}function e(a,b){var c=a,d=c.length,e=d/APP.n,f=APP.g1;1>e&&(e=1);for(var o=0,p=0,q=0;p<f.length&&d>o;){var r=f[p],s=c[o],t=bufferToCanvas(s);t.x+=Math.ceil(_.random(-j/2,j/2)),t.y+=Math.ceil(_.random(-j/2,j/2));var u=parseInt(c[o].c),v=v=_.random(.5,1);Math.random()<.5&&(v=0),Math.random()<.02?(r.random=!0,t={x:_.random(g),y:_.random(h)}):r.random=!1,r.graphics.ox=t.x,r.graphics.oy=t.y,r.graphics.oc=u,r.graphics.used=!0;var w={pixi:{x:t.x,y:t.y,alpha:v,tint:u},delay:Math.random(),ease:n,onComplete:function(a){a.randomMovement(a.random)},onCompleteParams:[r]};b&&(w=b(w,f,c,o));var x=r.graphics.width.map(j,i,m/1.5,m);TweenMax.to(r.graphics,x,w),p++,q+=e%1,o+=Math.floor(e)+Math.floor(q),q>=1&&(q-=Math.floor(q))}var y=f.slice(p);y.forEach(function(a){a.graphics.ox=t.x,a.graphics.oy=t.y,a.graphics.oc=u,a.graphics.used=!0;var b=new Victor(a.graphics.x-g/2,a.graphics.y-h/2).normalize(),c=b.multiply(new Victor(l,l)).add(k),d=a.graphics.width.map(j,i,m/1.5,m);TweenMax.to(a.graphics,d,{x:c.x,y:c.y,delay:Math.random()})})}var f=this;f.createParticles=b,f.animateParticles=e,f.createPositionMap=c,f.emit=d;var a=APP.stage,g=APP.W,h=APP.H,i=APP.max_r,j=APP.min_r,k=new Victor(g/2,h/2),l=1.1*k.distance(new Victor(0,0)),m=APP.transitionTime,n=APP.particleEasing;f.colorRange=[],lastEmit={}}window.ParticleSystem=a}(),function(){function a(){return{enter:function(a){parseInt(a.param.dev)&&(APP.connect=!1),a.param.host&&(console.log(a.param.host),APP.host=a.param.host),APP.config()},leave:function(a){}}}window.MainState=a}(),function(){function a(){return{enter:function(a){d=new Scene(c)},leave:function(a){d.destroy()}}}function b(){APP.stateman.state(c.id,new a),APP.scenes.push(c.id)}var c={id:"scene-race-energy",label:{title:"Energy for the race",comparison:"Same as * average e-vehicles"},value:"total_energy",max:1e4,unit:"kWh",comparison:2e3,live:"energy",views:[{graph:"assets/circuit.svg",duration:5,enable:!0},{graph:"circle",duration:5,enable:!0},{graph:"comparison",duration:5,enable:!0}]},d=null;$(document).ready(b)}(),function(){function a(){return{enter:function(a){d=new Scene(c)},leave:function(a){d.destroy()}}}function b(){APP.stateman.state(c.id,new a),APP.scenes.push(c.id)}var c={id:"scene-paddock-battery",label:{title:"Energy for the race",comparison:null},value:36,max:1e4,unit:"%",comparison:!1,live:!1,views:[{graph:"assets/battery.svg",duration:3,enable:!0},{graph:"fill",duration:5,enable:!0}]},d=null;$(document).ready(b)}(),function(a){function b(){function b(){f.render(APP.stage),requestAnimationFrame(b)}var c=a(".container");c.css({width:APP.W,height:APP.H});var f=new PIXI.autoDetectRenderer(APP.W,APP.H,null,!1,!0);f.backgroundColor=0,f.view.style.display="block",f.resize(APP.W,APP.H),a(".container").append(f.view),APP.stage=new PIXI.Container,APP.system=new ParticleSystem,APP.info=new InfoLayer,APP.dataset=new Dataset,APP.graph=new Graph,APP.interakt=window.interakt,APP.audio=new AudioController,APP.g1=APP.system.createParticles(APP.n),window.keyboard.init(),e(APP.n),d(),b(),c.on("mousemove",function(a){var b={user_id:0,user_num:APP.user,point:APP.segments[APP.segment]};APP.interakt.addCursor(b,a.clientX,a.clientY)})}function c(){window.interakt.init(APP.stage,APP),APP.connect&&APP.host&&(console.log(APP.host),window.sok.init(APP.host,4649),window.skeleton.init(APP.stage),window.skeleton.toggleDebug())}function d(){APP.stateman.go(APP.scenes[APP.current],{encode:!1}),APP.current++,APP.current>APP.scenes.length-1&&(APP.current=0)}function e(b){var c=a('<canvas id="buffer"></canvas>');APP.buffer=c.get(0),APP.buffer.width=APP.BW,APP.buffer.height=APP.BH,a("body").append(c)}window.APP={},APP.scenes=[],APP.W=840,APP.H=840,APP.BW=400,APP.BH=400,APP.n=5e3,APP.min_r=5,APP.max_r=16,APP.resolution=3,APP.current=0,APP.particleEasing=Elastic.easeInOut,APP.transitionTime=8,APP.changeInterval=25,APP.max_transitions=6,APP.max_instruments=3,APP.host="127.0.0.1",APP.connect=!0,APP.api={energy:"http://backend.enelformulae.todo.to.it/zoneenergyconsumption"},APP.segments=["handLeft","handRight"],APP.segment=0,APP.user=0,APP.config=c,APP.changeScene=d,APP.stateman=new StateMan,a(document).ready(function(){b()})}(window.jQuery),function(a,b,c){a(document).ready(function(){c.stateman.state({main:new MainState}).on("notfound",function(){c.stateman.go("main")}).start({html5:!1})})}(window.jQuery,window.StateMan,window.APP);