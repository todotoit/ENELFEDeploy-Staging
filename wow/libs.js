function rgb2hex(a){return a=a.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i),a&&4===a.length?"0x"+("0"+parseInt(a[1],10).toString(16)).slice(-2)+("0"+parseInt(a[2],10).toString(16)).slice(-2)+("0"+parseInt(a[3],10).toString(16)).slice(-2):""}function bufferToCanvas(a){return{x:a.x*(APP.W-APP.max_r),y:a.y*APP.H}}function canvasToBuffer(a){return{x:a.x/APP.W,y:a.y/APP.H}}function svgToCanvas(a,b,c){a instanceof jQuery&&(a=a.get(0));var a,d=b.getContext("2d"),e=document.createElement("div"),f=a,g=new Image,h=[],h=$(f).html().match(/#[0-9a-f]{6}|#[0-9a-f]{3}/gi);h.forEach(function(a,b){h[b]=a}),APP.system.colorBuffer=_.uniq(h),e.appendChild(f.cloneNode(!0)),a="data:image/svg+xml;base64,"+window.btoa(e.innerHTML),g.src=a,g.onload=function(){d.clearRect(0,0,b.width,b.height),d.drawImage(g,0,0),c&&c(b)}}Number.prototype.map=function(a,b,c,d){return(this-a)*(d-c)/(b-a)+c},Array.prototype.random=function(){return this[Math.floor(Math.random()*this.length)]},function(){var a=document.createElement("script");a.onload=function(){var a=new Stats;a.dom.className+="stats-meter",document.body.appendChild(a.dom),requestAnimationFrame(function b(){a.update(),requestAnimationFrame(b)})},a.src="//rawgit.com/mrdoob/stats.js/master/build/stats.min.js",document.head.appendChild(a)}(),function(a){function b(a,b){g=a,h=b,m="ws://"+g+":"+h+"/Skeleton",i=new WebSocket(m),i.onopen=function(a){console.log("socket connected"),l=setInterval(c,5e3)},i.onclose=function(a){console.log("socket close"),clearInterval(l),n=0,i=new WebSocket(m)},i.onmessage=function(a){var b=JSON.parse(a.data);k=!0,f(b),j&&j(b)},i.onerror=function(a){console.error("socket error",a)}}function c(){k||(console.log("socket is down, attempt:",n),n++),3==n&&(console.log("reconnecting...."),clearInterval(l),n=0,i=new WebSocket(m)),k=!1}function d(a){i.send(JSON.stringify(a))}function e(a){j=a}function f(a){var b=_.differenceBy(a,o,function(a){return a.id});if(!_.isEmpty(b)){var c=b[0];p.push(c.id),o.push(c),APP.audio.newUser(),setTimeout(function(){_.pull(p,c.id)},2e3)}p.forEach(function(b){var c=_.find(a,function(a){return a.id===b});c&&window.skeleton.newUser(c)})}var g,h,i,j,k,l,m,n=0,o=[],p=[];window.sok={},window.sok.init=b,window.sok.send=d,window.sok.onData=e}(window.jQuery),function(){function a(a,c){d=a,e=a.children,f=e.length,g=c.audio,h=new interakt_tween,h.init(c),i=new interakt_avoid,i.init();for(var j=0;f>j;++j){var k=e[j];k._i=j,k.target={x:k.x,y:k.y},k.forcex=0,k.forcey=0,k.ox=k.x,k.oy=k.y,k._px=k.x,k._py=k.y}window.requestAnimationFrame(b)}function b(){1===m&&i.loop(),window.requestAnimationFrame(b)}function c(a,b,c,d){c<APP.easterLimit&&APP.canPlayFlash&&!d&&APP.easter();var n=!1;d||APP.system.emit(a.user_id+"-"+a.point,b,c);for(var o=0;f>o;++o){var p=e[o],q=p.x-b,r=p.y-c;if(l>q*q&&l>r*r&&!p.lock){n||(n=!0),p.lock=!0;var s=b-j,t=c-k,u=180*Math.atan2(t,s)/Math.PI;0===m&&h.stimulate(p,u),1===m&&i.stimulate(p,b,c)}}n&&!d&&g.send(a.user_num,a.point,b,c),1===m&&i.update(b,c),j=b,k=c}window.interakt={};var d,e,f,g,h,i,j,k,l=800,m=0;window.interakt.init=a,window.interakt.addCursor=c}();var interakt_tween=function(){function a(a){var b=Math.random()+2;Math.random()+2;a.lock=!1,TweenMax.to(a,b+.1*a.width,{delay:0,x:a.ox,y:a.oy,ease:Expo.easeInOut})}var b;this.init=function(a){console.log("init interakt_tween"),b=a},this.stimulate=function(c,d){c.used||(c.used=!0,c.ox=c.x,c.oy=c.y,c.oc=c.tint);var e=(.75-1.5*Math.random(),.75-1.5*Math.random(),1.5*Math.random());TweenMax.set(c,{tint:parseInt(16729735)});var f=c.width.map(b.min_r,b.max_r,200,300),g=Math.random()>.5?90:-90,h=d+g;TweenMax.to(c,e,{overwrite:!0,physics2D:{velocity:f,angle:h,friction:.1},pixi:{tint:c.oc},onComplete:a,onCompleteParams:[c]})}},interakt_avoid=function(){var a=50,b={};this.init=function(){console.log("init interakt_avoid")},this.stimulate=function(a,c,d){var e=a._i;b[e]=a,a.liveReleased=!1,a.liveness=0,a.lock=!1},this.loop=function(){for(var c in b){var d=b[c],e=d.x,f=d.y,g=d.target.x,h=d.target.y,i=g-e,j=h-f,k=Math.sqrt(i*i+j*j),l=e-i/k*a/k,m=f-j/k*a/k;d.forcex=(d.forcex+(d.ox-e)/5)/9.1,d.forcey=(d.forcey+(d.oy-f)/5)/9.1,d.x=l+d.forcex,d.y=m+d.forcey}},this.update=function(a,c){for(var d in b){var e=b[d];e.liveReleased?(e.liveness++,e.liveness>50&&(b[d]=null,delete b[d],backP(e))):e.liveReleased=!0,e.target.x=a,e.target.y=c}}};!function(){function a(a){j=a,h=j.width/2,i=j.height/2,window.sok.onData(function(a){for(var b=0;b<a.length;++b)c(a[b],b)})}function b(){k=setInterval(function(){for(var a in m){var b=m[a];b&&(l.removeChild(b.sp1),l.removeChild(b.sp2)),m[a]=null}},1e4)}function c(a,b){var c,f=a.id;r&&e(a);for(var g=0;g<o.length;++g){var h=a[o[g]];c=d(h);var i={user_id:f,user_num:b,point:o[g]};window.interakt.addCursor(i,c.x,c.y)}}function d(a){var b=a.x*h+h,c=-1*a.z*i+i;return{x:b,y:c}}function e(a){var b=m[a.id];if(!b){f=new PIXI.Graphics,l.addChild(f),e=new PIXI.Graphics,l.addChild(e);var c=q[p];p++,p>=q.length&&(p=0),b={sp1:e,sp2:f,c:c},m[a.id]=b}var e=b.sp1,f=b.sp2;e.clear(),f.clear(),e.beginFill(b.c),f.lineStyle(3,b.c);for(var g,h=0;h<n.length;++h){var i=n[h],j=i[0];g=d(a[j]),e.drawCircle(g.x,g.y,10),f.moveTo(g.x,g.y);for(var k=0;k<i.length;++k){var o=i[k];g=d(a[o]),e.drawCircle(g.x,g.y,10),k>0&&f.lineTo(g.x,g.y)}}}function f(a){for(var b=0;b<n.length;++b){var c=n[b],e=c[0];pt=d(a[e]);for(var f=0;f<c.length;++f){var g=c[f];pt=d(a[g]);var h={colors:APP.system.setColorRange([16777215,16777215]),size:[6,16],vel:[30,120],scale:1,alpha:[.6,1],n:4,time:[.5,2],min_distance:2,center:!1};APP.system.emit("newUser-"+a.id+"-"+g,pt.x,pt.y,h)}}}function g(){r=!r,r?(b(),j.addChild(l)):(clearInterval(k),j.removeChild(l))}var h,i,j,k,l=new PIXI.Container,m={},n=[["handLeft","elbowLeft","shoulderLeft","spineShoulder","shoulderRight","elbowRight","handRight"],["head","spineShoulder","spineBase"],["ankleLeft","kneeLeft","spineBase","kneeRight","ankleRight"]],o=["handLeft","handRight"],p=0,q=[16711680,65280,255,1044480,4080,983280],r=!1;window.skeleton={},window.skeleton.init=a,window.skeleton.toInterakt=c,window.skeleton.toggleDebug=g,window.skeleton.newUser=f}(),function(){function a(){$("body").keypress(function(a){var b=a.which;switch(console.log(b),b){case 100:window.skeleton.toggleDebug();break;case 49:window.sok.send({command:"translationx",value:-.01});break;case 50:window.sok.send({command:"translationx",value:.01});break;case 51:window.sok.send({command:"translationz",value:-.01});break;case 52:window.sok.send({command:"translationz",value:.01});break;case 53:window.sok.send({command:"scale",value:-.01});break;case 54:window.sok.send({command:"scale",value:.01});break;case 55:window.sok.send({command:"timetowait",value:-1});break;case 56:window.sok.send({command:"timetowait",value:1});break;case 57:window.sok.send({command:"getcurrentsettings"});break;case 118:case 86:APP.changeView();break;case 110:case 78:APP.audio.newUser();break;case 112:case 80:APP.segment?APP.segment=0:APP.segment=1;break;case 117:case 85:APP.user++,APP.user>=3&&(APP.user=0)}})}window.keyboard={},window.keyboard.init=a}(),window.svgToCanvas=svgToCanvas,function(){function a(a){function b(a){var b=this;this.f=0,this.t=0,this.n=0;var c,d=a;return this.prop=function(){return c=b.t-b.f,b.n=b.n-c*d,b.t=b.n,b.n},this}var c=new b(a),d=new b(a);return this.update=function(){return{x:c.prop(),y:d.prop()}},this.x=function(){return c.prop()},this.setX=function(a){c.f=a},this.setiX=function(a){c.t=a},this.setfX=function(a){c.n=a},this.y=function(){return d.prop()},this.setY=function(a){d.f=a},this.setiY=function(a){d.t=a},this.setfY=function(a){d.n=a},this}window.Zen=a}(),function(a){function b(){n=new TimelineMax({onUpdate:d}).pause(),g=a("#brand"),g.css({width:APP.W,height:APP.H}),g.addClass("show"),h=g.find("#c1"),i=g.find("#c2"),j=g.find("#c3"),k=g.find("#c4"),l=g.find("#c5"),m=g.find("#logo"),n.from(h,1.5,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p1"),{align:"relative"}),type:"cubic"},alpha:0,rotation:-270,transformOrigin:"50%",ease:Power3.easeOut}),n.from(i,1.5,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p2"),{align:"relative"}),type:"cubic"},alpha:0,ease:Power3.easeOut},"-=1"),n.from(j,1.5,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p3"),{align:"relative"}),type:"cubic"},alpha:0,ease:Power3.easeOut},"-=1.2"),n.from(k,1.15,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p4"),{align:"relative"}),type:"cubic"},alpha:0,rotation:180,transformOrigin:"0%",ease:Power3.easeOut},"-=1"),n.from(l,1.5,{bezier:{values:MorphSVGPlugin.pathDataToBezier(g.find("#p5"),{align:"relative"}),type:"cubic"},alpha:0,ease:Power3.easeOut},"-=.6"),n.from(m,3,{alpha:0,ease:Power1.easeIn})}function c(a){n.eventCallback("onComplete",null),a&&n.eventCallback("onComplete",a),n.play()}function d(){e(h,"c1"),e(i,"c2"),e(j,"c3"),e(k,"c4"),e(l,"c5")}function e(a,b){if(a){var c=a[0]._gsTransform.xOrigin+a[0]._gsTransform.x+6,d=a[0]._gsTransform.yOrigin+a[0]._gsTransform.y+6;window.interakt.addCursor(b,c,d,!0)}}function f(){n.reverse(0)}window.brand={};var g,h,i,j,k,l,m,n=null;a(document).ready(function(){b()}),window.brand.show=c,window.brand.hide=f}(window.jQuery);