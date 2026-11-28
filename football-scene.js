import { drawPortrait } from './football-portrait.js';

// The actors are drawn with a handful of pressure-sensitive ink strokes.
// Positions are in metres: x across the pitch, y up, z toward the goal.
const PI = Math.PI;
const mix = (a, b, t) => a + (b - a) * t;
const clamp = t => Math.max(0, Math.min(1, t));
function ease(start, end, time) {
  const t = clamp((time - start) / (end - start));
  return t * t * (3 - 2 * t);
}
const between = (a, b, t) => a.map((v, i) => mix(v, b[i], t));
const paper = '#fffbed';
const lime = '#e1fa82';
const dribblePace = 8.8;
const strikeTime = .75;
const impactTime = .915;
const netDepth = 20.87;
const targetX = -2.39, targetY = 1.32;

function netTravel(t) {
  const u = Math.max(0,(t-impactTime)/.085);
  return .46*Math.sin(2.5*PI*u)*Math.exp(-4.5*u);
}

// Round each bend before sweeping the nib along the line. Pressure follows
// distance along the stroke so a close pair of joints cannot bunch up the ink.
function brush(ctx, points, width, color, bias = .5) {
  const path = [points[0]];
  const lengths = [0];
  let distance = 0;
  let start = points[0];
  for (let i = 1; i < points.length; i++) {
    const control = points[i];
    const end = i === points.length - 1 ? control : between(control, points[i+1], .5);
    for (let step = 1; step <= 8; step++) {
      const t = step / 8;
      const next = between(between(start,control,t), between(control,end,t), t);
      const previous = path.at(-1);
      distance += Math.hypot(next[0]-previous[0], next[1]-previous[1]);
      path.push(next);
      lengths.push(distance);
    }
    start = end;
  }
  if (distance < .1) return;

  const left = [], right = [];
  for (let i = 0; i < path.length; i++) {
    const a = path[Math.max(0,i-1)], b = path[Math.min(path.length-1,i+1)];
    const dx = b[0]-a[0], dy = b[1]-a[1], len = Math.hypot(dx,dy) || 1;
    const t = lengths[i]/distance;
    const pressure = Math.sin(PI * (t < bias ? .5*t/bias : .5+.5*(t-bias)/(1-bias)));
    const nibAngle = (dy-.43*dx)/len;
    const r = width * (.008 + .49 * pressure ** 1.16) * (.64+.36*nibAngle*nibAngle);
    const [x,y] = path[i];
    left.push([x-dy/len*r,y+dx/len*r]); right.push([x+dy/len*r,y-dx/len*r]);
  }
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(...left[0]);
  for (const p of left.slice(1)) ctx.lineTo(...p);
  for (let i = right.length-1; i >= 0; i--) ctx.lineTo(...right[i]);
  ctx.closePath(); ctx.fill();
}

// Match run speed at contact, then let the planted leg brake the body.
function shotTravel(t) {
  return 17*Math.min(t,strikeTime)+.34*(1-Math.exp(-50*Math.max(0,t-strikeTime)));
}

function play(t) {
  const charge = Math.min(t,.75);
  const stride = .12 + charge * dribblePace;
  const phase = stride * 2 * PI;
  const cut = ease(.27,.44,t) - .74*ease(.48,.66,t);
  const x = -.68*cut + .027*Math.sin(phase)*(1-ease(.65,.75,t));
  const z = shotTravel(t);
  const airborne = clamp((t-.346)/.074);
  const lift = .145*4*airborne*(1-airborne);
  // Left-foot touches occur just before that boot comes down. Between
  // touches the ball rolls ahead, slows and is caught by the next stride.
  const roll = (stride+.54)%1;
  const lead = .37*Math.sin(PI*roll)*Math.exp(-1.6*roll);
  const ballCut = ease(.26,.405,t)-.74*ease(.47,.636,t);
  const runBall = [-.68*ballCut+.16+.037*Math.cos(phase), .12+.024*Math.sin(PI*roll)**2,
    17*charge + .48 + lead];
  const contact = [-.68*.26+.19, .13, 17*.75+.52];
  const planted = between(runBall,contact,ease(.68,.75,t));
  const elapsed = clamp((t-strikeTime)/(impactTime-strikeTime));
  // Put a little more of the flight distance into the initial release.
  const flight = elapsed + .18*elapsed*(1-ease(0,.60,elapsed));
  const ball = between(planted,[targetX,targetY,netDepth-.12],flight);
  ball[1] += 2.4*flight*(1-flight);
  if (t > impactTime) {
    const drop = clamp((t-impactTime)/.085);
    ball[0] -= .10*drop;
    ball[1] = mix(targetY,.12,drop*drop);
    ball[2] += netTravel(t)-.29*drop*drop;
  }
  return { runner:[x,lift,z], ball, stride };
}

function camera(w,h,t,ball,runner) {
  const compact = w <= 704;
  const orbit = mix(.64,PI-.28,ease(.025,.72,t))+.07*ease(.84,.99,t);
  const cs = Math.cos(orbit), sn = Math.sin(orbit);
  const chase = ease(.75,.96,t);
  const focus = between(runner,ball,.53-.29*chase);
  const distance = mix(4.8,5.45,chase);
  const focal = compact ? Math.min(h*.97,w*1.65,Math.max(200,(h*.87-330)*2.35)) : Math.min(h*1.64,w*1.35);
  const base = compact ? .87 : .825;
  const across = compact ? .57-.10*ease(.22,.46,t)+.12*chase :
    .70-.405*ease(.19,.39,t)+.435*ease(.55,.76,t)+.025*chase;
  const cameraY = .95+.20*chase;
  const horizon = h*base - cameraY*focal/distance;
  const depth = ([x,,z]) => distance+(x-focus[0])*sn-(z-focus[2])*cs;
  const ballOffset = ((ball[0]-focus[0])*cs+(ball[2]-focus[2])*sn)*focal/depth(ball);
  const lensX = w*across - ballOffset*ease(.74,.89,t);
  const project = (p) => {
    const k = focal/Math.max(.24,depth(p));
    return [lensX+((p[0]-focus[0])*cs+(p[2]-focus[2])*sn)*k, horizon+(cameraY-p[1])*k];
  };
  return {project,depth,scale:p=>focal/Math.max(.24,depth(p)), orbit,cs,sn,w,h};
}

