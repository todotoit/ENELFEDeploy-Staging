function bufferToCanvas(a){return{x:a.x*(APP.W-APP.max_r),y:a.y*APP.H}}function canvasToBuffer(a){return{x:a.x/APP.W,y:a.y/APP.H}}function svgToCanvas(a,b,c){a instanceof jQuery&&(a=a.get(0));var a,d=b.getContext("2d"),e=document.createElement("div"),f=a,g=new Image,h=[],h=$(f).html().match(/#[0-9a-f]{6}|#[0-9a-f]{3}/gi);h.forEach(function(a,b){h[b]=a}),APP.system.colorBuffer=_.uniq(h),e.appendChild(f.cloneNode(!0)),a="data:image/svg+xml;base64,"+window.btoa(e.innerHTML),g.src=a,g.onload=function(){d.clearRect(0,0,b.width,b.height),d.drawImage(g,0,0),c&&c(b)}}Number.prototype.map=function(a,b,c,d){return(this-a)*(d-c)/(b-a)+c},Array.prototype.random=function(){return this[Math.floor(Math.random()*this.length)]},function(){var a=document.createElement("script");a.onload=function(){var a=new Stats;a.dom.className+="stats-meter",document.body.appendChild(a.dom),requestAnimationFrame(function b(){a.update(),requestAnimationFrame(b)})},a.src="//rawgit.com/mrdoob/stats.js/master/build/stats.min.js",document.head.appendChild(a)}(),function(a){function b(a,b){g=a,h=b,m="ws://"+g+":"+h+"/Skeleton",i=new WebSocket(m),i.onopen=function(a){console.log("socket connected"),l=setInterval(c,5e3)},i.onclose=function(a){console.log("socket close"),clearInterval(l),n=0,i=new WebSocket(m)},i.onmessage=function(a){var b=JSON.parse(a.data);k=!0,f(b),j&&j(b)},i.onerror=function(a){console.error("socket error",a)}}function c(){k||(console.log("socket is down, attempt:",n),n++),3==n&&(console.log("reconnecting...."),clearInterval(l),n=0,i=new WebSocket(m)),k=!1}function d(a){i.send(JSON.stringify(a))}function e(a){j=a}function f(a){var b=_.differenceBy(a,o,function(a){return a.id});if(!_.isEmpty(b)){var c=b[0];p.push(c.id),o.push(c);var d=window.skeleton.mapUserCoordinates(c);APP.audio.newUser(d),console.log(d),setTimeout(function(){_.pull(p,c.id)},2e3)}p.forEach(function(b){var c=_.find(a,function(a){return a.id===b});c&&!q[c.id]&&(q[c.id]=setTimeout(function(){q[c.id]=null,window.skeleton.newUser(c)},300))})}var g,h,i,j,k,l,m,n=0,o=[],p=[],q={};window.sok={},window.sok.init=b,window.sok.send=d,window.sok.onData=e}(window.jQuery),function(){function a(a,c){d=a,e=a.children,f=e.length,g=c.audio,l=c.interaktDistance||1600,h=new interakt_tween,h.init(c),i=new interakt_avoid,i.init();for(var j=0;f>j;++j){var k=e[j];k._i=j,k.target={x:k.x,y:k.y},k.forcex=0,k.forcey=0,k.ox=k.x,k.oy=k.y,k._px=k.x,k._py=k.y}window.requestAnimationFrame(b)}function b(){1===m&&i.loop(),window.requestAnimationFrame(b)}function c(a,b,c,d,n){c<APP.easterLimit&&APP.canPlayFlash&&!d&&APP.easter();for(var o=!1,p=0;f>p;++p){var q=e[p],r=q.x-b,s=q.y-c;if(l>r*r&&l>s*s&&!q.lock){o||(o=!0),q.lock=!0;var t=b-j,u=c-k,v=180*Math.atan2(u,t)/Math.PI,w=n||null;0===m&&h.stimulate(q,v,w),1===m&&i.stimulate(q,b,c)}}o&&!d&&g.send(a.user_num,a.point,b,c),1===m&&i.update(b,c),j=b,k=c}window.interakt={};var d,e,f,g,h,i,j,k,l=1600,m=0;window.interakt.init=a,window.interakt.addCursor=c}();var interakt_tween=function(){function a(a){var b=.8*Math.random();Math.random()+2;a.lock=!1,TweenMax.to(a,b+.1*a.width,{delay:0,x:a.ox,y:a.oy,ease:Back.easeInOut})}var b;this.init=function(a){console.log("init interakt_tween"),b=a},this.stimulate=function(c,d,e){c.used||(c.used=!0,c.ox=c.x,c.oy=c.y,c.oc=c.tint);var e=e||1.5,f=(.75-1.5*Math.random(),.75-1.5*Math.random(),Math.random()*e),g=c.width.map(b.min_r,b.max_r,b.minInteraktSpeed,b.maxInteraktSpeed),h=Math.random()>.5?90:-90,i=d+h;TweenMax.to(c,f,{overwrite:!0,physics2D:{velocity:g,angle:i,friction:.1},pixi:{tint:c.oc},onComplete:a,onCompleteParams:[c]})}},interakt_avoid=function(){var a=50,b={};this.init=function(){console.log("init interakt_avoid")},this.stimulate=function(a,c,d){var e=a._i;b[e]=a,a.liveReleased=!1,a.liveness=0,a.lock=!1},this.loop=function(){for(var c in b){var d=b[c],e=d.x,f=d.y,g=d.target.x,h=d.target.y,i=g-e,j=h-f,k=Math.sqrt(i*i+j*j),l=e-i/k*a/k,m=f-j/k*a/k;d.forcex=(d.forcex+(d.ox-e)/5)/9.1,d.forcey=(d.forcey+(d.oy-f)/5)/9.1,d.x=l+d.forcex,d.y=m+d.forcey}},this.update=function(a,c){for(var d in b){var e=b[d];e.liveReleased?(e.liveness++,e.liveness>50&&(b[d]=null,delete b[d],backP(e))):e.liveReleased=!0,e.target.x=a,e.target.y=c}}};!function(){function a(a){l=a,j=APP.W/2,k=APP.H/2,window.sok.onData(function(a){for(var b=0;b<a.length;++b)c(a[b],b)})}function b(){m=setInterval(function(){for(var a in o){var b=o[a];b&&(n.removeChild(b.sp1),n.removeChild(b.sp2)),o[a]=null}},1e4)}function c(a,b){var c,g=a.id;t&&e(a),f(a);for(var h=0;h<q.length;++h){var i=a[q[h]];c=d(i);var j={user_id:g,user_num:b,point:q[h]};window.interakt.addCursor(j,c.x,c.y)}}function d(a){var b=a.x*j+j,c=-1*a.z*k+k;return{x:b,y:c}}function e(a){var b=o[a.id];if(!b){f=new PIXI.Graphics,n.addChild(f),e=new PIXI.Graphics,n.addChild(e);var c=s[r];r++,r>=s.length&&(r=0),b={sp1:e,sp2:f,c:c},o[a.id]=b}var e=b.sp1,f=b.sp2;e.clear(),f.clear(),e.beginFill(b.c),f.lineStyle(3,b.c);for(var g,h=0;h<p.length;++h){var i=p[h],j=i[0];g=d(a[j]),e.drawCircle(g.x,g.y,10),f.moveTo(g.x,g.y);for(var k=0;k<i.length;++k){var l=i[k];g=d(a[l]),e.drawCircle(g.x,g.y,10),k>0&&f.lineTo(g.x,g.y)}}}function f(a){for(var b=p[2],c=0;c<b.length;++c){var e=b[c];pt=d(a[e]),APP.system.createCursor(a.id+"-"+e,pt.x,pt.y)}}function g(a){for(var b=p[1],c=[],e=0;e<b.length;++e){var f=b[e];pt=d(a[f]),c.push(pt.x)}var g=_.clamp(_.mean(c),0,APP.W);return g}function h(a){for(var b=0;b<p.length;++b)for(var c=p[b],e=0;e<c.length;++e){var f=c[e];pt=d(a[f]);var g={colors:APP.system.cursorColors,size:[6,16],vel:[30,120],scale:1,alpha:[.6,1],n:4,time:[.5,2],min_distance:3,center:!1};APP.system.emit("newUser-"+a.id+"-"+f,pt.x,pt.y,g)}}function i(){t=!t,t?(b(),l.addChild(n)):(clearInterval(m),l.removeChild(n))}var j,k,l,m,n=new PIXI.Container,o={},p=[["handLeft","elbowLeft","shoulderLeft","spineShoulder","shoulderRight","elbowRight","handRight"],["head","spineShoulder","spineBase"],["handLeft","handRight","elbowLeft","shoulderLeft","shoulderRight","elbowRight","head","spineShoulder"],["ankleLeft","kneeLeft","spineBase","kneeRight","ankleRight"]],q=["handLeft","handRight"],r=0,s=[16711680,65280,255,1044480,4080,983280],t=!1;window.skeleton={},window.skeleton.init=a,window.skeleton.toInterakt=c,window.skeleton.toggleDebug=i,window.skeleton.newUser=h,window.skeleton.mapUserCoordinates=g}(),function(){function a(){$("body").keypress(function(a){var b=a.which;switch(console.log(b),b){case 100:window.skeleton.toggleDebug();break;case 49:window.sok.send({command:"translationx",value:-.01});break;case 50:window.sok.send({command:"translationx",value:.01});break;case 51:window.sok.send({command:"translationz",value:-.01});break;case 52:window.sok.send({command:"translationz",value:.01});break;case 53:window.sok.send({command:"scale",value:-.01});break;case 54:window.sok.send({command:"scale",value:.01});break;case 55:window.sok.send({command:"timetowait",value:-1});break;case 56:window.sok.send({command:"timetowait",value:1});break;case 57:window.sok.send({command:"getcurrentsettings"});break;case 118:case 86:APP.changeView();break;case 110:case 78:APP.audio.newUser(APP.mouseX);break;case 112:case 80:APP.segment?APP.segment=0:APP.segment=1;break;case 117:case 85:APP.user++,APP.user>=3&&(APP.user=0);break;case 99:case 67:APP.enableUserCursor++,APP.enableUserCursor>3&&(APP.enableUserCursor=0)}})}window.keyboard={},window.keyboard.init=a}(),window.svgToCanvas=svgToCanvas,function(){function a(a){function b(a){var b=this;this.f=0,this.t=0,this.n=0;var c,d=a;return this.prop=function(){return c=b.t-b.f,b.n=b.n-c*d,b.t=b.n,b.n},this}var c=new b(a),d=new b(a);return this.update=function(){return{x:c.prop(),y:d.prop()}},this.x=function(){return c.prop()},this.setX=function(a){c.f=a},this.setiX=function(a){c.t=a},this.setfX=function(a){c.n=a},this.y=function(){return d.prop()},this.setY=function(a){d.f=a},this.setiY=function(a){d.t=a},this.setfY=function(a){d.n=a},this}window.Zen=a}(),function(a){function b(){n=new TimelineMax({onUpdate:d}).pause(),g=a("#brand"),g.css({width:APP.W,height:APP.H}),g.addClass("show"),h=g.find("#c1"),i=g.find("#c2"),j=g.find("#c3"),k=g.find("#c4"),l=g.find("#c5"),m=g.find("#logo"),n.from(h,1.5,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p1"),{align:"relative"}),type:"cubic"},alpha:0,rotation:-270,transformOrigin:"50%",ease:Power3.easeOut}),n.from(i,1.5,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p2"),{align:"relative"}),type:"cubic"},alpha:0,ease:Power3.easeOut},"-=1"),n.from(j,1.5,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p3"),{align:"relative"}),type:"cubic"},alpha:0,ease:Power3.easeOut},"-=1.2"),n.from(k,1.15,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p4"),{align:"relative"}),type:"cubic"},alpha:0,rotation:180,transformOrigin:"0%",ease:Power3.easeOut},"-=1"),n.from(l,1.5,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p5"),{align:"relative"}),type:"cubic"},alpha:0,ease:Power3.easeOut},"-=.6"),n.from(m,3,{alpha:0,ease:Power1.easeIn})}function c(a){n.eventCallback("onComplete",null),a&&n.eventCallback("onComplete",a),n.play()}function d(){e(h,"c1"),e(i,"c2"),e(j,"c3"),e(k,"c4"),e(l,"c5")}function e(a,b){if(a){var c=a[0]._gsTransform.xOrigin+a[0]._gsTransform.x+6,d=a[0]._gsTransform.yOrigin+a[0]._gsTransform.y+6;window.interakt.addCursor(b,c,d,!0)}}function f(){n.reverse(0)}window.brand={};var g,h,i,j,k,l,m,n=null;a(document).ready(function(){b()}),window.brand.show=c,window.brand.hide=f}(window.jQuery);