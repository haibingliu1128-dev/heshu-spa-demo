'use strict';
// 行业测试夹具：养生 / 推拿（core.test.js 通过它下单）
//   basic/dep：不指定技师（到店安排，自动分配空闲技师）；conc：指定苏技师（每周固定休息日为「今天 +2」，测试用的 D(5)/D(6) 都上班），同一时段只有 1 个名额
let su = null;
async function suId(H) { if (su) return su; su = (await H.api('GET', '/api/shop')).body.industry.resources.find(r => r.name === '苏技师').id; return su; }
module.exports = {
  slug: 'spa', brand: '禾舒养生馆', ownerPassword: 'heshu2026', staffDisplay: '前台小禾（演示）',
  serviceCount: 6, restrictedPhone: '13100008888',
  svc: { basic: 1, dep: 3, review: 2 }, depAmount: 50,
  cap: 1,
  T: ['12:00', '13:30', '15:00', '16:30', '18:00', '19:30'],   // 苏技师班次 12:00–22:00 内，60 分钟互不重叠
  overlap: t => { const [h, m] = t.split(':').map(Number), x = h * 60 + m + 30; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); },
  async body(H, tok, key, date, time) {
    const b = { serviceId: key === 'dep' ? 3 : 1, date, time, name: '测试' };
    if (key === 'conc') b.resourceId = await suId(H);
    return b;
  },
  async availCheck(H, a) {
    const day = a.days[0];
    if (day.slots.length) H.assert.ok(day.slots.every(x => x.time >= '10:00' && x.time < '22:00'));
  },
  async extraPhoneData(H, phone) {
    const r = await H.api('POST', '/api/merchant/cards', { phone, name: '打码测试', productId: 1 }, H.OWNER);
    if (r.status !== 201) throw new Error('充值失败 ' + JSON.stringify(r.body));
  },
  phoneUrls: ['/api/merchant/cards', '/api/merchant/ledger'],
};