function pitch(ctx,view,t) {
  const {project,depth,w,h} = view;
  // Clip each world segment at the lens before projecting. This lets the
  // camera pass a touchline or a goalpost without a streak across the frame.
  function line(a,b,color,width) {
    let da=depth(a), db=depth(b);
    if (da<.4 && db<.4) return;
    if (da<.4) a=between(a,b,(.4-da)/(db-da));
    if (db<.4) b=between(a,b,(.4-da)/(db-da));
    ctx.beginPath(); ctx.moveTo(...project(a)); ctx.lineTo(...project(b));
    ctx.lineWidth=width; ctx.strokeStyle=color; ctx.stroke();
  }
  const faint='rgba(219,231,255,.23)', fine='rgba(219,231,255,.14)';
  const ground = (x1,z1,x2,z2,ink=faint,n=1) => line([x1,0,z1],[x2,0,z2],ink,n);
  for (const side of [-1,1]) {
    ground(side*14,-16,side*14,20);
    ground(side*8,15,side*8,20);
    ground(side*4.7,18,side*4.7,20,fine);
    // Simple perimeter rail with widely spaced uprights, seen in parallax.
    for (let z=-18;z<=24;z+=3) line([side*15,0,z],[side*15,.65,z],fine,.85);
    line([side*15,.65,-18],[side*15,.65,24],fine,1);
  }
  ground(-14,20,14,20); ground(-14,-12,14,-12);
  ground(-14,0,14,0); ground(-8,15,8,15); ground(-4.7,18,4.7,18,fine);
  for (let i=0;i<70;i++) {
    const a=i*PI/35, b=(i+1)*PI/35;
    ground(3.7*Math.cos(a),3.7*Math.sin(a),3.7*Math.cos(b),3.7*Math.sin(b),faint,1.1);
  }
  if (t < .47) return;
  const opacity = ease(.47,.64,t);
  ctx.save(); ctx.globalAlpha=opacity;
  const left=-2.65, right=2.65, top=2.1, front=20, back=netDepth;
  const mesh='rgba(237,245,255,.39)';
  const meshPoints=Array.from({length:21},(_,i)=>Array.from({length:9},(_,j)=>{
    const x=mix(left,right,i/20), y=top*j/8;
    if (t<=impactTime) return [x,y,back];
    const distance=Math.hypot(x-targetX,y-targetY);
    const edge=clamp((right-Math.abs(x))/.16)*clamp(Math.min(y,top-y)/.32);
    return [x,y,back+edge*netTravel(t-.004*distance)*Math.exp(-distance*distance/.85)];
  }));
  for (let i=0;i<=20;i++) {
    const x=mix(left,right,i/20);
    line([x,top,front],meshPoints[i][8],fine,1);
    for (let j=0;j<8;j++) line(meshPoints[i][j],meshPoints[i][j+1],mesh,.85);
  }
  for (let j=0;j<=8;j++) {
    const y=top*j/8;
    for (let i=0;i<20;i++) line(meshPoints[i][j],meshPoints[i+1][j],mesh,.85);
    for(const i of [0,20]) line([meshPoints[i][j][0],y,front],meshPoints[i][j],mesh,.85);
  }
  const post = Math.max(1.7,Math.min(w,h)*.0045);
  for (const x of [left,right]) {
    line([x,0,front],[x,top,front],paper,post);
    line([x,top,front],[x,top,back],faint,1.4);
    line([x,0,back],[x,top,back],faint,1.4);
  }
  line([left,top,front],[right,top,front],paper,post);
  ctx.restore();
}

const stepReach = 17 / dribblePace;

function runningLeg(side, cycle, hips) {
  const stance = .39;
  const swing = ease(stance,1,cycle);
  // This offsets the runner's forward travel during stance. The heel comes
  // off the ground at the end of the push, then sweeps under the hip.
  const heelTravel = .44 - stepReach*cycle + stepReach*swing;
  const push = ease(.24,stance,cycle) * (1-ease(.65,.94,cycle));
  const heel = [side*.112,.08+.30*push,heelTravel];
  const thigh = [hips[0]+side*.115,hips[1],hips[2]];
  const down = heel[1]-thigh[1], forward = heel[2]-thigh[2];
  const reach = Math.hypot(down,forward);
  const legSegment = .445;
  const mid = Math.min(reach*.5,legSegment-.0005);
  const bend = Math.sqrt(legSegment**2-mid**2);
  const knee = [mix(thigh[0],heel[0],.5)+side*.016,
    thigh[1]+(mid*down+bend*forward)/reach,
    thigh[2]+(mid*forward-bend*down)/reach];
  return [thigh,knee,heel];
}

