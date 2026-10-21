'use strict';
// 行业模块：养生 / 推拿按摩（禾舒养生馆 · 示例门店）
//   技师：每人可做的项目、班次（如 10:00–18:00）、每周固定休息 + 按日期调休 → 指定技师或「到店安排」自动分配空闲技师
//   会员储值：充 500 送 50 / 充 1000 送 150 / 充 2000 送 400（顾客可模拟在线充值，前台可代充）；余额支付预约，取消自动退回
const { AppError, toHm } = require('../lib/util');
const U = require('../lib/util');

function techs(repo) { return repo.listResources().filter(r => r.kind === 'tech' && r.active); }

const IND = {
  slug: 'spa', brand: '禾舒养生馆', codePrefix: 'HS', dbName: 'spa.db', defaultIcon: 'leaf',
  features: ['therapists', 'shifts', 'any-therapist', 'balance-cards', 'self-recharge', 'therapist-reviews'],
  accounts: { owner: 'heshu2026', staff: '前台小禾（演示）', staff2: '店长助理（演示）' },
  terms: { resource: '技师', assignee: '技师', storePay: '到店支付', service: '项目', booking: '预约' },
  resourceMode: 'optional', resourceKind: 'tech',
  durations: [30, 45, 60, 75, 90, 120],
  rules: {
    review: { tagsPos: ['手法专业', '力度合适', '很放松', '环境安静', '准时守约', '服务贴心'], tagsNeg: ['力度不合适', '等待太久', '环境嘈杂', '推销办卡'] },
    feedback: { types: ['功能建议', '服务投诉', '技师相关', '预约问题', '其他'] },
  },
  dashboard(ctx) {
    const { repo } = ctx, d = U.today(), T = techs(repo), on = T.filter(r => ctx.ext.worksOn(r, d)).length;
    const t0 = U.startAt(d, 0);
    const sum = repo.db.prepare(`SELECT COALESCE(SUM(amount_cents),0) s FROM card_ledger WHERE kind IN ('open','recharge') AND at>=?`).get(t0).s;
    return { tiles: [{ k: '在岗技师', v: on + '/' + T.length }, { k: '今日储值', v: '¥' + Math.round(sum / 100) }] };
  },
  routes: {
    merchant(app, ctx) {
      // 技师排班：未来 7 天每位技师是否上班（固定休息 + 调休）与当天预约数
      app.get('/schedule', async () => {
        const { repo, ext } = ctx, days = []; for (let i = 0; i < 7; i++) days.push(U.ymd(U.addDays(new Date(), i)));
        return { days, techs: techs(repo).map(r => ({ ...ext.resDto(r, true), days: days.map(d => {
          const o = repo.db.prepare('SELECT off FROM resource_days WHERE resource_id=? AND date=?').get(r.id, d);
          return { date: d, works: ext.worksOn(r, d), override: !!o, count: repo.resourceBookingsOn(r.id, d) };
        }) })) };
      });
    },
  },
  seed(h) {
    const { repo, d } = h;
    repo.upsertShop({ name: '禾舒养生馆', phone: '0571-0000-0000', address: 'XX市XX区XX路 66 号 2 楼（示例地址）', open_min: 600, close_min: 1320, step_min: 30, book_days: 7, lead_min: 30, capacity: 4 });
    const SV = [
      { name: '肩颈推拿', img: 's1_neck', descr: '久坐低头族 · 放松肩颈', price: 128, dur: 60, icon: 'leaf', color: 0 },
      { name: '全身经络推拿', img: 's2_body', descr: '疏通经络 · 缓解疲劳', price: 198, dur: 90, icon: 'leaf', color: 1, hot: 1 },
      { name: '精油 SPA', img: 's3_oil', descr: '植物精油 · 舒缓放松', price: 268, dur: 90, icon: 'drop', color: 2, dep: 50 },
      { name: '中式足疗', img: 's4_foot', descr: '足浴 + 足底按摩', price: 118, dur: 60, icon: 'leaf', color: 3 },
      { name: '艾灸调理', img: 's5_moxa', descr: '温和艾灸 · 暖身驱寒', price: 98, dur: 45, icon: 'gem', color: 4 },
      { name: '头疗放松', img: 's6_head', descr: '头部按摩 · 助眠放松', price: 88, dur: 45, icon: 'leaf', color: 5 },
    ];
    const S = SV.map((s, i) => ({ ...s, id: repo.insertService({ name: s.name, descr: s.descr, price_cents: s.price * 100, duration_min: s.dur, icon: s.icon, color: s.color, hot: s.hot || 0, sort: i,
      deposit_on: s.dep ? 1 : 0, deposit_cents: (s.dep || 30) * 100, images: JSON.stringify(h.img(s.img)) }) }));
    const wd = n => U.addDays(new Date(), n).getDay();
    const T = [
      { name: '林师傅', title: '高级技师', tags: ['肩颈调理', '经络推拿'], sk: [0, 1, 4], s: 600, e: 1080, off: [wd(5)], color: '#C7D8C9', avatar: 0, intro: '手法沉稳，擅长办公族肩颈问题' },
      { name: '苏技师', title: '技师', tags: ['精油SPA', '头疗'], sk: [2, 5, 0], s: 720, e: 1320, off: [wd(2)], color: '#EAD9C3', avatar: 1, intro: '力度轻柔，适合第一次体验' },
      { name: '周师傅', title: '高级技师', tags: ['足疗', '艾灸'], sk: [3, 4, 1], s: 600, e: 1080, off: [wd(4)], color: '#D5CFE6', avatar: 2, intro: '足疗经验丰富，讲究穴位' },
      { name: '安技师', title: '技师', tags: ['精油SPA', '肩颈'], sk: [2, 0, 5], s: 840, e: 1320, off: [wd(6)], color: '#F1D5CF', avatar: 3, intro: '晚班为主，下班后也能约' },
    ].map((t, i) => ({ ...t, id: repo.insertResource({ kind: 'tech', name: t.name, title: t.title, tags: JSON.stringify(t.tags), skills: JSON.stringify(t.sk.map(k => S[k].id)), start_min: t.s, end_min: t.e,
      off_days: JSON.stringify(t.off), color: t.color, avatar: t.avatar, letter: t.name[0], intro: t.intro, sort: i, seed: 1 }) }));
    const P = [[500, 50], [1000, 150], [2000, 400]].map(([pay, bonus], i) => repo.insertCardProduct({ name: `储值 ${pay} 送 ${bonus}`, kind: 'balance', price_cents: pay * 100, bonus_cents: bonus * 100, discount: 1000, self_service: 1, sort: i }));
    const cid = p => repo.getCustomerByPhone(p).id;
    const ago = n => Date.now() - n * 864e5;
    const balCard = (phone, name, prod, pay, bonus, daysAgo) => {
      h.cust(phone, name);
      const id = repo.insertCard({ customer_id: cid(phone), product_id: prod, name: `储值 ${pay} 送 ${bonus}`, kind: 'balance', balance_cents: (pay + bonus) * 100, discount: 1000, level: `储值 ${pay} 送 ${bonus}`, seed: 1, created_at: ago(daysAgo) });
      repo.addLedger({ card_id: id, customer_id: cid(phone), kind: 'open', amount_cents: pay * 100, bonus_cents: bonus * 100, note: `储值 ${pay} 送 ${bonus}`, actor: 'owner', seed: 1, at: ago(daysAgo) });
      return id;
    };
    const ME = '13812345678';
    const K = { me: balCard(ME, '演示用户', P[0], 500, 50, 10), liu: balCard('13900001111', '刘女士', P[1], 1000, 150, 20), chen: balCard('13700002222', '陈先生', P[0], 500, 50, 1) };
    const pay = (k, phone, amt, bid, note, at) => { const c = repo.getCard(k); repo.updateCard(k, { balance_cents: c.balance_cents - amt * 100 }); if (bid) repo.updateBooking(bid, { paid_cents: amt * 100 });
      repo.addLedger({ card_id: k, customer_id: cid(phone), kind: 'pay', amount_cents: -amt * 100, booking_id: bid || null, note, actor: bid ? null : 'staff', seed: 1, at }); };
    pay(K.me, ME, 122, null, '到店消费 足疗（示例）', ago(8));
    // 今天的单：按当前时间决定状态（已过 → 已完成，进行中 → 已到店，未开始 → 待服务），避免示例单被判爽约
    const nowMin = h.nowMin;
    const st = (date, hm, dur) => { if (date !== h.today) return null; const m = U.toMin(hm); return m + dur <= nowMin ? 'done' : m <= nowMin ? 'arrived' : null; };
    const mk = (si, ti, date, hm, phone, name, status, o = {}) => { const s = S[si], x = st(date, hm, s.dur);
      const f = x && status === 'confirmed' ? { status: x, ...(x !== 'confirmed' ? { arrived_at: U.startAt(date, U.toMin(hm)) - 5 * 60000 } : {}) } : { status };
      return h.bk({ svc: { id: s.id, name: s.name }, price: s.price, dur: s.dur, date, hm, phone, name, resource_id: T[ti].id, extra: { lines: [{ label: s.name, amount: s.price }] }, ...o, ...f }); };
    const done = [
      mk(2, 1, d(-2), '16:00', ME, '演示用户', 'done'),
      mk(1, 0, d(-3), '15:00', '13400005555', '赵女士', 'done'),
      mk(3, 2, d(-4), '13:00', '13300006666', '孙先生', 'done'),
      mk(2, 1, d(-5), '18:00', '13200007777', '吴女士', 'done'),
      mk(0, 3, d(-6), '19:00', '13600003333', '何女士', 'done'),
      mk(4, 2, d(-7), '10:30', '13900001111', '刘女士', 'done', { pay_method: 'balance', card_id: K.liu }),
    ];
    pay(K.liu, '13900001111', 98, done[5], '预约 艾灸调理（周师傅）', ago(7));
    h.reviews(done, [
      [5, ['很放松', '服务贴心'], '精油味道很好闻，苏技师力度刚好，全程很安静。', 's3_oil', '谢谢喜欢～下次可以试试头疗哦'],
      [5, ['手法专业', '力度合适'], '肩膀松了很多，下次还约林师傅。', null, null],
      [5, ['很放松', '准时守约'], '足疗很舒服，师傅会讲解穴位。', 's4_foot', null],
      [4, ['环境安静'], '整体放松，就是周末有点难约。', null, '周末建议提前两三天预约～'],
      [3, ['力度不合适'], '肩颈力度对我来说偏轻了，下次会提前说。', null, '抱歉！可以在备注里写「力度重一点」，技师会按需调整。'],
      [5, ['手法专业'], '', null, null],
    ]);
    // 今天
    const a = mk(0, 0, d(0), '10:30', '13900001111', '刘女士', 'confirmed', { pay_method: 'balance', card_id: K.liu });
    pay(K.liu, '13900001111', 128, a, '预约 肩颈推拿（林师傅）', ago(1));
    mk(1, 0, d(0), '14:00', '13700002222', '陈先生', 'confirmed');
    mk(2, 1, d(0), '15:00', '13600003333', '何女士', 'confirmed');
    mk(3, 2, d(0), '11:00', '13500004444', '王先生', 'confirmed');
    const e = mk(5, 3, d(0), '19:30', '13900001111', '刘女士', 'confirmed', { pay_method: 'balance', card_id: K.liu });
    pay(K.liu, '13900001111', 88, e, '预约 头疗放松（安技师）', ago(0.5));
    // 未来
    const f = mk(0, 3, d(2), '20:30', ME, '演示用户', 'confirmed', { pay_method: 'balance', card_id: K.me });
    pay(K.me, ME, 128, f, '预约 肩颈推拿（安技师）', ago(1));
    mk(3, 2, d(1), '10:00', '13300006666', '孙先生', 'confirmed');
    mk(2, 3, d(3), '16:00', '13400005555', '赵女士', 'pending');
    // 爽约示例：周女士 90 天内爽约 2 次 → 默认规则下被限制
    mk(0, 0, d(-20), '11:00', '13100008888', '周女士', 'no_show', { noshow_by: 'manual' }); mk(5, 1, d(-9), '15:00', '13100008888', '周女士', 'no_show', { noshow_by: 'manual' });
    h.feedback('13400005555', '技师相关', '希望能看到技师近期的空闲时间。', 6, true, '已上线「技师」页的 7 天排班（示例）');
    h.feedback('13600003333', '预约问题', '周末晚上的时段很快就约满了。', 1, false);
  },
};
module.exports = IND;
