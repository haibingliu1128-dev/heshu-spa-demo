'use strict';
// 养生行业功能测试：技师（擅长/班次/休息/调休）、指定技师与到店安排、技师评价、会员储值（充值/余额支付/退回/代充值）、看板
const { test, before, after } = require('node:test');
const { harness } = require('./helpers');
const H = harness(), { assert, D, api, login, newPhone } = H;
let OWNER, STAFF, TT;
before(async () => { await H.start(); ({ OWNER, STAFF } = H); TT = Object.fromEntries((await api('GET', '/api/shop')).body.industry.resources.map(r => [r.name, r])); });
after(() => H.stop());
const U = () => require('../src/lib/util');
const wdOf = n => U().parseYmd(D(n)).getDay();
/** 技师 t 在未来 1..6 天里第一个上班 / 休息的日子 */
const dayWhere = (t, works) => { for (let n = 1; n <= 6; n++) if (t.offDays.includes(wdOf(n)) !== works) return n; return null; };

test('技师公开信息：擅长项目、班次、每周休息、评分；评价可按技师筛选', async () => {
  const shop = (await api('GET', '/api/shop')).body;
  assert.equal(shop.industry.resources.length, 4); assert.equal(shop.industry.resourceMode, 'optional');
  const lin = TT['林师傅'];
  assert.equal(lin.start, '10:00'); assert.equal(lin.end, '18:00'); assert.equal(lin.offDays.length, 1); assert.deepEqual(lin.skills, [1, 2, 5]);
  assert.ok(TT['苏技师'].rating.n >= 2 && TT['苏技师'].rating.avg > 4);
  const all = (await api('GET', '/api/reviews?limit=30')).body, su = (await api('GET', '/api/reviews?limit=30&resourceId=' + TT['苏技师'].id)).body;
  assert.ok(su.items.length >= 2 && su.items.length < all.items.length); assert.equal(su.summary.count, su.items.length);
  assert.ok(su.items.every(x => ['精油 SPA', '头疗放松', '肩颈推拿'].includes(x.serviceName)));
  assert.ok(!JSON.stringify(su).includes('1340000'), '公开评价不含手机号');
});

test('指定技师：休息日/班次外不可约、不会做的项目被拒、同一技师同一时段只能约一次；到店安排自动分配空闲技师', async () => {
  const su = TT['苏技师'], zhou = TT['周师傅'], an = TT['安技师'];
  const off = dayWhere(su, false);
  let a = (await api('GET', `/api/availability?serviceId=1&resourceId=${su.id}&from=${D(off)}&days=1`)).body.days[0];
  assert.ok(a.slots.every(x => !x.ok)); assert.equal(a.free, 0);
  const on = dayWhere(su, true);
  a = (await api('GET', `/api/availability?serviceId=1&resourceId=${su.id}&from=${D(on)}&days=1`)).body.days[0];
  assert.equal(a.slots.find(x => x.time === '10:00').why, '非排班'); assert.equal(a.slots.find(x => x.time === '13:00').ok, true);
  const t1 = await login(newPhone()), t2 = await login(newPhone()), t3 = await login(newPhone());
  assert.equal((await api('POST', '/api/bookings', { serviceId: 1, resourceId: zhou.id, date: D(on), time: '13:00', name: '甲' }, t1)).body.error.code, 'RESOURCE_SKILL');
  assert.equal((await api('POST', '/api/bookings', { serviceId: 1, resourceId: su.id, date: D(off), time: '13:00', name: '甲' }, t1)).body.error.code, 'RESOURCE_OFF');
  assert.equal((await api('POST', '/api/bookings', { serviceId: 1, resourceId: su.id, date: D(on), time: '11:00', name: '甲' }, t1)).body.error.code, 'RESOURCE_SHIFT');
  const b1 = await api('POST', '/api/bookings', { serviceId: 1, resourceId: su.id, date: D(on), time: '13:00', name: '甲' }, t1);
  assert.equal(b1.status, 201, JSON.stringify(b1.body)); assert.equal(b1.body.booking.resourceName, '苏技师');
  const b2 = await api('POST', '/api/bookings', { serviceId: 1, resourceId: su.id, date: D(on), time: '13:30', name: '乙' }, t2);
  assert.equal(b2.status, 409); assert.equal(b2.body.error.code, 'SLOT_TAKEN');
  // 到店安排：13:00 苏技师已约 → 自动分配其他会做肩颈且在班的技师
  const b3 = await api('POST', '/api/bookings', { serviceId: 1, date: D(on), time: '13:00', name: '丙' }, t3);
  if (b3.status === 201) assert.notEqual(b3.body.booking.resourceName, '苏技师');
  else assert.equal(b3.body.error.code, 'SLOT_TAKEN');
  // 安技师 14:00 才上班：指定安技师的 13:00 不可约
  const anOn = dayWhere(an, true);
  a = (await api('GET', `/api/availability?serviceId=1&resourceId=${an.id}&from=${D(anOn)}&days=1`)).body.days[0];
  assert.equal(a.slots.find(x => x.time === '13:00').ok, false); assert.equal(a.slots.find(x => x.time === '14:00').ok, true);
});