function runnerPose(t,stride) {
  const plantTime=.735;
  stride+=(7-(.12+plantTime*dribblePace))*ease(.57,.70,t);
  const swing = Math.sin(stride*2*PI);
  const bounce = -.027*Math.cos((stride-.12)*4*PI);
  const lean = .244+.075*ease(.28,.42,t)-.075*ease(.48,.6,t);
  const pose = { hip:[.023*swing,.846+bounce,0], chest:[-.020*swing,1.377+bounce,lean],
    head:[-.032*swing,1.602+bounce*.6,lean+.112] };
  for (const side of [-1,1]) {
    const cycle = (stride+(side===1?.5:0))%1;
    const drive = Math.cos((cycle-.02)*2*PI);
    const shoulder = [pose.chest[0]+side*.203,pose.chest[1]+side*.023*swing,lean-.068*drive];
    const armAngle = .25+.76*drive;
    const elbow = [shoulder[0]+side*.058,shoulder[1]-.272*Math.cos(armAngle),shoulder[2]-.272*Math.sin(armAngle)];
    const forearm = .33-.24*drive;
    const wrist = [elbow[0]-side*.055,elbow[1]+.23*Math.sin(forearm),elbow[2]+.23*Math.cos(forearm)];
    pose[side] = [shoulder,elbow,wrist,...runningLeg(side,cycle,pose.hip)];
  }
  function blendSide(side,parts,weight) {
    pose[side]=pose[side].map((p,i)=>between(p,parts[i],weight));
  }
  // A single running bound: the front knee clears the boot, the rear heel
  // folds under the hip, then the front foot reaches the turf first.
  const bound=ease(.321,.363,t)*(1-ease(.407,.446,t));
  const landing=ease(.37,.420,t);
  for (const side of [-1,1]) {
    const front=side===1;
    const thigh=[side*.11,.842,0];
    const ankle=front?[.12,mix(.32,.078,landing),mix(.27,.39,landing)]:
      [-.13,mix(.18,.34,landing),mix(-.48,-.21,landing)];
    const leg=reachJoint(thigh,ankle,[side*.08,.06,1],.445,.445);
    const shoulder=[side*.20,1.38,.25];
    const elbow=[side*.25,1.16,front?.03:.39];
    const wrist=[side*.24,1.22,front?.25:.58];
    blendSide(side,[shoulder,elbow,wrist,...leg],bound);
  }
  if (t<.709) return pose;
  const gather=ease(.709,plantTime,t);
  // Slow the kicking leg through its forward arc, anchored at contact.
  // Blend back to scene time outside the swing to join the run and recovery.
  const swingWindow=ease(.711,.727,t)*(1-ease(.773,.81,t));
  const swingTime=mix(t,strikeTime,.45*swingWindow);
  const release=ease(.737,.779,t);
  const recover=ease(.782,.866,t);
  const followThrough=ease(strikeTime,.770,t)*(1-recover);
  const hipX=mix(-.058,.018,recover);
  const hipY=.85+.045*release-.030*recover;
  pose.hip=between(pose.hip,[hipX,hipY,0],gather);
  pose.chest=between(pose.chest,[hipX-.038,hipY+.522,.245-.14*recover+.035*followThrough],gather);
  pose.head=between(pose.head,[hipX-.048,hipY+.758,.34-.19*recover+.035*followThrough],gather);

  for (const side of [-1,1]) {
    const support=side===-1;
    const twist=side*((-.083+.178*release)*(1-recover)+.033*followThrough);
    const shoulder=offset(pose.chest,side*.205,0,twist);
    const spread=(support?.24:.14)*(1-recover);
    const elbow=offset(shoulder,side*(.065+spread),-.19,.04+twist);
    const wrist=offset(elbow,side*spread*.35,-.055,.215);
    const thigh=offset(pose.hip,side*.113,0,0);
    let leg;
    if (support) {
      // Before touchdown keep the actual running leg. From touchdown onward
      // its target is one fixed spot beside the ball in pitch coordinates.
      if (t<plantTime) leg=pose[side].slice(3);
      else {
        const ankle=[-.112,.08,shotTravel(plantTime)+.44-shotTravel(t)];
        leg=reachJoint(thigh,ankle,[-.09,.05,1],.45,.444);
      }
    } else {
      // Thigh leads. The flexed knee keeps the heel back until the lower
      // leg swings through impact. Both angles keep moving past contact.
      const drive=ease(.724,.765,swingTime);
      // Ease the knee extension through the same boot-to-ball contact pose.
      const snap=ease(.734,.762,strikeTime+(swingTime-strikeTime)*1.10);
      const windup=ease(.714,plantTime,swingTime)*(1-ease(plantTime,strikeTime,swingTime));
      const upper=mix(-.25,1.29,drive)-.70*windup+.07*followThrough;
      const lower=mix(-1.65,1.38,snap)-.42*windup;
      // Open the swing plane slightly so the rear camera sees the heel
      // sweep outside the hip before the leg straightens toward the ball.
      const open=.22*windup;
      function legSegment(start,length,angle,lateral) {
        const forward=length*Math.sin(angle);
        return offset(start,lateral*Math.cos(open)-forward*Math.sin(open),
          -length*Math.cos(angle),lateral*Math.sin(open)+forward*Math.cos(open));
      }
      const knee=legSegment(thigh,.45,upper,.018);
      const ankle=legSegment(knee,.444,lower,.086-.15*ease(strikeTime,.781,swingTime));
      const settled=reachJoint(thigh,[.12,.081,.36],[.13,.04,1],.45,.444);
      leg=[thigh,between(knee,settled[1],recover),between(ankle,settled[2],recover)];
    }
    const legBlend=support?gather:ease(.709,plantTime,swingTime);
    const shotPose=[shoulder,elbow,wrist,...leg];
    pose[side]=pose[side].map((joint,i)=>between(joint,shotPose[i],i<3?gather:legBlend));
  }
  return pose;
}

