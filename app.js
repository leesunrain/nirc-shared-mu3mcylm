let sex='male', dist=1000;
const $=id=>document.getElementById(id);
document.querySelectorAll('#sexSeg button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#sexSeg button').forEach(x=>x.classList.remove('active'));b.classList.add('active');sex=b.dataset.sex});
document.querySelectorAll('#distSeg button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#distSeg button').forEach(x=>x.classList.remove('active'));b.classList.add('active');dist=+b.dataset.dist;$('hh').value='0';$('mm').value='';$('ss').value='';});
function fmt(sec){sec=Math.round(sec);let h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function short(sec){sec=Math.round(sec);let m=Math.floor(sec/60),s=sec%60;return `${m}:${String(s).padStart(2,'0')}`}
function pace(sec,dKm){return short(sec/dKm)}
function vdotFor(distanceM, seconds){
  const t=seconds/60, v=distanceM/t;
  const vo2=-4.60+0.182258*v+0.000104*v*v;
  const pct=0.8+0.1894393*Math.exp(-0.012778*t)+0.2989558*Math.exp(-0.1932605*t);
  return vo2/pct;
}
function timeForVdot(distanceM, target){
  let lo=30,hi=600;
  for(let i=0;i<80;i++){let mid=(lo+hi)/2;let val=vdotFor(distanceM,mid*60); if(val>target) lo=mid; else hi=mid}
  return ((lo+hi)/2)*60;
}
function tenFromInput(sec){
  if(dist===1000) return (sec + (sex==='male'?40:30))*10;
  if(dist===5000) return sec*2+90;
  return sec;
}
function myFormula(ten){
  let addHalf=ten<=2400?480:(ten<=3000?540:600);
  let half=ten*2+addHalf;
  let full=half*2+(sex==='female'?600:780);
  return {half,full,addHalf};
}
$('calc').onclick=()=>{
  let h=+$('hh').value||0,m=+$('mm').value||0,s=+$('ss').value||0;
  let input=h*3600+m*60+s;
  $('error').textContent='';
  if(!input || m>59 || s>59){$('error').textContent='올바른 기록을 입력해 주세요.';return}
  let plausible=(dist===1000?input<900:dist===5000?input<3600:input<7200);
  if(!plausible){$('error').textContent='입력 기록과 선택한 거리를 다시 확인해 주세요.';return}
  let ten=tenFromInput(input);
  let my=myFormula(ten);

  // VDOT은 사용자가 실제로 입력한 거리/기록 자체에서 계산
  let vd=vdotFor(dist,input);
  let vdFull=timeForVdot(42195,vd);
  let avg=(vdFull+my.full)/2;

  $('tenEq').textContent=fmt(ten);
  $('tenPace').textContent=`페이스 ${pace(ten,10)}/km`;
  $('vdotTime').textContent=fmt(vdFull);
  $('vdotPace').textContent=`${pace(vdFull,42.195)}/km`;
  $('vdotNum').textContent=`VDOT ${vd.toFixed(1)}`;
  $('myTime').textContent=fmt(my.full);
  $('myPace').textContent=`${pace(my.full,42.195)}/km`;
  $('avgTime').textContent=fmt(avg);
  $('avgPace').textContent=`${pace(avg,42.195)}/km`;

  let first = dist===1000
    ? `1000m → 10km: 1000m 페이스 + ${sex==='male'?'40':'30'}초/km = 10km ${fmt(ten)}`
    : dist===5000
    ? `5km → 10km: 5km × 2 + 1분 30초 = 10km ${fmt(ten)}`
    : `입력 10km 기록 = ${fmt(ten)}`;
  let band=my.addHalf===480?'40분 이내 → +8분':my.addHalf===540?'40분 초과~50분 → +9분':'50분 초과 → +10분';
  $('formulaText').innerHTML=`${first}<br>10km → 하프: 10km × 2 + 보정 (${band}) = <b>${fmt(my.half)}</b><br>하프 → 풀: 하프 × 2 + ${sex==='female'?'10분(여자)':'13분(남자)'} = <b>${fmt(my.full)}</b>`;
  $('results').classList.remove('hidden');
  $('results').scrollIntoView({behavior:'smooth',block:'start'});
};
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}