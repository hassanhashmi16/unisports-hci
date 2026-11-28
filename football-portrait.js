// Corresponding landmarks in the two supplied photographs. Coordinates are in
// source pixels so the hairline, brow, nose and beard keep their proportions
// as the camera travels from the opening three-quarter view to profile.
const front = ([x,y]) => [(x-169)*.55,(y-117)*.53];
const profile = ([x,y]) => [(507-x)*.205,(y-250)*.208];
const points = str => str.trim().split(/\s+/).map(pair=>pair.split(',').map(Number));
const mix = (a,b,u) => a+(b-a)*u;
const clamp = u => Math.min(1,Math.max(0,u));

function landmark(a,b) {
  return [points(a).map(front),points(b).map(profile)];
}

const face = landmark(
  '117,99 124,68 150,44 201,43 218,63 226,87 229,102 229,115 232,124 233,133 231,147 227,162 222,179 210,196 194,209 178,216 162,209 145,192 129,167 122,148 117,128',
  '688,250 685,109 587,56 470,68 390,104 357,153 338,193 349,215 355,232 340,266 318,307 322,321 351,334 349,352 360,377 365,451 394,483 461,492 531,454 575,363 651,316');
const cheek = landmark(
  '121,103 141,85 153,97 146,118 149,134 165,145 168,154 151,165 137,156 124,143',
  '565,218 505,179 476,201 487,236 469,272 429,307 423,337 463,361 524,339 571,302');
const cheekLight = landmark(
  '191,119 203,120 221,114 226,120 222,135 210,145 200,147 205,137',
  '415,261 429,258 457,244 465,250 451,267 425,288 408,305 415,283');
const nose = landmark(
  '180,105 186,108 189,123 195,136 201,141 199,146 192,148 185,146 180,145 174,146 174,142 180,136 182,124',
  '345,208 355,225 344,253 326,287 318,306 320,318 330,325 346,329 365,332 388,329 395,322 387,306 370,285');
const bridgeLight = landmark(
  '185,112 188,120 189,130 194,138 190,138 185,136',
  '351,234 346,247 335,270 321,301 326,306 334,296');
const nostril = landmark(
  '174,144 179,141 183,142 185,145 181,146 177,146',
  '343,325 355,315 368,315 385,322 375,329 362,325');
const brow = landmark(
  '146,107 151,101 161,98 173,99 183,103 180,109 172,106 162,104 153,106',
  '464,244 452,228 433,216 407,209 379,209 373,218 397,219 425,227 447,237');
const farBrow = landmark(
  '198,104 202,101 209,100 218,103 223,108 218,107 211,105 202,108',
  '350,210 347,207 342,204 340,201 338,198 340,205 345,212 350,216');
const socket = landmark(
  '147,110 154,105 165,103 178,106 181,110 176,116 168,120 158,118 151,115',
  '455,248 444,236 427,224 401,219 380,221 391,236 407,252 425,256 443,254');
const farSocket = landmark(
  '198,111 203,106 213,105 220,109 220,115 214,120 207,119 201,116',
  '352,221 350,215 345,211 341,207 343,217 346,226 350,230 354,230');
const ridge = landmark(
  '149,112 154,108 163,107 173,108 178,111 169,110 160,110 153,113',
  '453,249 442,240 428,233 414,231 394,235 408,235 426,238 441,244');
const farRidge = landmark(
  '200,112 206,109 214,109 219,112 213,112 206,111',
  '354,232 350,227 347,222 345,219 346,225 350,232');
const beard = landmark(
  '124,139 132,151 143,161 152,163 161,156 173,150 183,150 190,153 201,151 211,157 217,164 226,147 222,171 216,187 203,202 190,211 177,216 160,210 145,192 131,170',
  '572,291 552,316 524,341 491,349 460,350 426,350 400,345 382,339 366,337 350,339 350,355 357,365 362,392 362,435 370,467 388,485 427,491 470,489 527,454 563,387');