// The defender closes down on a diagonal. Travel drives the approach stride,
// then turf friction slows the slide. Distances stay in pitch coordinates.
function tackle(t) {
  const heading=.39, cs=Math.cos(heading), sn=Math.sin(heading);
  const firstStep=.16, launch=.345, duration=.19, speed=8.3;
  const u=clamp((t-launch)/duration);
  const travel=speed*(Math.max(0,Math.min(t,launch)-firstStep)+duration*(u-.5*u*u));
  const feet=[1.03-sn*travel,0,9.05-cs*travel];
  const stride=.36+travel/stepReach;
  const run=runnerPose(.10,stride);
  const drop=ease(.300,.395,t), extend=ease(.313,.385,t), recover=ease(.446,.590,t);
  const height=mix(run.hip[1],.198,drop)+.28*recover;
  const tilt=-.88*drop+.67*recover, bank=.42*drop-.30*recover;
  const ct=Math.cos(tilt),st=Math.sin(tilt),cb=Math.cos(bank),sb=Math.sin(bank);
  // Hips and shoulders bank together onto the outside thigh. Hands and
  // boots are solved against the pitch, so the planted foot can push off.
  function bodyToPitch([x,y,z]) {
    const up=ct*y-st*z;
    return [cb*x-sb*up,height+sb*x+cb*up,st*y+ct*z];
  }
  function pitchToBody([x,y,z]) {
    const up=cb*(y-height)-sb*x;
    return [cb*x+sb*(y-height),ct*up+st*z,ct*z-st*up];
  }
  const relative=p=>subtract(p,run.hip);
  const pose={hip:[0,0,0],chest:relative(run.chest),head:relative(run.head),heading,
    transform:p=>{
      const [x,y,z]=bodyToPitch(p);
      return [cs*x+sn*z,y,cs*z-sn*x];
    }};
  for (const side of [-1,1]) {
    const leading=side===1;
    const [shoulder,,wrist,thigh,,heel]=run[side].map(relative);
    const startBoot=[heel[0],heel[1]+run.hip[1],heel[2]];
    // The inside of the leading boot reaches for the lane Messi just left.
    // The other boot stays planted for the push and folds underneath him.
    const plantedZ=.44-stepReach*((.36+travel/stepReach)-1);
    const tucked=between([-.12,.08,plantedZ],[-.32,.105,-.39],ease(.346,.406,t));
    const slideBoot=leading?[.19,.095,.795]:tucked;
    const kneeling=leading?[.19,.085,.46]:[-.27,.102,-.49];
    const boot=between(between(startBoot,slideBoot,extend),kneeling,recover);
    const leg=reachJoint(thigh,pitchToBody(boot),[side*(leading?.18:.85),.16,1],.445,.433);
    const handStart=[wrist[0],wrist[1]+run.hip[1],wrist[2]];
    const slideHand=leading?[.50,.67,-.20]:[-.37,.088,-.43];
    const handsUp=leading?[.40,.85,.01]:[-.34,.41,-.22];
    const hand=between(between(handStart,slideHand,drop),handsUp,recover);
    pose[side]=[...reachJoint(shoulder,pitchToBody(hand),[side*.6,-.48,-.5],.292,.257),...leg];
  }
  return {feet,pose};
}

// Hip path in metres (toward the post, height, toward the shooter), then
// bank in radians. The hip leads at takeoff; gravity brings it down while
// the upper body is still reaching. Each pose is reversible when scrubbing.
const keeperMotion = [
  // time   across   height  forward  bank
  [.59,    -.16,     .78,    .00,    -.035],
  [.655,   -.065,    .79,    .12,     .025],
  [.710,    .015,    .76,    .18,     .010],
  [.750,    .018,    .735,   .19,     .010],
  [.773,    .026,    .73,    .19,     .030],
  [.800,    .14,     .67,    .20,     .17],
  [.831,    .33,     .845,   .26,     .46],
  [.875,    .62,    1.005,   .34,     .98],
  [.900,    .79,     .91,    .38,    1.20],
  [.938,   1.035,    .47,    .43,    1.43],
  [.956,   1.13,     .225,   .45,    1.49],
  [.976,   1.19,     .196,   .46,    1.46],
  [1,      1.20,     .205,   .46,    1.40],
];

function keeperRoot(t) {
  const keys = keeperMotion;
  const i = keys.findIndex(key => key[0] > t)-1;
  if (t <= keys[0][0]) return keys[0].slice(1);
  if (i < 0) return keys.at(-1).slice(1);
  const a=keys[i], b=keys[i+1], span=b[0]-a[0], u=(t-a[0])/span;
  // Monotone tangents preserve planted holds and the top of the arc.
  function slope(j,c) {
    if (j===0 || j===keys.length-1) return 0;
    const prev=keys[j-1], cur=keys[j], next=keys[j+1];
    const l=(cur[c]-prev[c])/(cur[0]-prev[0]), r=(next[c]-cur[c])/(next[0]-cur[0]);
    return l*r>0 ? 2*l*r/(l+r) : 0;
  }
  return [1,2,3,4].map(c => mix(a[c],b[c],u*u*(3-2*u))
    + span*u*(1-u)*((1-u)*slope(i,c)-u*slope(i+1,c)));
}

// Solve a two-segment limb toward a glove or boot target. The pole selects
// the bend plane and the length limit keeps elbows and knees anatomical.
function reachJoint(start,target,pole,upper,lower) {
  const delta=subtract(target,start), axis=unit(delta);
  const distance=Math.min(Math.hypot(...delta),upper+lower-.0001);
  const along=(upper*upper-lower*lower+distance*distance)/(2*distance);
  const bend=Math.sqrt(Math.max(0,upper*upper-along*along));
  const normal=unit(pole.map((v,i)=>v-axis[i]*dot(pole,axis)));
  return [start,start.map((v,i)=>v+axis[i]*along+normal[i]*bend),
    start.map((v,i)=>v+axis[i]*distance)];
}