test('排班调休：店主可把某天设为休息/上班；已有预约的日子不能设休息；店员默认无权限；排班接口返回 7 天', async () => {
  const lin = TT['林师傅'];
  const sch0 = (await api('GET', '/api/merchant/schedule', null, OWNER)).body.techs.find(x => x.id === lin.id).days;
  const on = sch0.findIndex((x, i) => i >= 1 && x.works && !x.count);   // 上班且当天还没有预约的一天
  const t = await login(newPhone());
  const b = await api('POST', '/api/bookings', { serviceId: 1, resourceId: lin.id, date: D(on), time: '10:00', name: '调休' }, t);
  assert.equal(b.status, 201, JSON.stringify(b.body));
  assert.equal((await api('PUT', `/api/merchant/resources/${lin.id}/day`, { date: D(on), off: true }, OWNER)).body.error.code, 'HAS_BOOKINGS');
  await api('POST', `/api/bookings/${b.body.booking.id}/cancel`, null, t);
  assert.equal((await api('PUT', `/api/merchant/resources/${lin.id}/day`, { date: D(on), off: true }, STAFF)).status, 403);
  assert.equal((await api('PUT', `/api/merchant/resources/${lin.id}/day`, { date: D(on), off: true }, OWNER)).status, 200);
  let a = (await api('GET', `/api/availability?serviceId=1&resourceId=${lin.id}&from=${D(on)}&days=1`)).body.days[0];
  assert.ok(a.slots.every(x => !x.ok));
  const sch = (await api('GET', '/api/merchant/schedule', null, OWNER)).body;
  assert.equal(sch.days.length, 7); const d = sch.techs.find(x => x.id === lin.id).days.find(x => x.date === D(on));
  assert.equal(d.works, false); assert.equal(d.override, true);
  // 固定休息日也可以临时上班
  const off = dayWhere(lin, false);
  assert.equal((await api('PUT', `/api/merchant/resources/${lin.id}/day`, { date: D(off), off: false }, OWNER)).status, 200);
  a = (await api('GET', `/api/availability?serviceId=1&resourceId=${lin.id}&from=${D(off)}&days=1`)).body.days[0];
  assert.ok(a.slots.some(x => x.ok));
  await api('PUT', `/api/merchant/resources/${lin.id}/day`, { date: D(on), off: false }, OWNER);
  await api('PUT', `/api/merchant/resources/${lin.id}/day`, { date: D(off), off: true }, OWNER);
});

test('会员储值：模拟在线充值（赠送到账、多次累加）、余额支付预约、取消自动退回、余额不足被拒；前台代充值需处理预约权限；看板指标', async () => {
  const phone = newPhone(), tok = await login(phone, '储值测试');
  const prods = (await api('GET', '/api/me/cards', null, tok)).body.products;
  assert.deepEqual(prods.map(p => [p.price, p.bonus]), [[500, 50], [1000, 150], [2000, 400]]);
  const r1 = await api('POST', '/api/me/recharge', { productId: prods[0].id }, tok);
  assert.equal(r1.status, 201, JSON.stringify(r1.body)); assert.equal(r1.body.card.balance, 550); assert.equal(r1.body.mock, true);
  const r2 = await api('POST', '/api/me/recharge', { productId: prods[1].id }, tok);
  assert.equal(r2.body.card.balance, 1700); assert.equal(r2.body.card.id, r1.body.card.id, '同一张储值卡累加');
  const card = r2.body.card;
  const q = await api('POST', '/api/quote', { serviceId: 3, date: D(3), time: '15:00' }, tok);
  assert.ok(q.body.payOptions.some(o => o.method === 'balance' && o.ok), JSON.stringify(q.body.payOptions));
  const b = await api('POST', '/api/bookings', { serviceId: 3, date: D(3), time: '15:00', name: '储值测试', payMethod: 'balance', cardId: card.id }, tok);
  assert.equal(b.status, 201, JSON.stringify(b.body)); assert.equal(b.body.booking.payMethod, 'balance'); assert.equal(b.body.booking.status === 'awaiting_payment', false, '余额支付不再收定金');
  let me = (await api('GET', '/api/me/cards', null, tok)).body;
  assert.equal(me.cards[0].balance, 1700 - 268); assert.ok(me.ledger.some(l => l.kind === 'pay' && l.amount === -268));
  await api('POST', `/api/bookings/${b.body.booking.id}/cancel`, null, tok);
  me = (await api('GET', '/api/me/cards', null, tok)).body;
  assert.equal(me.cards[0].balance, 1700, '取消退回'); assert.ok(me.ledger.some(l => l.kind === 'refund' && l.amount === 268));
  // 余额不足
  const poor = newPhone(), pt = await login(poor, '余额少');
  const k = (await api('POST', '/api/merchant/cards', { phone: poor, name: '余额少', productId: prods[0].id }, STAFF)).body;
  H.R.updateCard(k.id, { balance_cents: 5000 });
  const bad = await api('POST', '/api/bookings', { serviceId: 3, date: D(3), time: '16:30', name: '余额少', payMethod: 'balance', cardId: k.id }, pt);
  assert.equal(bad.status, 409); assert.equal(bad.body.error.code, 'CARD_UNUSABLE');
  // 代充值权限
  await H.grant({ 'booking.handle': false });
  assert.equal((await api('POST', '/api/merchant/cards', { phone: poor, productId: prods[0].id }, STAFF)).status, 403);
  await H.grant({ 'booking.handle': true });
  const k2 = (await api('POST', '/api/merchant/cards', { phone: poor, productId: prods[0].id }, STAFF)).body;
  assert.equal(k2.balance, 50 + 550); assert.match(k2.phone, H.MASK);
  const tiles = (await api('GET', '/api/merchant/dashboard', null, OWNER)).body.industry.tiles;
  assert.equal(tiles[0].k, '在岗技师'); assert.match(tiles[0].v, /^\d\/4$/);
  assert.equal(tiles[1].k, '今日储值'); assert.ok(+tiles[1].v.slice(1) >= 500 + 1000 + 500 + 500, tiles[1].v);
});
