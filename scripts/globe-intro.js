/* Offline globe flight using Natural Earth public-domain geographic outlines. */
(() => {
  let frame, canvas;
  const stop = () => { cancelAnimationFrame(frame); canvas?.remove(); canvas = null; };
  window.PMGlobeIntro = { stop, async play(stage, dark, isCurrent) {
    stop();
    const response = await fetch('assets/data/world-land.geojson');
    if (!response.ok) throw new Error('Globe outlines unavailable');
    const land = await response.json();
    if (!isCurrent()) return;
    canvas = document.createElement('canvas');
    canvas.className = 'offline-globe';
    canvas.setAttribute('aria-hidden', 'true');
    stage.append(canvas);
    const surface = canvas, ctx = surface.getContext('2d');
    const width = stage.clientWidth, height = stage.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    surface.width = width*dpr; surface.height = height*dpr; ctx.scale(dpr,dpr);
    const rad = Math.PI/180, ease=t=>t*t*(3-2*t);
    function draw(t) {
      const turn = ease(Math.min(t/.48,1));
      const zoom = ease(Math.max(0,Math.min((t-.36)/.5,1)));
      const lon = (30+91.475*turn)*rad, lat=(12+19.23*turn)*rad;
      const radius = Math.min(width,height)*.36*Math.pow(45,zoom);
      const project = ([x,y]) => {
        const a=x*rad-lon,b=y*rad;
        return [width/2+radius*Math.cos(b)*Math.sin(a),height/2-radius*(Math.cos(lat)*Math.sin(b)-Math.sin(lat)*Math.cos(b)*Math.cos(a)),Math.sin(lat)*Math.sin(b)+Math.cos(lat)*Math.cos(b)*Math.cos(a)];
      };
      ctx.fillStyle=dark?'#101619':'#f5f0e5';ctx.fillRect(0,0,width,height);
      ctx.save();ctx.beginPath();ctx.arc(width/2,height/2,radius,0,Math.PI*2);ctx.clip();
      ctx.fillStyle=dark?'#172b32':'#c7dce0';ctx.fillRect(0,0,width,height);
      ctx.fillStyle=dark?'#35453f':'#dedecb';ctx.strokeStyle=dark?'#52645b':'#a9b8a9';ctx.lineWidth=.7;
      for(const feature of land.features){
        const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
        for(const polygon of polygons)for(const ring of polygon){
          const points=ring.map(project);if(points.every(p=>p[2]<0))continue;
          ctx.beginPath();let started=false;
          for(const [x,y,z] of points){if(z<0){started=false;continue;}if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);}
          ctx.closePath();ctx.fill();ctx.stroke();
        }
      }
      ctx.strokeStyle=dark?'#78939530':'#64868935';ctx.lineWidth=.8;
      for(let longitude=-180;longitude<180;longitude+=30){ctx.beginPath();let started=false;for(let latitude=-90;latitude<=90;latitude+=2){const[x,y,z]=project([longitude,latitude]);if(z<=0){started=false;continue;}if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);}ctx.stroke();}
      const[x,y,z]=project([121.475,31.23]);if(z>0){ctx.fillStyle='#ff762f';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();if(t>.25){ctx.font='600 13px sans-serif';ctx.fillText('SHANGHAI',x+12,y-12);}}
      ctx.restore();surface.style.opacity=t>.82?String(1-ease((t-.82)/.18)):'1';
    }
    await new Promise(resolve=>{const start=performance.now();function tick(now){if(!isCurrent()||canvas!==surface){resolve();return;}const t=Math.min((now-start)/6800,1);draw(t);if(t<1)frame=requestAnimationFrame(tick);else{stop();resolve();}}frame=requestAnimationFrame(tick);});
  }};
})();