function goalkeeper(t) {
  const [across,height,forward,bank]=keeperRoot(t);
  const cs=Math.cos(bank), sn=Math.sin(bank);
  const feet=[.14-across,height,19.68-forward];
  const brace=ease(.949,1,t);
  const pose={hip:[0,0,0],chest:[-.064*brace,.505,.115], head:[-.135*brace,.745,.19+.055*brace],
    gloveBrace:ease(.930,.966,t),
    transform:([x,y,z])=>[x*cs+y*sn,y*cs-x*sn,z]};
  const reach=ease(.781,.862,t), gather=ease(.935,.993,t);
  const step=ease(.769,.801,t);
  for (const side of [-1,1]) {
    const leading=side===1;
    const shuffle=ease(leading?.604:.647,leading?.670:.716,t);
    const lift=.045*Math.sin(PI*shuffle)+(leading?.07*Math.sin(PI*step):0);
    // Fixed pitch coordinates for each sole, including the directional step.
    // Transform back to body space so the loaded boot holds as the hip banks.
    const dx=side*.244-.16+.17*shuffle+(leading?.17*step:0)-across;
    const dy=.085+lift-height;
    const planted=[dx*cs-dy*sn,dx*sn+dy*cs,.13+.18*shuffle-forward];
    const trail=leading?[.12,-.78,-.08]:[-.24,-.60,-.29];
    const release=ease(leading?.818:.790,leading?.855:.839,t);
    const ankle=between(between(planted,trail,release),
      leading?[.005,-.77,-.02]:[-.25,-.56,-.36],gather);
    const thigh=[side*.107,0,0];
    const leg=reachJoint(thigh,ankle,[side*.18,.08,1],.443,.425);
    const shoulder=[side*.201-.064*brace,.49,.105];
    const ready=[side*.33,.13,.41];
    const extended=leading?[.26,1.04,.33]:[-.11,.91,.40];
    const landed=leading?[.21,.73,.39]:[.145,.34,.44];
    const wrist=between(between(ready,extended,reach),landed,gather);
    const cushion=ease(.902,.950,t);
    const arm=reachJoint(shoulder,wrist,[side*mix(.88,-.36,cushion),-.4,-.36-.5*cushion],.293,.262);
    pose[side]=[...arm,...leg];
  }
  return {feet,pose};
}

const offset = ([x,y,z], a,b,c) => [x+a,y+b,z+c];
const subtract = (a,b) => a.map((value,i) => value-b[i]);
const unit = vector => {
  const length = Math.hypot(...vector) || 1;
  return vector.map(value => value/length);
};
const dot = (a,b) => a.reduce((sum,value,i) => sum+value*b[i],0);
const cross = ([x,y,z],[a,b,c]) => [y*c-z*b,z*a-x*c,x*b-y*a];

// Each cross section describes an anatomical width and depth. Project its
// rim in the direction needed for the silhouette, so limbs keep their volume
// as they turn and foreshorten in the shot.
function silhouette(point, sections, across) {
  const sides = [[],[]];
  sections.forEach(([center,width,depth],i) => {
    const previous = sections[Math.max(0,i-1)][0];
    const next = sections[Math.min(sections.length-1,i+1)][0];
    const tangent = unit(subtract(next,previous));
    const side = unit(across.map((value,j) => value-tangent[j]*dot(across,tangent)));
    const front = cross(side,tangent);
    const origin = point(center);
    const [dx,dy] = subtract(point(next),point(previous));
    const normal = unit([dy,-dx]);
    const along = (axis, radius) => subtract(point(center.map((value,j) => value+radius*axis[j])),origin);
    const u = along(side,width), v = along(front,depth);
    const [cos,sin] = unit([dot(normal,u),dot(normal,v)]);
    for (const [edge,sign] of [[0,1],[1,-1]]) {
      const rim = center.map((value,j) => value+sign*(width*cos*side[j]+depth*sin*front[j]));
      sides[edge].push(point(rim));
    }
  });
  return sides;
}

function contourPath(ctx,outline) {
  const mid = (a,b) => between(a,b,.5);
  ctx.beginPath();
  ctx.moveTo(...mid(outline.at(-1),outline[0]));
  outline.forEach((p,i) => ctx.quadraticCurveTo(...p,...mid(p,outline[(i+1)%outline.length])));
  ctx.closePath();
}

function wash(ctx,outline,fill) {
  contourPath(ctx,outline);
  ctx.fillStyle = fill;
  ctx.fill();
}

function inkVolume(ctx,point,sections,across,fill,ink,size,lineWeight) {
  const [left,right] = silhouette(point,sections,across);
  wash(ctx,[...left,...right.toReversed()],fill);
  if (lineWeight) {
    brush(ctx,left,size*lineWeight,ink,.40);
    brush(ctx,right,size*lineWeight*.47,ink,.66);
  }
}

function hair(ctx,point,head,look,side,size,fill,ink) {
  const facing = Math.atan2(side,look);
  const onHead = (angle,height) => {
    const front = Math.cos(angle);
    const hairline = mix(-.047,.054,ease(-.77,.65,front))
      + .013*Math.sin(angle*3-.62)*ease(.25,.90,front);
    const curl = Math.sin(height*PI)*ease(.36,1,front);
    const rise = Math.sin(height*PI/2);
    const radius = Math.cos(height*PI/2);
    return point(offset(head,
      .094*Math.sin(angle)*radius-.025*rise,
      mix(hairline,.122,rise)+.020*curl,
      .097*front*radius-.008-.022*rise));
  };
  const start = facing-PI/2, end = facing+PI/2;
  const samples = Array.from({length:17},(_,i) => i/16);
  const edge = samples.map(t => onHead(mix(start,end,t),0));
  const crown = [...samples.map(t => onHead(end,t)),...samples.toReversed().slice(1).map(t => onHead(start,t))];
  wash(ctx,[...edge,...crown.slice(1,-1)],fill);
  brush(ctx,crown,size*.016,ink,.45);
  brush(ctx,edge,size*.007,ink,.52);
  for (const [startOffset,turn,height] of [[-.95,.38,.72],[-.67,.51,.62],[-.31,.58,.47],[.05,.56,.48]]) {
    const lock = samples.map(t => onHead(facing+startOffset+turn*t,.14+height*t));
    brush(ctx,lock,size*.0045,'#8ba3df',.67);
  }
}