const chin = landmark(
  '145,177 155,185 171,190 179,196 194,193 202,188 198,201 182,211 165,205 152,194',
  '547,378 526,399 498,413 466,427 429,431 403,428 405,454 431,478 479,470 525,432');
const stubble = landmark(
  '121,132 129,138 138,148 149,153 160,150 167,148 159,158 151,166 141,165 130,154',
  '574,273 557,292 538,304 515,318 488,327 461,325 452,346 474,359 513,350 552,331');
const moustache = landmark(
  '158,167 162,157 175,151 183,149 188,152 194,150 202,152 210,162 211,168 201,162 193,160 185,162 178,160 169,161',
  '425,391 421,367 404,351 387,341 377,341 368,338 357,338 350,347 352,360 363,363 373,365 382,368 394,370 411,380');
const underLip = landmark(
  '169,174 178,176 186,177 197,173 195,180 186,184 178,182 173,181',
  '403,393 389,395 380,397 367,396 365,403 376,408 389,406 396,403');
const mouth = landmark(
  '164,166 173,162 181,161 186,162 194,161 201,164 203,167 195,170 185,172 175,170',
  '411,386 399,379 389,376 383,376 375,373 359,369 358,375 366,382 378,388 392,388');
const lip = landmark(
  '170,166 180,167 191,167 199,166 194,171 184,174 175,172',
  '402,383 389,385 378,387 364,384 369,394 382,396 395,390');
const hair = landmark(
  '117,111 115,90 119,65 131,43 148,27 164,23 176,21 187,26 203,32 218,43 226,55 225,68 218,64 210,63 195,63 181,63 164,61 150,59 141,67 136,83 127,93 124,109',
  '659,259 687,225 698,174 689,110 669,71 632,42 585,24 536,17 477,16 419,23 364,47 327,79 326,95 345,107 372,112 409,107 458,103 490,100 503,119 503,150 528,171 566,218');
const darkCrop = landmark(
  '117,92 119,66 129,46 145,31 161,25 175,22 186,27 204,32 218,43 225,55 225,65 215,61 201,61 182,61 163,58 149,58 141,63 134,78 129,84',
  '691,185 694,141 684,102 663,71 630,47 585,31 537,20 482,17 428,25 369,46 326,82 333,101 369,110 413,105 452,101 495,98 513,111 567,130 639,143');
const sweep = landmark(
  '137,44 148,31 157,30 171,35 189,41 205,45 218,54 202,49 183,46 161,38 150,36',
  '562,56 534,36 502,34 466,42 425,55 385,73 350,93 389,81 431,68 469,54 509,45');
const forelock = landmark(
  '136,41 146,28 143,29 153,22 152,25 165,19 162,23 175,20 182,26 171,26 159,28 147,33',
  '396,50 371,48 376,45 352,55 357,50 338,66 345,62 323,79 335,81 349,71 367,63 383,59');
const temple = landmark(
  '120,76 128,58 143,47 139,53 131,64 125,77 121,92',
  '684,160 665,130 622,107 639,122 665,144 678,167 685,188');
const ear = landmark(
  '122,111 116,107 110,105 106,109 104,123 106,137 113,149 121,152 127,146 129,136 126,128',
  '568,259 575,241 599,224 621,222 644,240 651,268 644,300 623,327 597,341 578,335 566,321');
const earFold = landmark(
  '110,114 115,111 120,117 124,128 121,133 116,134 117,141 113,137 110,127',
  '582,261 594,245 612,238 627,246 637,266 633,286 614,305 621,286 602,272');
const nape=points('-32,0 -32,-25 -20,-41 1,-46 17,-42 26,-30 31,-17 32,-8 33,-1 33,4 32,10 30,14 27,18 25,23 21,30 15,36 6,39 -6,38 -18,32 -25,21 -29,11');
const rearHair=points('-32,6 -35,-10 -34,-26 -28,-39 -17,-47 -6,-50 4,-51 14,-48 23,-42 29,-33 33,-22 34,-12 32,-2 29,8 23,14 15,18 6,20 -5,21 -14,19 -22,16 -28,11 -31,9');

