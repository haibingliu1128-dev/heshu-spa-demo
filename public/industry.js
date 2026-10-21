/* 禾舒养生馆 · 行业前端模块：技师（擅长/班次/休息/评价）、指定技师或到店安排、会员储值（充值/余额支付/明细）、技师排班与储值管理 */
window.IND=function(Q){
var X=Q.X,S=Q.S,V=Q.V,I=Q.I,esc=Q.esc,api=Q.api;
var LEAFP='<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19c3-4 6-7 10-9"/>';
var LEAF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">'+LEAFP+'</svg>',LEAFF='<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.2">'+LEAFP+'</svg>';
var WALLET='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M16 12.5h2M3 9.5h18"/></svg>';
var CAL='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>';
var HAIRS=['M14 22c0-8 5-12 10-12s10 4 10 12c-2-4-6-6-10-6s-8 2-10 6z','M13 26c-1-10 4-16 11-16s12 6 11 16c-1-2-2-6-4-8-4 2-10 2-14 0-2 2-3 6-4 8z','M15 20c1-6 5-9 9-9s8 3 9 9c-3-2-6-3-9-3s-6 1-9 3z','M12 30c-2-12 3-20 12-20s14 8 12 20l-3-10c-5 1-13 1-18 0z'];
function tav(t,cls){return '<div class="tav'+(cls?' '+cls:'')+'"><svg viewBox="0 0 48 48"><rect width="48" height="48" fill="'+esc(t.color||'#C7D8C9')+'"/><path d="M8 48c1-9 8-13 16-13s15 4 16 13z" fill="#4C6B57"/><path d="M20 33h8v5h-8z" fill="#F1D3BC"/><ellipse cx="24" cy="23" rx="9" ry="10.5" fill="#F4DCC6"/><path d="'+HAIRS[(t.avatar||0)%4]+'" fill="#3A2F2A"/><circle cx="20.5" cy="24" r="1" fill="#3A2F2A"/><circle cx="27.5" cy="24" r="1" fill="#3A2F2A"/><path d="M22 28.5c1.2.8 2.8.8 4 0" stroke="#B5705A" stroke-width="1" fill="none" stroke-linecap="round"/></svg></div>'}
function P(){return Q.C.industry||{}}
function techs(){return (P().resources||[]).filter(function(r){return r.kind==='tech'&&r.active})}
function techById(id){return techs().filter(function(t){return t.id===+id})[0]}
function canDo(t,sid){return !t.skills.length||t.skills.indexOf(+sid)>=0}
function next7(){var o=[],d=Q.parseYmd(Q.today());for(var i=0;i<7;i++)o.push(Q.ymd(Q.addDays(d,i)));return o}
function dayShort(ds,i){return i===0?'今':i===1?'明':i===2?'后':Q.WEEK[Q.parseYmd(ds).getDay()]}
function wkHtml(t){return '<div class="wk">'+next7().map(function(ds,i){var off=t.offDays.indexOf(Q.parseYmd(ds).getDay())>=0;return '<span class="'+(off?'off':'')+'">'+dayShort(ds,i)+'<small>'+(off?'休':t.start.slice(0,2)+'-'+t.end.slice(0,2))+'</small></span>'}).join('')+'</div>'}
function stars(t){return t.rating&&t.rating.n?'<span class="stars">★ '+t.rating.avg.toFixed(1)+'</span><span class="mini">'+t.rating.n+' 条评价</span>':'<span class="mini">暂无评价</span>'}
function techCard(t,mode,on){
  return '<button class="tech'+(on?' on':'')+'" data-a="'+(mode==='pick'?'techPick':'techDetail')+'" data-v="'+t.id+'">'+tav(t)+'<div class="g"><div class="row2"><b>'+esc(t.name)+'</b><span class="lv">'+esc(t.title||'')+'</span><span style="flex:1"></span>'+stars(t)+'</div>'+
  '<div class="tagsx">'+t.tags.map(function(s){return '<span>擅长 '+esc(s)+'</span>'}).join('')+'</div><div class="mini" style="margin-top:4px">'+esc(t.intro||'')+'</div>'+wkHtml(t)+'</div>'+(mode==='pick'?'<span class="pick">'+(on?I.check:'')+'</span>':'')+'</button>'}
var MYC=null,REV={};
function balCard(){return MYC&&MYC.cards.filter(function(k){return k.kind==='balance'})[0]}
function loadMyCards(){if(!Q.ME.token)return Promise.resolve(null);return api('GET','/api/me/cards',null,'c').then(function(r){MYC=r;return r},function(){})}
function tiers(){return (P().cardProducts||[]).filter(function(p){return p.kind==='balance'&&p.selfService})}

Object.assign(X,{
  brand:'禾舒养生馆',brandSub:'推拿 · 足疗 · 艾灸 · SPA',heroTags:['可指定技师','会员储值有赠送','安静独立房间'],avatar:'禾',member:'禾舒会员',ownerPwd:'heshu2026',resLabel:'技师',
  tabs:[['home','首页',I.home,I.homeF],['techs','技师',LEAF,LEAFF],['book','预约',I.cal,I.calF],['mine','我的',I.user,I.userF]],
  flow:['book','tech','time','info','confirm'],stepNames:['选项目','选技师','选时间','填信息','确认'],
  bookTitle:'选择项目',svcTitle:'调理项目',hotTitle:'调理项目',notePh:'选填：如 力度重一点、肩颈怕凉',svcPh:'刮痧',staffPh:'前台小禾',timeWord:'到店时间',
  durations:[30,45,60,75,90,120],openSub:'可指定技师 · 也可到店安排',
  notice:'请按预约时间到店，迟到可能缩短服务时长；余额支付的预约取消后自动退回余额；',
  heroArt:function(){return '<svg class="hills" viewBox="0 0 390 150" preserveAspectRatio="none"><path d="M0 90 C60 50 110 60 160 85 S260 40 320 70 S380 80 390 75 V150 H0z" fill="#C5D6C3" opacity=".7"/><path d="M0 115 C70 90 130 100 200 118 S320 95 390 108 V150 H0z" fill="#A9C2A9" opacity=".75"/><circle cx="318" cy="38" r="20" fill="#F3E3C3" opacity=".9"/></svg><div class="seal">禾舒<br>养生</div>'},
  quick:[['startBook','',I.cal,'预约调理','#E7F0E9','#5E8B6E'],['tab','techs',LEAF,'选技师','#F6EEDF','#B8925A'],['goRecharge','',WALLET,'会员储值','#F3E6EC','#B26B86'],['toMerchant','',I.shop,'商家后台','#E6EEF4','#5C86A6']],
  keepRes:function(sid){var t=S.sel.resourceId&&techById(S.sel.resourceId);return !!t&&canDo(t,sid)},
  svcFilter:function(s){var t=S.sel.resourceId&&techById(S.sel.resourceId);return !t||canDo(t,s.id)},
  bookTop:function(){var t=S.sel.resourceId&&techById(S.sel.resourceId);return t?'<div class="tierbar">'+tav(t,'xs')+'<span>'+esc(t.name)+' 可做的项目</span><button class="lnk" data-a="techClear">不指定</button></div>':''},
  timeTop:function(){var t=S.sel.resourceId&&techById(S.sel.resourceId);
    return '<div class="card row2" style="padding:10px 12px">'+(t?tav(t,'sm'):'<div class="tav sm any">'+LEAF+'</div>')+'<div style="flex:1"><b>'+(t?esc(t.name)+' <span class="lv">'+esc(t.title||'')+'</span>':'到店安排')+'</b><div class="mini">'+(t?'班次 '+t.start+'-'+t.end+' · 灰色日期为休息日':'不指定技师，按时段自动安排空闲技师')+'</div></div></div>'},
  beforeNext:function(view){if(view==='tech'&&!S.sel.resourceId&&!S.sel.anyTech){Q.toast('请选择技师或「到店安排」');return false}},
  confirmRows:function(){var t=S.sel.resourceId&&techById(S.sel.resourceId);return '<div class="kv"><span>技师</span><span>'+(t?esc(t.name)+' · '+esc(t.title||''):'到店安排（自动分配空闲技师）')+'</span></div>'},
  successText:function(b){return (b.resourceName?esc(b.resourceName)+' 已为你留好时间':'已为你安排技师')+(b.payMethod==='balance'?'，已从会员余额扣款（取消自动退回）':'')},
  homeTop:function(){return '<div class="card intro"><div><b>'+esc((Q.C.shop||{}).open||'')+'-'+esc((Q.C.shop||{}).close||'')+'</b><span>营业时间</span></div><div><b>'+techs().length+' 位技师</b><span>可指定预约</span></div><div><b>会员储值</b><span>充值有赠送</span></div></div>'},
  homeMid:function(){var t=tiers(),k=balCard();return '<div class="vip"><div class="r"><div><div class="t">储值会员'+(k?' · 余额 ¥'+k.balance:'')+'</div><div class="mini" style="color:#F7EBD3;opacity:.85;margin-top:4px">'+t.map(function(x){return '充'+x.price+'送'+x.bonus}).join(' · ')+'（示例）</div></div><button class="btn" data-a="goRecharge">去充值</button></div></div>'},
  homeExtra:function(){var T=techs();return '<div class="sec-t">本店技师<small data-a="tab" data-v="techs" style="cursor:pointer">全部 ›</small></div><div class="card techstrip">'+T.map(function(t){return '<button data-a="techDetail" data-v="'+t.id+'">'+tav(t)+'<b>'+esc(t.name)+'</b><small>'+(t.rating&&t.rating.n?'★ '+t.rating.avg.toFixed(1):esc(t.title||''))+'</small></button>'}).join('')+'</div>'},
  mineExtra:function(){if(!Q.ME.token)return '';var k=balCard();
    return '<div class="pad" style="padding-bottom:0"><div class="vip"><div class="t">会员余额</div><div class="bal"><small>¥</small>'+(k?k.balance:0)+'</div><div class="r" style="margin-top:6px"><span class="mini" style="color:#F7EBD3;opacity:.85">'+(k?esc(k.level||k.name):'尚未开通储值')+'</span><span style="display:flex;gap:8px"><button class="btn ghostv" data-a="goLedger">明细</button><button class="btn" data-a="goRecharge">充值</button></span></div></div></div>'},
  mTiles:function(){return '<button data-a="goSched"><span class="qi" style="background:#E7F0E9;color:#5E8B6E">'+CAL+'</span><div><b>技师排班</b><span>7 天班次 · 调休</span></div></button>'+
    '<button data-a="goMem"><span class="qi" style="background:#F6EEDF;color:#B8925A">'+WALLET+'</span><div><b>储值会员</b><span>代充值 · 余额 · 流水</span></div></button>'},
  mviews:['msched','mmem'],liveViews:['techs','tdetail','recharge','ledger'],
  onBookErr:function(e){if(e.code==='RESOURCE_NOT_FOUND'||e.code==='NEED_RESOURCE'){Q.alertBox('请重新选择技师',e.message);S.stack=[];S.view='tech';Q.render(true);return true}}
});
X.enter.home=function(){if(Q.ME.token){loadMyCards().then(function(){if(S.view==='home')Q.render(false)});Q.loadMine().then(function(){if(S.view==='home')Q.render(false)},function(){})}};
X.enter.mine=X.enter.recharge=X.enter.ledger=function(){loadMyCards().then(function(){if(['mine','recharge','ledger'].indexOf(S.view)>=0)Q.render(false)})};
X.enter.tech=function(){var s=Q.svcById(S.sel.serviceId);if(S.sel.resourceId&&s&&!canDo(techById(S.sel.resourceId)||{skills:[]},s.id))S.sel.resourceId=null};
X.enter.tdetail=function(){var id=S.tid;api('GET','/api/reviews?resourceId='+id+'&limit=10').then(function(r){REV[id]=r;if(S.view==='tdetail')Q.render(false)},function(){})};
X.enter.msched=function(){Q.mLoad('msched')};X.enter.mmem=function(){Q.mLoad('mmem')};
var SCH=null,MEM=null,LED=null;
X.mload.msched=function(){return api('GET','/api/merchant/schedule',null,'m').then(function(r){SCH=r})};
X.mload.mmem=function(){return Promise.all([api('GET','/api/merchant/cards',null,'m'),api('GET','/api/merchant/ledger?kinds=open,recharge,pay,refund',null,'m')]).then(function(r){MEM=r[0];LED=r[1]})};

/* ---------- 顾客：选技师 / 技师团队 / 技师详情 ---------- */
V.tech=function(){var s=Q.svcById(S.sel.serviceId);if(!s)return V.book();var L=techs().filter(function(t){return canDo(t,s.id)});
  return {nav:Q.nav('选择技师',{back:true}),body:Q.steps('tech')+'<div class="pad"><div class="mini" style="margin:0 2px 10px">可做「'+esc(s.name)+'」的技师</div>'+L.map(function(t){return techCard(t,'pick',S.sel.resourceId===t.id)}).join('')+
    '<button class="tech'+(S.sel.anyTech&&!S.sel.resourceId?' on':'')+'" data-a="techPick" data-v="any"><div class="tav any">'+LEAF+'</div><div class="g"><b>到店安排</b><div class="mini" style="margin-top:4px">不指定技师，按时段自动安排空闲技师（可选时段更多）</div></div><span class="pick">'+(S.sel.anyTech&&!S.sel.resourceId?I.check:'')+'</span></button></div>',
    foot:'<div class="foot"><div class="sum">'+(S.sel.resourceId?esc(techById(S.sel.resourceId).name):S.sel.anyTech?'到店安排':'请选择技师')+'</div><button class="btn" data-a="flowNext"'+(S.sel.resourceId||S.sel.anyTech?'':' disabled')+'>下一步</button></div>'}};
V.techs=function(){return {nav:Q.nav('技师团队'),tab:true,body:'<div class="pad"><div class="mini" style="margin:0 2px 10px">每位技师有独立排班，可指定技师预约（示例技师）</div>'+techs().map(function(t){return techCard(t)}).join('')+'</div>'}};
V.tdetail=function(){var t=techById(S.tid);if(!t)return V.techs();var r=REV[t.id],C=Q.C;
  var svcs=C.services.filter(function(s){return canDo(t,s.id)});
  return {nav:Q.nav(esc(t.name),{back:true}),body:'<div class="pad"><div class="card" style="text-align:center;padding:20px 14px">'+tav(t,'lg')+'<b class="tn">'+esc(t.name)+'</b><span class="lv">'+esc(t.title||'')+'</span><div style="margin-top:4px">'+stars(t)+'</div><div class="tagsx" style="justify-content:center">'+t.tags.map(function(s){return '<span>擅长 '+esc(s)+'</span>'}).join('')+'</div><div class="mini" style="margin-top:8px">'+esc(t.intro||'')+'</div></div>'+
    '<div class="card"><div class="sec-t" style="margin:0 0 4px">近 7 天排班<small>班次 '+t.start+'-'+t.end+'</small></div>'+wkHtml(t)+'</div>'+
    '<div class="card"><div class="sec-t" style="margin:0 0 4px">可做项目</div>'+svcs.map(function(s){return '<div class="kv"><span>'+esc(s.name)+' · '+s.duration+'分钟</span><span class="price">'+s.price+'</span></div>'}).join('')+'</div>'+
    '<div class="card"><div class="sec-t" style="margin:0 0 4px">顾客评价<small>'+(r?r.summary.count+' 条':'')+'</small></div>'+(!r?Q.loading():r.items.length?r.items.map(function(x){return Q.reviewItem(x,true)}).join(''):'<div class="mini" style="padding:8px 0">暂无评价</div>')+'</div></div>',
    foot:'<div class="foot"><button class="btn" style="width:100%" data-a="bookTech" data-v="'+t.id+'">预约 '+esc(t.name)+'</button></div>'}};
X.act.techDetail=function(v){S.tid=+v;Q.go('tdetail')};
X.act.techPick=function(v){if(v==='any'){S.sel.resourceId=null;S.sel.anyTech=true}else{S.sel.resourceId=+v;S.sel.anyTech=false}S.sel.time=null;Q.AV=null;Q.render(false)};
X.act.techClear=function(){S.sel.resourceId=null;S.sel.anyTech=false;Q.render(false)};
X.act.bookTech=function(v){var keep=S.sel;S.sel=Q.newSel(keep);S.sel.resourceId=+v;S.stack=[];S.tab='book';Q.go('book')};

/* ---------- 顾客：储值 ---------- */
var RT=null;
X.act.goRecharge=function(){Q.needLogin(function(){RT=null;Q.go('recharge')})};
X.act.goLedger=function(){Q.go('ledger')};
X.act.rtPick=function(v){RT=+v;Q.render(false)};
V.recharge=function(){var L=tiers(),k=balCard();if(RT==null&&L.length)RT=L[Math.min(1,L.length-1)].id;var cur=L.filter(function(x){return x.id===RT})[0];
  return {nav:Q.nav('会员储值',{back:true}),body:'<div class="pad"><div class="vip"><div class="t">当前余额</div><div class="bal"><small>¥</small>'+(k?k.balance:0)+'</div></div><div class="sec-t">选择充值档位<small>赠送金额即时到账</small></div>'+
    L.map(function(x){return '<button class="tierR'+(RT===x.id?' on':'')+'" data-a="rtPick" data-v="'+x.id+'"><span><b>充 ¥'+x.price+'</b><small>到账 ¥'+(x.price+x.bonus)+'</small></span><span class="gift">送 ¥'+x.bonus+'</span></button>'}).join('')+
    '<div class="notice"><b>说明：</b>演示环境为<b>模拟支付</b>，不会真实扣款；正式上线需接入微信支付后开放。余额可用于预约任意项目，取消预约自动退回。</div></div>',
    foot:'<div class="foot"><div class="sum">'+(cur?'支付 <b class="price">'+cur.price+'</b><br><small class="muted">到账 ¥'+(cur.price+cur.bonus)+'</small>':'')+'</div><button class="btn" data-a="doRecharge"'+(cur?'':' disabled')+'>模拟支付并充值</button></div>'}};
X.act.doRecharge=function(){api('POST','/api/me/recharge',{productId:RT},'c').then(function(r){Q.toast('充值成功，到账 ¥'+(r.paid+r.bonus));return loadMyCards()}).then(function(){Q.back()},Q.fail)};
var LK={open:'开通储值',recharge:'充值',pay:'余额支付',refund:'取消退回',use:'核销',manual:'核销'};
V.ledger=function(){var L=MYC?MYC.ledger:null;
  return {nav:Q.nav('余额明细',{back:true}),body:'<div class="pad"><div class="card" style="padding:4px 14px">'+(!L?Q.loading():L.length?L.map(function(l){var amt=l.amount+(l.bonus||0);return '<div class="cell"><span class="t">'+esc(LK[l.kind]||l.kind)+(l.note?' <small class="muted">'+esc(l.note)+'</small>':'')+(l.seed?'<span class="demo-tag">示例</span>':'')+'<br><small class="muted">'+esc(new Date(l.at).toLocaleString('zh-CN',{hour12:false}))+'</small></span><b class="'+(amt>=0?'plus':'minus')+'">'+(amt>=0?'+':'')+amt+'</b></div>'}).join(''):'<div class="mini" style="padding:12px 0">暂无记录</div>')+'</div></div>'}};

/* ---------- 商家：技师排班 ---------- */
X.act.goSched=function(){Q.go('msched')};
V.msched=function(){var can=Q.can('service.manage');
  return {nav:Q.nav('技师排班',{back:true}),body:'<div class="pad"><div class="notice" style="margin-top:0">点日期切换「上班 / 休息」（调休）。已有预约的日期不能设为休息。'+(can?'':'<br>修改排班需店主授权「管理服务与图片」。')+'</div>'+(!SCH?Q.loading():SCH.techs.map(function(t){
    return '<div class="card"><div class="row2">'+tav(t,'sm')+'<div style="flex:1"><b>'+esc(t.name)+'</b> <span class="lv">'+esc(t.title||'')+'</span><div class="mini">班次 '+t.start+'-'+t.end+' · 每周固定休 '+t.offDays.map(function(x){return '周'+Q.WEEK[x]}).join('、')+'</div></div></div><div class="wk sched">'+
      t.days.map(function(x,i){return '<button class="'+(x.works?'':'off')+(x.override?' ovr':'')+'" data-a="schTog" data-v="'+t.id+'|'+x.date+'|'+(x.works?1:0)+'"'+(can?'':' disabled')+'>'+dayShort(x.date,i)+'<small>'+(x.works?(x.count?x.count+' 单':'上班'):'休息')+'</small></button>'}).join('')+'</div></div>'}).join(''))+'</div>'}};
X.act.schTog=function(v){var p=v.split('|');api('PUT','/api/merchant/resources/'+p[0]+'/day',{date:p[1],off:p[2]==='1'},'m').then(function(){Q.toast(p[2]==='1'?'已设为休息':'已设为上班');Q.mLoad('msched')},Q.fail)};

/* ---------- 商家：储值会员 ---------- */
X.act.goMem=function(){Q.go('mmem')};
var KN={open:'开通',recharge:'充值',pay:'余额支付',refund:'退回'};
V.mmem=function(){var h=Q.can('booking.handle');
  return {nav:Q.nav('储值会员',{back:true}),body:'<div class="pad">'+(h?'<button class="add" style="margin-top:0" data-a="memCharge">'+WALLET+'代顾客充值（线下收款）</button>':'')+
    '<div class="sec-t">会员余额</div>'+(!MEM?Q.loading():MEM.cards.filter(function(k){return k.kind==='balance'}).map(function(k){return '<div class="card mrow"><div><b>'+esc(k.cname||'顾客')+'</b> <span class="muted">'+esc(k.phone||'')+'</span>'+(k.seed?'<span class="demo-tag">示例</span>':'')+'<div class="mini">'+esc(k.level||k.name)+'</div></div><b class="price">'+k.balance+'</b></div>'}).join(''))+
    '<div class="sec-t">储值流水<small>开通 / 充值 / 余额支付 / 退回</small></div><div class="card" style="padding:4px 14px">'+(!LED?Q.loading():LED.length?LED.map(function(l){var amt=l.amount+(l.bonus||0);return '<div class="cell"><span class="t">'+esc(KN[l.kind]||l.kind)+' · '+esc(l.cname||'顾客')+' <small class="muted">'+esc(l.phone||'')+'</small><br><small class="muted">'+esc(l.note||'')+' · '+esc(new Date(l.at).toLocaleString('zh-CN',{hour12:false}))+'</small></span><b class="'+(amt>=0?'plus':'minus')+'">'+(amt>=0?'+':'')+amt+'</b></div>'}).join(''):'<div class="mini" style="padding:12px 0">暂无记录</div>')+'</div></div>'}};
X.act.memCharge=function(){var L=(P().cardProducts||[]).filter(function(p){return p.kind==='balance'});
  Q.sheet('代顾客充值','<div class="card" style="padding:2px 14px"><div class="field"><label>顾客称呼</label><input id="mc-name" maxlength="12" placeholder="如：王女士"></div><div class="field"><label>手机号</label><input id="mc-phone" type="tel" inputmode="numeric" maxlength="11" placeholder="11 位手机号"></div></div>'+
  '<div class="card"><div class="mini" style="margin-bottom:8px">充值档位</div><div class="chipsel" id="mc-prods">'+L.map(function(p,i){return '<button class="'+(i===0?'on':'')+'" data-a="mcPick" data-v="'+p.id+'">充'+p.price+'送'+p.bonus+'</button>'}).join('')+'</div><div class="mini" style="margin-top:8px">演示：线下收款后登记，不产生真实支付；已有余额的会员自动累加。</div></div>'+
  '<div style="display:flex;gap:10px"><button class="btn gray" style="flex:1" data-a="closeSheet">取消</button><button class="btn" style="flex:1" data-a="mcSave">确认充值</button></div>')};
X.act.mcPick=function(v,t){[].slice.call(document.querySelectorAll('#mc-prods button')).forEach(function(b){b.classList.remove('on')});t.classList.add('on')};
X.act.mcSave=function(){var on=document.querySelector('#mc-prods button.on'),b={name:document.getElementById('mc-name').value.trim(),phone:document.getElementById('mc-phone').value.trim(),productId:on?+on.getAttribute('data-v'):null};
  if(!/^1\d{10}$/.test(b.phone)){Q.toast('请输入正确的 11 位手机号');return}
  api('POST','/api/merchant/cards',b,'m').then(function(k){Q.closeSheet();Q.toast('已充值，余额 ¥'+k.balance);Q.mLoad('mmem')},Q.fail)};
};