function athlete(ctx,view,feet,pose,role='runner') {
  const away = role !== 'runner';
  const keeper = role === 'keeper';
  const direction = away ? -1 : 1;
  const depth = view.depth(feet);
  if (depth < 1.4) return;
  const size = view.scale(feet);
  const build = away ? 1 : .94;
  const place = p => {
    const [x,y,z] = pose.transform ? pose.transform(p) : p;
    return offset(feet,x*direction*build,y,z*direction);
  };
  const point = p => view.project(place(p));
  const ink = keeper ? '#f6dcaa' : away ? '#bbcdf4' : paper;
  const pale = keeper ? '#d7b38e' : away ? '#9fb9ea' : '#c3d3f8';
  const fills = keeper
    ? {shirt:'#bc8c73', skin:'#7c86bb', shorts:'#283e83', sock:'#6d739e', boot:'#233471', hair:'#253464'}
    : away
    ? {shirt:'#4a64ac', skin:'#667ab0', shorts:'#263e84', sock:'#526cae', boot:'#20367a', hair:'#1d3079'}
    : {shirt:'#76a4cd', skin:'#8997bc', shorts:'#213982', sock:'#7693c0', boot:'#223981'};
  const sideAxis = [1,0,0];
  const mark = (points,weight,color=ink,bias=.5) => brush(ctx,points.map(point),size*weight,color,bias);
  const volume = (sections,fill,weight,axis=sideAxis,color=ink) =>
    inkVolume(ctx,point,sections,axis,fill,color,size,weight);
  const seam = (center,radius,depth,front,weight=.009) => {
    mark([-1,-.65,0,.65,1].map(s =>
      offset(center,s*radius,.004*s,front*depth*Math.sqrt(1-s*s))),weight,pale);
  };
  const {hip,chest,head} = pose;
  const [leftShoulder] = pose[-1], [rightShoulder] = pose[1];
  const shoulders = between(leftShoulder,rightShoulder,.5);
  const shoulderAxis = unit(subtract(rightShoulder,leftShoulder));
  const waist = between(hip,chest,.24);
  const neck = between(head,shoulders,.64);
  const facing=view.orbit+(pose.heading ?? 0);
  const look = Math.cos(facing)*direction;
  const cameraSide = -Math.sin(facing)*direction;
  const visibleFace = mix(-1,1,ease(-.48,.48,look));
  const farSide = cameraSide < 0 ? 1 : -1;

  function leg(side) {
    const [,,,thigh,knee,heel] = pose[side];
    const cuff = between(thigh,knee,.46);
    const calf = between(knee,heel,.31);
    const sockTop = between(knee,heel,.23);
    const ankle = between(knee,heel,.91);
    const roll = ease(.12,.40,heel[1]);
    const toe = offset(heel,side*.018,-.055-.055*roll,.193-.052*roll);
    const cleatHeel = offset(heel,0,-.021,-.049);
    const legShape = [[between(thigh,cuff,.75),.079,.085],[between(cuff,knee,.36),.073,.078],
      [offset(knee,0,0,.009),.053,.059],[sockTop,.051,.060],
      [offset(calf,0,0,-.021),.059,.074],[between(knee,heel,.56),.045,.060],
      [ankle,.029,.040],[heel,.030,.036]];
    volume(legShape,fills.skin,.016);
    volume([legShape[3],legShape[4],legShape[5],legShape[6],legShape[7]],fills.sock,0);
    volume([[offset(thigh,0,.082,-.012),.090,.108],[between(thigh,cuff,.40),.104,.115],
      [between(thigh,cuff,.78),.096,.102],[cuff,.086,.090]],fills.shorts,.014);
    volume([[cleatHeel,.031,.035],[between(heel,toe,.20),.052,.040],
      [between(heel,toe,.68),.051,.028],[toe,.031,.018]],fills.boot,.017);
    seam(cuff,.076,.085,visibleFace,.009);
    seam(sockTop,.048,.061,visibleFace,.012);
    const calfHighlight = offset(calf,side*.037,-.006,visibleFace*.052);
    mark([offset(sockTop,side*.033,0,visibleFace*.042),calfHighlight,
      offset(between(knee,heel,.62),side*.026,0,visibleFace*.042)],.010,pale,.42);
    mark([offset(cleatHeel,0,-.027,0),offset(between(heel,toe,.57),0,-.035,.007),
      offset(toe,0,-.013,0)],.012,pale,.62);
  }

  function arm(side) {
    const [shoulder,elbow,wrist] = pose[side];
    const cuff = between(shoulder,elbow,.43);
    const forearm = between(elbow,wrist,.34);
    const hand = wrist.map((value,i) => value+(wrist[i]-elbow[i])*.28);
    volume([[between(shoulder,cuff,.82),.062,.067],[between(cuff,elbow,.39),.057,.066],
      [elbow,.043,.043]],fills.skin,.014);
    volume([[elbow,.043,.043],[forearm,.046,.050],[wrist,.028,.029],
      [between(wrist,hand,.56),.035,.034],[hand,.022,.023]],fills.skin,.014);
    if (keeper) {
      volume([[elbow,.056,.054],[forearm,.058,.057],[wrist,.036,.041]],fills.shirt,.013);
      const axis=unit(between(unit(subtract(wrist,elbow)),[0,.33,.94],pose.gloveBrace));
      const gloveTip=wrist.map((v,i)=>v+.15*axis[i]);
      const thumb=offset(between(wrist,gloveTip,.51),-side*.05,0,.026);
      volume([[wrist,.038,.036],[between(wrist,gloveTip,.40),.055,.032],
        [between(wrist,gloveTip,.80),.050,.027],[gloveTip,.021,.014]],'#ffebc7',.011);
      mark([between(wrist,gloveTip,.16),thumb,offset(thumb,0,.022,.015)],.032,'#ffebc7');
      mark([offset(wrist,-.03,0,.027),offset(wrist,0,.006,.038),offset(wrist,.03,0,.022)],.019,'#694f58');
    }
    volume([[between(shoulder,chest,.30),.077,.073],[shoulder,.090,.087],
      [between(shoulder,cuff,.53),.080,.082],[cuff,.071,.071]],fills.shirt,.006);
    if (!away && side===1) {
      volume([[between(shoulder,cuff,.76),.078,.080],[cuff,.074,.074],
        [between(cuff,elbow,.19),.067,.069]],'#283957',.007);
    }
    mark([offset(cuff,side*.047,-.022,visibleFace*.050),
      offset(cuff,0,-.013,visibleFace*.072),offset(cuff,-side*.050,-.012,visibleFace*.045)],.009,pale);
    if (!away && side === -1) {
      const sleeve = between(elbow,wrist,.71);
      mark([offset(forearm,-.027,.012,visibleFace*.034),offset(sleeve,-.031,.024,visibleFace*.032),
        offset(wrist,-.013,.012,visibleFace*.025)],.022,'#394d93',.52);
      mark([offset(forearm,-.021,-.010,visibleFace*.040),offset(sleeve,-.021,.001,visibleFace*.038),
        offset(wrist,.014,-.005,visibleFace*.022)],.011,'#465aa0',.34);
    }
  }

  ctx.save();
  ctx.globalAlpha *= ease(1.4,2.8,depth);
  ctx.save();
  ctx.globalAlpha *= .87;
  leg(farSide);
  arm(farSide);
  ctx.restore();
  leg(-farSide);

  volume([[offset(hip,0,-.133,-.006),.105,.083],[offset(hip,0,-.062,-.012),.178,.111],
    [offset(hip,0,.068,.009),.171,.112]],fills.shorts,0);
  const shirt=[[offset(hip,0,.047,0),.175,.115],[waist,.151,.106],
    [between(waist,chest,.63),.193,.129],[shoulders,.211,.124],
    [between(shoulders,neck,.48),.131,.091],[neck,.057,.060]];
  volume(shirt,fills.shirt,.024,shoulderAxis);
  if (!away) {
    // Wrap the two light bands around each face of the shirt. Intersect
    // each band with the visible half of the torso as the camera orbits.
    ctx.save();
    const [left,right]=silhouette(point,shirt,shoulderAxis);
    contourPath(ctx,[...left,...right.toReversed()]);
    ctx.clip();
    const longitude=Math.atan2(cameraSide*.115,look*.184);
    const rings=shirt.map(([center,width,thickness],i)=>{
      const up=unit(subtract(shirt[Math.min(i+1,shirt.length-1)][0],shirt[Math.max(0,i-1)][0]));
      const lateral=unit(shoulderAxis.map((v,j)=>v-up[j]*dot(shoulderAxis,up)));
      const normal=cross(lateral,up);
      return angle=>point(center.map((v,j)=>v+width*Math.sin(angle)*lateral[j]+thickness*Math.cos(angle)*normal[j]));
    });
    for (const halfTurn of [-PI,0,PI]) {
      for (const sign of [-1,1]) {
        const a=halfTurn+sign*.64;
        const lo=Math.max(a-.32,longitude-PI/2), hi=Math.min(a+.32,longitude+PI/2);
        if (hi<=lo) continue;
        const edge=rings.map(r=>r(lo)), returnEdge=rings.toReversed().map(r=>r(hi));
        ctx.beginPath();
        for (const [i,side] of [edge,returnEdge].entries()) {
          if (i===0) ctx.moveTo(...side[0]); else ctx.lineTo(...side[0]);
          for (let j=1;j<side.length-1;j++) {
            ctx.quadraticCurveTo(...side[j],...between(side[j],side[j+1],.5));
          }
          ctx.lineTo(...side.at(-1));
        }
        ctx.closePath();ctx.fillStyle='#d6e2e8';ctx.fill();
      }
    }
    ctx.restore();
    volume([[between(shoulders,neck,.80),.076,.070],[neck,.061,.062]],'#2c3c61',.004,shoulderAxis);
  }
  seam(offset(hip,0,.056,.01),.161,.115,visibleFace,.012);
  const sign = visibleFace;
  mark([offset(waist,-.134,.027,sign*.075),offset(waist,-.048,.012,sign*.108),offset(waist,.028,-.009,sign*.104)],
    .012,pale,.32);
  mark([offset(chest,.155,-.055,sign*.091),offset(chest,.113,-.139,sign*.107),
    offset(waist,.129,.059,sign*.095)],.011,pale,.33);
  mark([offset(hip,-.015,-.123,sign*.100),offset(hip,-.034,-.072,sign*.113),
    offset(hip,-.069,-.051,sign*.103)],.010,pale,.63);
  arm(-farSide);

  const jaw = offset(head,0,-.108,.038);
  volume([[neck,.054,.058],[between(neck,jaw,.60),.048,.060],
    [offset(head,0,-.075,.003),.054,.064]],fills.skin,.012);
  seam(offset(neck,0,.004,0),.052,.062,visibleFace,.010);
  if (away) {
    volume([[jaw,.036,.043],[offset(head,0,-.078,.027),.062,.071],
      [offset(head,0,-.035,.016),.076,.083],[offset(head,0,.023,.004),.085,.092],
      [offset(head,0,.076,-.011),.067,.074],[offset(head,0,.111,-.026),.030,.036]],fills.skin,.013);
    hair(ctx,point,head,look,cameraSide,size,fills.hair,ink);
  } else {
    drawPortrait(ctx,point(head),view.scale(place(head))*1.07,view.orbit);
  }
  ctx.restore();
}

