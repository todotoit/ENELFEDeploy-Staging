!function(){function a(){function a(){}function b(a){var b=$("#text_content");f(function(){b.find(".row1").html(a.label.title),a.label.comparison&&b.find(".row3").html(a.label.comparison.split("*").join(a.comparison_value.toFixed(1))),$(".row2 .number").text("0"),c(a),d()})}function c(a){d3.format(",d");$(".row2 .unit").text(a.unit);var b={val:parseInt($(".row2 .number").text())};TweenMax.to(b,1.5,{val:a.value,onUpdate:function(){$(".row2 .number").text(Math.ceil(b.val))}})}function d(a){TweenMax.set($(".row1"),{opacity:1,css:{"margin-bottom":"60px"}}),TweenMax.set($("#text_content"),{x:-800,y:35,opacity:0}),TweenMax.set($("#text_container"),{x:880,opacity:0}),TweenMax.to($("#text_container"),.6,{opacity:1,delay:1}),TweenMax.to($("#text_container"),1,{x:0,delay:2,ease:Power3.easeOut,onStart:APP.audio.cursorIn,onUpdate:e}),TweenMax.to($("#text_content"),1,{x:10,delay:2.8,opacity:1,ease:Power3.easeOut,onComplete:function(){a&&a()}})}function e(){var a=$("#text_container"),b=a[0]._gsTransform.x+6,c=a.offset().top+a.height()/2;window.interakt.addCursor("info-cursor",b,c,!0,APP.transitionTime/2)}function f(a,b){TweenMax.to($("#text_content"),.75,{x:-800,ease:Power3.easeIn}),TweenMax.to($("#text_container"),1,{x:880,opacity:0,ease:Power3.easeIn,delay:.3,onStart:APP.audio.cursorOut,onUpdate:function(){b||e()},onComplete:function(){a&&a()}})}function g(a){TweenMax.to($(".row1"),.75,{css:{"margin-bottom":"30px"},delay:3}),TweenMax.to($("#text_content"),.75,{y:0,ease:Power3.easeOut,delay:3,onStart:APP.audio.valueIn,onComplete:function(){a&&a()}})}function h(a){TweenMax.to($(".row1"),.75,{css:{"margin-bottom":"38px"},opacity:0,ease:Power3.easeOut,delay:1}),TweenMax.to($("#text_content"),.75,{y:-65,ease:Power3.easeOut,delay:1,onStart:APP.audio.comparisonIn,onComplete:function(){a&&a()}})}function i(a){b(a)}var j=this;j.updateValue=c,j.update=i,j.compare=h,j.valueIn=g,j.labelOut=f,j.labelIn=d;a()}window.InfoLayer=a}(),function(){function a(){function a(a){m.instrument_channel++,m.instrument_channel>APP.max_instruments&&(m.instrument_channel=1),m.transition_channel=a}function b(){n.open()}function c(a,b){n.send({address:a,args:b}),lastMessage=_.last(a.split("/"))}function d(){c("/live/cursor/in",[1])}function e(){c("/live/cursor/out",[1])}function f(){c("/live/value/in",[1])}function g(){c("/live/comparison/in",[1])}function h(a){c("/live/user/new",[a])}function i(a){switch(a){case 0:c("/live/7/trans/1/trigger",[1]);break;case 1:c("/live/7/trans/2/trigger",[1]);break;case 2:c("/live/7/trans/3/trigger",[1]);break;case 3:c("/live/7/trans/4/trigger",[1])}}function j(){c("/live/"+m.transition_channel+"/trans/1/trigger",[1])}function k(){c("/live/"+m.transition_channel+"/trans/2/trigger",[1])}function l(a,b,d,e){APP.canPlayFlash&&(c("/live/"+m.instrument_channel+"/u"+a+"/note/trigger",[10]),c("/live/"+m.instrument_channel+"/u"+a+"/"+b+"/position/x",[d]),c("/live/"+m.instrument_channel+"/u"+a+"/"+b+"/position/y",[e]))}var m=this;m.transitionScene=j,m.transitionView=k,m.send=l,m.newUser=h,m.updateChannels=a,m.transition_channel=0,m.instrument_channel=0,m.flash=i,m.cursorIn=d,m.cursorOut=e,m.valueIn=f,m.comparisonIn=g;var n=(APP.out_port,new osc.WebSocketPort({url:"ws://localhost:8080"}));b()}window.AudioController=a}(),function(){function a(){function a(){}function b(a,b,d){var f=null;_.isArray(a)?(url=a[0],f=a[1]):url=a,e[url]?(e[url].callback=d,e[url].value=b,e[url].getData()):(e[url]=new c(url,f),e[url].value=b,e[url].initCallback=d)}function c(a,b){function c(){e(a,function(a){_.isFunction(g.value)?g.data=g.value(a):g.data=a[g.value],g.initCallback&&g.initCallback(g.data)}),h=setInterval(d,1e3*APP.APIUpdateTime)}function d(){e(a,function(a){j=parseInt(a[g.value]),i={value:parseInt(g.data)},TweenMax.to(i,APP.APIUpdateTime,{value:j,onUpdate:function(){g.data=i.value}})})}function e(a,c){$.ajax({url:a,type:"GET",success:c,beforeSend:function(a){b&&a.setRequestHeader(b[0],b[1])}})}function f(){g.callback&&g.callback(g.data)}var g=this,a=a;g.data=null,g.value=null;var h=null,i={},j=0;g.initCallback=null,g.getData=f,c()}var d=this;d.data=null,d.getStream=b;var e={};APP.BW,APP.BH;a()}window.Dataset=a}(),function(){function a(){function a(){}function b(){var a=$('<div class="graph"></div>'),b=d3.select(a.get(0)).append("svg").attr("width",i).attr("height",j).attr("version","1.1").attr("xmlns","http://www.w3.org/2000/svg").attr("viewBox","0 0 "+i+" "+j);return b}function c(a){var b=a.append("defs"),c=b.append("linearGradient").attr("id","enel-fe-gradient").attr("x1",_.random(0,100)+"%").attr("x2",_.random(0,100)+"%").attr("y1","0%").attr("y2","100%");return c.append("stop").attr("class","start").attr("offset","0%").attr("stop-color",PIXI.utils.hex2string(_.last(APP.system.colorRange)).split("0x").join("#")).attr("stop-opacity",1),c.append("stop").attr("class","end").attr("offset","100%").attr("stop-color",PIXI.utils.hex2string(APP.system.colorRange[0]).split("0x").join("#")).attr("stop-opacity",1),b}function d(a,d){d&&(a=parseFloat(a).map(0,d,0,.65*i));var e=b();c(e),e.append("g").attr("transform","translate("+i/2+","+j/2+")").append("circle").attr("cx",function(a){return 0}).attr("cy",function(a){return 0}).attr("r",function(b){return a/2}).style("fill",function(a){return"url(#enel-fe-gradient)"});return{svg:e.node(),center:[g({x:i/2,y:j/2})]}}function e(a,d,e){center=[];for(var f=b(),h=(c(f),parseInt(d)),k=d-h,l=[],m=0;h>m;m++)l.push({r:i/d});k&&l.push({r:i/d*k}),d3.packSiblings(l);var n=f.append("g").attr("transform","translate("+i/2+","+j/2+")"),o=n.selectAll("circle").data(l).enter();return o.append("circle").attr("transform",function(a){return"translate("+a.x+","+a.y+")"}).style("fill","url(#enel-fe-gradient)").attr("r",function(a){return.75*_.clamp(a.r/1.5,0,.75*i)}),k?center=[g({x:i/2+_.last(l).x,y:j/2+_.last(l).y})]:n.selectAll("circle").each(function(a,b){center.push(g({x:i/2+a.x,y:j/2+a.y}))}),{svg:f.node(),center:center}}function f(a){var d=b(),e=(c(d),a.map(0,100,0,j));d.append("g").append("rect").attr("x",0).attr("y",j-e).attr("width",i).attr("height",e).style("fill",function(a){return"url(#enel-fe-gradient)"});return{svg:d.node(),center:[g({x:i/2,y:e/2})]}}function g(a){var b=1/i,c=1/j;return{x:a.x*b,y:a.y*c}}var h=this;h.data=null,h.createCircleGraph=d,h.createFillGraph=f,h.createComparisonGraph=e;var i=APP.BW,j=APP.BH;a()}window.Graph=a}(),function(){function a(){function a(){}function b(a){a instanceof jQuery&&(a=a.get(0));var b=APP.resolution,f=d(a),g=[],h=f.data,k=1/a.width,l=1/a.width;for(i=0;i<h.length;i+=4*b)if(0!==h[i]){var m={};j=i/4,quo=Math.floor(j/a.width);var m={y:quo*l,x:(j-quo*a.width)*k};_.merge(m,c(_.slice(h,i,i+3))),g.push(m)}return e.map=g,g}function c(a){return{c:PIXI.utils.rgb2hex(a.map(function(a){return a/255}))}}function d(a){var b=a.getContext("2d"),c=b.getImageData(0,0,APP.BW,APP.BH);return c}var e=this;e.map=null,e.scan=b,a()}window.BufferMap=a}(),function(){function a(a,b){function c(){l.graphics=new PIXI.Sprite(a);var b=_.random(APP.min_r,APP.max_r);l.graphics.width=b,l.graphics.height=b,l.graphics.alpha=b.map(APP.min_r,APP.max_r,.2,1),l.graphics.tint=5619290}function d(a,b){l.graphics.x=a,l.graphics.y=b}function e(a){l.graphics.width=l.graphics.height=a}function f(a,b,c){l.graphics.oc=a,TweenMax.to(l.graphics,b,{pixi:{tint:a},delay:c})}function g(){return{x:l.graphics.x,y:l.graphics.y}}function h(){l.graphics.lock&&(l.graphics.lock=!1)}function i(a,b,c){a&&(l.graphics.ox=a),b&&(l.graphics.oy=b),c&&(l.graphics.oc=c),l.graphics.used=!0}function j(a){APP.system.colorRange;if(a){var b=l.graphics.width.map(APP.min_r,APP.max_r,20,30),c=l.graphics.width.map(APP.min_r,APP.max_r,1,10);TweenMax.to(l.graphics,c,{overwrite:!0,physics2D:{velocity:b,angle:360*Math.random(),accelerationAngle:180,friction:.01},onComplete:j,onCompleteParams:[!0]})}else l.random=!1,TweenMax.killTweensOf(l.graphics)}function k(a,b){var c=_.random(.5,1),d=parseInt(APP.system.colorRange.random()),e=Math.random(),g=_.random(APP.system.min_r,APP.system.max_r),h={pixi:{x:a,y:b,alpha:c,width:g,height:g},delay:e,ease:APP.particleEasing},j=g.map(APP.system.min_r,APP.system.max_r,APP.transitionTime/1.5,APP.transitionTime);f(d,j,e),i(a,b),TweenMax.to(l.graphics,j,h)}var l=this;l.id=b,l.graphics=null,l.pos=d,l.size=e,l.getPos=g,l.tweening=!1,l.randomMovement=j,l.random=!1,l.unlock=h,l.color=f,l.origin=i,l.go=k,c()}window.Particle=a}(),function(){function a(a){function b(){APP.currentScene=j,p=a.views,a.live?APP.data.getStream(APP.api[a.live],a.value,function(a){s=a,m.value=s,f(),u=setTimeout(g,1e3*APP.liveSceneUpdateTime)}):(s=a.value,f())}function c(b){r=b/a.comparison,m.comparison_value=r}function d(a,b){var c=null;switch(a){case"circle":c=APP.graph.createCircleGraph(b,t);break;case"fill":c=APP.graph.createFillGraph(b);break;case"comparison":c=APP.graph.createComparisonGraph(b,r,t);break;default:c=APP.graph.createCircleGraph(b)}return c}function e(){if(o>=p.length)return void APP.changeScene();var a=p[o];if(q=a,a.particle_size?(APP.system.min_r=a.particle_size[0],APP.system.max_r=a.particle_size[1]):(APP.system.min_r=APP.min_r,APP.system.max_r=APP.max_r),_.includes(a.graph,".svg"))$.get(a.graph,function(a){var b=$(a).find("svg").first().eq(0);svgToCanvas(b,APP.buffer,APP.system.createPositionMap)});else{var b=d(a.graph,s),c=b.svg;k=b.center,svgToCanvas(c,APP.buffer,APP.system.createPositionMap)}"comparison"===a.graph&&APP.info.compare(),a.value&&APP.info.valueIn(),o>0&&APP.audio.transitionView(),setTimeout(function(){n=setTimeout(e,1e3*a.duration)},1e3*APP.transitionTime),o++}function f(){a.comparison&&c(s),t=a.max||null,e(),APP.audio.updateChannels(a.transition),APP.audio.transitionScene(),APP.info.update(m),a.cursor_color&&(APP.system.cursorColors=APP.system.setColorRange(a.cursor_color))}function g(){APP.data.getStream(APP.api[a.live],a.value,function(a){var b=a-s;s=a,m.value=s,APP.info.updateValue(m),q&&(q.value||"comparison"===q.graph)&&h(b),u=setTimeout(g,1e3*APP.liveSceneUpdateTime)})}function h(a){var b=parseInt(_.clamp(Math.abs(a),0,20)),c=APP.system.createParticles(b,parseInt(APP.g1.length/2));APP.g1=APP.g1.concat(c),c.forEach(function(b){if(a>0){if(Math.random()<.5)var c={x:_.random(0,APP.W),y:-50};else var c={x:_.random(0,APP.W),y:APP.H+50};var d=bufferToCanvas(k.random())}else{var c=bufferToCanvas(k.random());if(Math.random()<.5)var d={x:_.random(0,APP.W),y:-50};else var d={x:_.random(0,APP.W),y:APP.H+50}}b.pos(c.x,c.y),b.go(d.x,d.y),b["delete"]=!0})}function i(){n&&(clearTimeout(n),n=null),u&&(clearTimeout(u),u=null)}var j=this;j.create=b,j.destroy=i;var k,l=(APP.BW,APP.BH,{id:null,value:50,max:1e4,unit:"kWh",comparison:null,live:!1,transition:1}),a=_.defaultsDeep(a,l),m=_.cloneDeep(a),n=null,o=0,p=null,q=null,r=null,s=null,t=null,u=null;b()}window.Scene=a}(),function(){function a(a){function b(b,c){var d=new PIXI.Graphics;d.beginFill(16777215),d.drawCircle(50,50,k.max_r),d.endFill(),d.cacheAsBitmap=!0;for(var e=d.generateCanvasTexture(),f=[],g=0;b>g;g++){var h=new Particle(e,g);c?a.addChildAt(h.graphics,c):a.addChild(h.graphics),h.pos(_.random(0,m),_.random(0,n)),f.push(h)}return f}function c(a){var b=(new BufferMap).scan(a);k.colorRange=i(k.colorBuffer),setTimeout(function(){g(b,null,!0)},200)}function d(c,d,e,f){var g={colors:k.colorRange,size:[k.min_r,k.max_r],vel:[30,150],scale:1.35,alpha:[1,1],n:1,time:[.5,2],min_distance:4,center:!0};if(f)var h=_.defaultsDeep(f,g);else var h=g;if(!lastEmit[c]||lastEmit[c].distance(new Victor(d,e))>h.min_distance){lastEmit[c]=new Victor(d,e);var i=b(h.n);i.forEach(function(b){b.pos(d,e),b.graphics.width=b.graphics.height=_.random(h.size[0],h.size[1])*h.scale;var c=b.graphics.width.map(h.size[0],h.size[1],h.vel[0],h.vel[1]);b.graphics.tint=h.colors.random(),b.graphics.alpha=_.random(h.alpha[0],h.alpha[1]);var f=b.graphics.width.map(h.size[0],h.size[1],h.time[0],h.time[1]);TweenMax.to(b.graphics,f,{overwrite:!0,physics2D:{velocity:c,angle:360*Math.random(),accelerationAngle:180,friction:.05},pixi:{alpha:0},onComplete:function(){a.removeChild(b.graphics),b.graphics.destroy(),b=null}})})}}function e(b,c,e){var g=_.includes(b,"hand");if(APP.enableUserCursor){var h=22;if(t[b]){if(t[b].x=c-t[b].width/2,t[b].y=e-t[b].height/2,t[b].canFlash){var i={colors:k.cursorColors,size:[6,16],vel:[30,120],scale:1,alpha:[.4,.8],n:1,time:[.5,2],min_distance:3,center:!1};t[b].tint=k.cursorColors[1],APP.enableUserCursor>1&&g&&(i.n=2,d(b,c,e,i)),APP.enableUserCursor>2&&d(b,c,e,i),t[b].canFlash=!1,setTimeout(function(){t[b]&&(t[b].canFlash=!0)},2e3)}t[b].canFlash=!0,clearTimeout(t[b].removeTimeout),t[b].removeTimeout=null}else t[b]=new PIXI.Sprite(u),t[b].tint=k.cursorColors[1],t[b].width=h,t[b].height=h,t[b].x=c-h/2,t[b].y=e-h/2,t[b].alpha=.8,g&&(t[b].alpha=.5,t[b].width=4*h,t[b].height=4*h),a.addChild(t[b]);t[b].removeTimeout=setTimeout(function(){f(b)},500)}}function f(b){TweenMax.to(t[b],.5,{pixi:{alpha:0},onComplete:function(){a.removeChild(t[b]),t[b].destroy(),t[b]=null}})}function g(a,b,c){l=a;var d=l.length,e=d/APP.n;if(c)var f=_.shuffle(APP.g1);else var f=APP.g1;1>e&&(e=1);for(var g=0,i=0,j=0;i<f.length&&d>g;){var o=f[i];o.graphics.visible=!0;var p=l[g],q=bufferToCanvas(p);q.x+=Math.ceil(_.random(-k.min_r/2,k.min_r/2)),q.y+=Math.ceil(_.random(-k.min_r/2,k.min_r/2));var s=l[g].c;if(Math.random()<.02?(o.random=!0,o.graphics.lock=!0,q={x:_.random(m),y:_.random(n)}):(o.random=!1,o.unlock()),b)var t=b;else var t=APP.transitionTime;var u=_.random(k.min_r,k.max_r),v=v=u.map(k.min_r,k.max_r,.2,1),w=Math.random(),x={pixi:{x:q.x,y:q.y,alpha:v,width:u,height:u},delay:w,ease:r,onComplete:function(a){a.randomMovement(a.random)},onCompleteParams:[o]},y=u.map(k.min_r,k.max_r,t/1.5,t);o.color(s,y,w),o.origin(q.x,q.y),TweenMax.to(o.graphics,y,x),i++,j+=e%1,g+=Math.floor(e)+Math.floor(j),j>=1&&(j-=Math.floor(j))}var z=f.slice(i);h(z)}function h(b,c){var d=new TimelineMax({onComplete:c});b.forEach(function(b){var c=_.random(k.min_r,k.max_r),e=new Victor(b.graphics.x-m/2,b.graphics.y-n/2).normalize(),f=e.multiply(new Victor(p,p)).add(o),g=c.map(k.min_r,k.max_r,q/2,q/1.5),h=k.colorRange.random();b.origin(f.x,f.y,b.graphics.tint),b.graphics.lock=!0,d.add(TweenMax.to(b.graphics,g,{overwrite:!0,pixi:{x:f.x,y:f.y,tint:h},delay:Math.random(),onComplete:function(b){b.graphics.visible=!1,b["delete"]&&(a.removeChild(b.graphics),b.graphics.destroy(),_.pull(APP.g1,b))},onCompleteParams:[b]}),0)})}function i(a){return chroma.scale(a).colors(10).map(function(a){return parseInt(a.split("#").join("0x"))})}function j(){function a(a,b){a.graphics.visible=!0,TweenMax.killTweensOf(a.graphics);var c={x:b.map(0,APP.g1.length,-200,m+200)+_.random(-k.max_r,k.max_r),y:_.random(0,n)};k.colorRange=i(s[1]);var e=k.colorRange.random();a.width=a.height=1.5*k.max_r,a.origin(c.x,c.y),a.unlock();var f=_.random(k.min_r,k.max_r),g=g=f.map(k.min_r,k.max_r,.2,1),h=f.map(k.min_r,k.max_r,q/1.5,q),j=Math.random()+d(b);a.color(e,h,j);var l={pixi:{x:c.x,y:c.y,alpha:g},delay:j,ease:Elastic.easeOut.config(2.5,.5)};a.graphics.anchor.set(1.75),a.graphics.rotation=0,v.add(TweenMax.to(a.graphics,h,l),0)}function b(a,b){k.colorRange=i(s.random());var c=new TimelineMax({onComplete:b});a.forEach(function(a,b){var d=({x:a.graphics.x+60},1.2*k.max_r,k.colorRange.random()),e=4,f=5e-4*b;a.color(d,e,f);var g={pixi:{rotation:360,tint:d},delay:f,yoyo:!0,ease:Back.easeOut};a.unlock(),c.add(TweenMax.to(a.graphics,e,g),0)})}APP.canPlayFlash=!1;var c=APP.g1;APP.info.labelOut(null,!0);var d=d3.scalePow().domain([0,c.length]).range([0,5]).exponent(.25);APP.audio.flash(0),h(APP.g1,function(){APP.audio.flash(1),v=new TimelineMax({onComplete:function(){APP.audio.flash(2),brand.show(function(){APP.audio.flash(3),b(c,function(){APP.canPlayFlash=!0,APP.changeScene()}),setTimeout(brand.hide,2e3)})}}),c.forEach(a)})}var k=this;k.createParticles=b,k.animateParticles=g,k.createPositionMap=c,k.emit=d,k.flash=j,k.setColorRange=i,k.createCursor=e;var l,a=APP.stage,m=APP.W,n=APP.H;k.max_r=APP.max_r,k.min_r=APP.min_r;var o=new Victor(m/2,n/2),p=1.1*o.distance(new Victor(0,0)),q=APP.transitionTime,r=APP.particleEasing;k.colorRange=[5619290,5619290],k.colorBuffer=[],k.cursorColors=[16777215,16777215];var s=[[4307430,16729735],[5619290,4307430],[15543588,15752746]],t={};lastEmit={};var u=PIXI.Texture.fromImage("assets/hand-cursor.svg");u.cacheAsBitmap=!0;var v}window.ParticleSystem=a}(),function(){function a(){return{enter:function(a){parseInt(a.param.dev)&&(APP.connect=!1),a.param.host&&(console.log(a.param.host),APP.host=a.param.host),APP.config()},leave:function(a){}}}window.MainState=a}(),function(){function a(){return{enter:function(a){d=new Scene(c)},leave:function(a){d.destroy()}}}function b(){APP.stateman.state(c.id,new a),APP.scenes.push(c.id)}var c={id:"scene-race-energy",label:{title:"Total energy consumption",comparison:"* households for 1 month"},value:"total_energy",max:9e3,unit:"kWh",comparison:975,live:"energy_be",transition:3,cursor_color:[16729735,16729735],views:[{graph:"assets/circuit.svg",duration:15,enable:!0,particle_size:[5,13]},{graph:"circle",duration:15,enable:!0,value:!0},{graph:"comparison",duration:15,enable:!0}]},d=null;$(document).ready(b)}(),function(){function a(){return{enter:function(a){d=new Scene(c)},leave:function(a){d.destroy()}}}function b(){APP.stateman.state(c.id,new a),APP.scenes.push(c.id)}var c={id:"scene-meter",label:{title:"Energy monitoring",comparison:null},value:30,max:1e4,unit:"Smart meters",comparison:!1,live:!1,transition:5,cursor_color:[4307430,4307430],views:[{graph:"assets/meter.svg",duration:15,enable:!0,particle_size:[5,13]},{graph:"assets/meter_data.svg",duration:15,enable:!0,particle_size:[5,13],value:!0}]},d=null;$(document).ready(b)}(),function(){function a(){return{enter:function(a){d=new Scene(c)},leave:function(a){d.destroy()}}}function b(){APP.stateman.state(c.id,new a),APP.scenes.push(c.id)}var c={id:"scene-paddock-battery",label:{title:"Energy in <strong>Paddock battery</strong>",comparison:null},value:function(a){return a.state.stateOfCharge},max:1e4,unit:"%",comparison:!1,live:"battery",transition:1,cursor_color:[16729735,16729735],views:[{graph:"assets/battery.svg",duration:15,enable:!0,particle_size:[5,13]},{graph:"fill",duration:15,enable:!0,value:!0}]},d=null;$(document).ready(b)}(),function(){function a(){return{enter:function(a){d=new Scene(c)},leave:function(a){d.destroy()}}}function b(){APP.stateman.state(c.id,new a),APP.scenes.push(c.id)}var c={id:"scene-car-energy",label:{title:"Energy for <strong>NYC race</strong>",comparison:"= * average e-cars batteries"},value:50,max:56,unit:"kWh",comparison:21,live:!1,transition:2,cursor_color:[16729735,16729735],views:[{graph:"assets/energycar.svg",duration:15,enable:!0,particle_size:[5,13]},{graph:"circle",duration:15,enable:!0,value:!0},{graph:"comparison",duration:15,enable:!0}]},d=null;$(document).ready(b)}(),function(){function a(){return{enter:function(a){d=new Scene(c)},leave:function(a){d.destroy()}}}function b(){APP.stateman.state(c.id,new a),APP.scenes.push(c.id)}var c={id:"scene-solar",label:{title:"Energy from <strong>Solar panels</strong>",comparison:null},value:function(a){return a.energy},max:5,unit:"kWh",comparison:!1,live:"smart_kit",transition:4,cursor_color:[4307430,4307430],views:[{graph:"assets/solar.svg",duration:15,enable:!0,particle_size:[5,13]},{graph:"circle",duration:15,enable:!0,value:!0}]},d=null;$(document).ready(b)}(),function(){function a(){return{enter:function(a){d=new Scene(c)},leave:function(a){d.destroy()}}}function b(){APP.stateman.state(c.id,new a),APP.scenes.push(c.id)}var c={id:"scene-paddock-demand",label:{title:"<strong>Paddock</strong> Energy demand",comparison:null},value:function(a){return a.zones.find(function(a){return"Paddock"===a.name}).energy},max:9e3,unit:"kWh",comparison:975,live:"energy_be",transition:3,cursor_color:[16729735,16729735],views:[{graph:"assets/paddock_demand.svg",duration:15,enable:!0,particle_size:[5,13]},{graph:"circle",duration:15,enable:!0,value:!0}]},d=null;$(document).ready(b)}(),function(a){function b(){function b(){e.render(APP.stage),requestAnimationFrame(b)}var c=a(".container");c.css({width:APP.W,height:APP.H});var e=new PIXI.WebGLRenderer({width:APP.W,height:APP.H,view:null,transparent:!1,autoResize:!1,antialias:!1,roundPixels:!0});e.backgroundColor=0,e.view.style.display="block",e.resize(APP.W,APP.H),a(".container").append(e.view),APP.stage=new PIXI.Container,APP.system=new ParticleSystem,APP.info=new InfoLayer,APP.data=new Dataset,APP.graph=new Graph,APP.interakt=window.interakt,APP.audio=new AudioController,APP.g1=APP.system.createParticles(APP.n),window.keyboard.init(),f(APP.n),d(),b(),c.on("mousemove",function(a){var b={user_id:0,user_num:APP.user,point:APP.segments[APP.segment]};APP.mouseX=a.clientX,APP.interakt.addCursor(b,a.clientX,a.clientY)})}function c(){window.interakt.init(APP.stage,APP),APP.connect&&APP.host&&(window.sok.init(APP.host,4649),window.skeleton.init(APP.stage))}function d(){return APP.flashCounter++,APP.flashCounter>APP.flashTime?(APP.flashCounter=0,void APP.system.flash()):(APP.currentScene&&APP.currentScene.destroy(),APP.stateman.go(APP.scenes[APP.current],{encode:!1}),APP.current++,void(APP.current>APP.scenes.length-1&&(APP.current=0)))}function e(){APP.currentScene.destroy(),APP.flashCounter=0,APP.system.flash()}function f(b){var c=a('<canvas id="buffer"></canvas>');APP.buffer=c.get(0),APP.buffer.width=APP.BW,APP.buffer.height=APP.BH,a("body").append(c)}window.APP={},APP.W=840,APP.H=840,APP.BW=350,APP.BH=350,APP.resolution=3,APP.transitionTime=14,APP.flashTime=6,APP.n=4500,APP.min_r=5,APP.max_r=12,APP.particleEasing=Elastic.easeInOut,APP.easterLimit=-1,APP.APIUpdateTime=10,APP.liveSceneUpdateTime=2,APP.interaktDistance=800,APP.minInteraktSpeed=100,APP.maxInteraktSpeed=300,APP.enableUserCursor=1,APP.scenes=[],APP.current=0,APP.max_transitions=6,APP.max_instruments=3,APP.host="127.0.0.1",APP.api={energy:"https://wow-api-test-l0ovhd7z3xp1.runkit.sh/",energy_be:"http://backend.enelformulae.todo.to.it/zoneenergyconsumption",smart_kit:"http://backend.enelformulae.todo.to.it/meter/Smart_Kit_BE_001",battery:"https://enelfe-battery-rh8yd73umjtw.runkit.sh/"},APP.connect=!0,APP.segments=["handLeft","handRight"],APP.segment=0,APP.user=0,APP.config=c,APP.changeScene=d,APP.stateman=new StateMan,APP.flashCounter=0,APP.easter=e,APP.canPlayFlash=!0,a(document).ready(function(){b()})}(window.jQuery),function(a,b,c){a(document).ready(function(){c.stateman.state({main:new MainState}).on("notfound",function(){c.stateman.go("main")}).start({html5:!1})})}(window.jQuery,window.StateMan,window.APP);