function shape(ctx,p,color) {
  // Interpolating splines pass through the photographed landmarks, including
  // the break in the nose bridge and the corners of the cropped hairline.
  ctx.beginPath();
  ctx.moveTo(...p[0]);
  for(let i=0;i<p.length;i++) {
    const a=p[(i+p.length-1)%p.length], b=p[i], c=p[(i+1)%p.length], d=p[(i+2)%p.length];
    ctx.bezierCurveTo(b[0]+(c[0]-a[0])*.115,b[1]+(c[1]-a[1])*.115,
      c[0]-(d[0]-b[0])*.115,c[1]-(d[1]-b[1])*.115,...c);
  }
  ctx.closePath();
  if (color) {ctx.fillStyle=color;ctx.fill();}
}

export function drawPortrait(ctx,[x,y],scale,angle) {
  const turn=clamp((angle-.50)/(Math.PI/2-.50));
  const rear=clamp((angle-Math.PI/2)/(Math.PI/2));
  const retreat=Math.sin(rear*Math.PI/2);
  function draw(feature,color,back) {
    const p=feature[0].map(([ax,ay],i)=>{
      const [bx,by]=feature[1][i];
      const xx=mix(ax,bx,turn), yy=mix(ay,by,turn);
      if(back) return [mix(xx,back[i][0],retreat),mix(yy,back[i][1],retreat)];
      return [mix(xx,29+xx*.12,retreat),yy];
    });
    shape(ctx,p,color);
  }
  ctx.save();ctx.translate(x,y);ctx.rotate(.018+.055*Math.sin(angle));
  ctx.scale(scale*.00252,scale*.00252);
  draw(face,'#bcc1ce',nape);
  ctx.save();ctx.clip();ctx.globalAlpha*=1-clamp(rear*1.48);
  draw(cheek,'#9ca5b9');draw(cheekLight,'#cbd0d7');
  draw(stubble,'#798297');
  draw(beard,'#414253');draw(chin,'#2d3248');draw(moustache,'#363b4c');
  draw(underLip,'#797789');draw(mouth,'#202335');draw(lip,'#b9b0bd');
  draw(socket,'#8791a6');draw(farSocket,'#9097ab');
  draw(nose,'#a2a9bc');draw(bridgeLight,'#dae0e2');draw(nostril,'#44475a');
  draw(brow,'#333748');draw(farBrow,'#424655');
  draw(ridge,'#50596f');draw(farRidge,'#586076');
  ctx.restore();
  const fade=ctx.createLinearGradient(0,-27,0,23);
  fade.addColorStop(0,'#29334f');fade.addColorStop(.5,'#52607f');fade.addColorStop(1,'#8391b0');
  draw(hair,fade,rearHair);
  // The shorter dark crown leaves the tapered sides visible around the ear.
  const crown=rearHair.slice(0,darkCrop[0].length).map(([hx,hy],i)=>[hx,hy-(i>10?10:2)]);
  draw(darkCrop,'#202a45',crown);
  ctx.save();ctx.globalAlpha*=1-.88*rear;
  draw(sweep,'#39435b');draw(temple,'#37445f');
  ctx.globalAlpha*=1-rear;draw(forelock,'#252f48');ctx.restore();
  // The near ear moves across the temple through profile and behind the
  // outline at the nape. Its inner fold stays legible at hero scale.
  const rearEar=ear[1].map(([ex,ey])=>[ex*.37-23,ey*.64+3]);
  const rearFold=earFold[1].map(([ex,ey])=>[ex*.37-23,ey*.64+3]);
  draw(ear,'#b5bfd3',rearEar);draw(earFold,'#7989a9',rearFold);
  if (rear>.4) {
    ctx.globalAlpha*=clamp((rear-.4)/.45);
    shape(ctx,points('28,0 31,-4 34,-3 34,3 32,9 28,12 27,9'),'#acb5c9');
  }
  ctx.restore();
}