function contactShadow(ctx,view,center,width,length,opacity) {
  if (view.depth(center)<1.8 || opacity<=0) return;
  ctx.save();
  for (const [radius,alpha] of [[1,.48],[.70,.52]]) {
    ctx.beginPath();
    for (let i=0;i<24;i++) {
      const angle=i*PI/12;
      const p=view.project([center[0]+width*radius*Math.cos(angle),.009,
        center[2]+length*radius*Math.sin(angle)]);
      if (i===0) ctx.moveTo(...p); else ctx.lineTo(...p);
    }
    ctx.closePath(); ctx.fillStyle='rgb(18,39,110)';
    ctx.globalAlpha=alpha*opacity; ctx.fill();
  }
  ctx.restore();
}

function groundWake(ctx,view,t,runner) {
  // Long, low arcs describe previous touches; their depth changes as the lens
  // crosses the run. A lighter companion line separates the two brush edges.
  const {project,depth}=view;
  for(let strand=0;strand<2;strand++) {
    const points=[];
    for(let i=0;i<=28;i++) {
      const f=i/28, back=(1-f)*9+.26;
      const p=[runner[0]+Math.sin(back*.44+t*4)*(.31+back*.23)+strand*.12,
        .035+Math.sin(f*PI)*.11*strand,runner[2]-back];
      if(depth(p)>.65) points.push(project(p));
    }
    if(points.length>2) brush(ctx,points,view.scale(runner)*(strand?.016:.047),
      strand?'rgba(232,244,255,.46)':'rgba(224,239,255,.33)',.68);
  }
}

function football(ctx,view,t,ball) {
  const center=view.project(ball), r=view.scale(ball)*.12;
  const ground=view.project([ball[0],.005,ball[2]]);
  ctx.save();
  ctx.strokeStyle='rgba(226,240,255,.36)'; ctx.lineWidth=1.1;
  ctx.beginPath(); ctx.ellipse(...ground,r*1.15,r*.19,-.08,.16,PI*1.92); ctx.stroke();
  if(t>strikeTime && t<impactTime) {
    const tail=[];
    for(let i=0;i<=18;i++) {
      const time=mix(Math.max(strikeTime,t-.026),t,i/18);
      tail.push(view.project(play(time).ball));
    }
    brush(ctx,tail,r*.23,'rgba(230,249,160,.60)',.85);
  }
  ctx.translate(...center); ctx.rotate(t*52);
  ctx.beginPath(); ctx.arc(0,0,r,0,2*PI); ctx.fillStyle=lime; ctx.fill();
  ctx.clip();
  ctx.strokeStyle='#2b479e'; ctx.lineWidth=r*.072;
  const corners=[];
  for(let i=0;i<5;i++) {
    const a=i*2*PI/5-.8;
    corners.push([r*(.12+.39*Math.cos(a)),r*(-.10+.39*Math.sin(a))]);
  }
  ctx.beginPath(); ctx.moveTo(...corners[0]);
  for(const p of corners.slice(1)) ctx.lineTo(...p);
  ctx.closePath(); ctx.stroke();
  for(const [x,y] of corners) {
    ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x*1.8-y*.17,y*1.7+x*.21,x*3.9-y*.52,y*3.1+x*.51); ctx.stroke();
  }
  ctx.restore();
}

function clearCopySpace(ctx,w,h,t) {
  const entry = ease(.22,.32,t)*(1-ease(.50,.60,t));
  const fixtures = ease(.68,.83,t);
  const opening = .75*(1-ease(.11,.22,t));
  if (w <= 704 || (!entry && !fixtures && !opening)) return;
  const fade = entry
    ? ctx.createLinearGradient(w*.52,0,w*.72,0)
    : ctx.createLinearGradient(w*.52,0,w*.29,0);
  fade.addColorStop(0,'transparent');
  fade.addColorStop(1,'#000');
  ctx.save();
  ctx.globalAlpha = .87*entry+fixtures+opening;
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = fade;
  ctx.fillRect(0,0,w,h);
  ctx.restore();
}

export function renderPlay(ctx,w,h,t) {
  ctx.clearRect(0,0,w,h);
  ctx.lineCap='round'; ctx.lineJoin='round';
  const {runner,ball,stride}=play(t);
  const view=camera(w,h,t,ball,runner);
  pitch(ctx,view,t);
  groundWake(ctx,view,t,runner);
  contactShadow(ctx,view,runner,.25,.46,.48-runner[1]);
  const runnerDraw=()=>athlete(ctx,view,runner,runnerPose(t,stride));
  const players=[{depth:view.depth(runner),draw:runnerDraw}];
  if(t>.16 && t<.65) {
    const {feet,pose}=tackle(t);
    const alpha=ease(.16,.28,t)*(1-ease(.52,.65,t));
    contactShadow(ctx,view,feet,.32,.58,.34*alpha);
    players.push({depth:view.depth(feet),draw:()=>{
      ctx.save();ctx.globalAlpha=.83*alpha;
      athlete(ctx,view,feet,pose,'defender');ctx.restore();
    }});
  }
  if (t > .59) {
    const {feet,pose} = goalkeeper(t);
    const bank=ease(.79,.92,t);
    contactShadow(ctx,view,feet,.27+.66*bank,.21,.42*ease(.59,.66,t)*(1-.55*Math.sin(PI*ease(.815,.954,t))));
    players.push({depth:view.depth(feet),draw:() => {
      ctx.save();
      ctx.globalAlpha *= ease(.59,.66,t);
      athlete(ctx,view,feet,pose,'keeper');
      ctx.restore();
    }});
  }
  players.push({depth:view.depth(ball),draw:()=>football(ctx,view,t,ball)});
  players.sort((a,b)=>b.depth-a.depth).forEach(item=>item.draw());
  clearCopySpace(ctx,w,h,t);
}
