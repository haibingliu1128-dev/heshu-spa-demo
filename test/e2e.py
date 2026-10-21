"""端到端测试（禾舒养生馆）：顾客手机 + 商家后台两个独立浏览器上下文操作同一后端。
用法：先用临时数据库起服务，再 BASE=http://localhost:3201 python test/e2e.py ；SHOTS=目录 时顺便保存截图"""
import os, re, random
from playwright.sync_api import sync_playwright, expect
BASE = os.environ.get('BASE', 'http://localhost:3201')
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
SHOTS = os.environ.get('SHOTS')
PHONE = '177' + ''.join(random.choice('0123456789') for _ in range(8))
MPHONE = '176' + ''.join(random.choice('0123456789') for _ in range(8))
ok = lambda m: print('ok  ', m, flush=True)
def shot(pg, name, full=False):
    if SHOTS: os.makedirs(SHOTS, exist_ok=True); pg.wait_for_timeout(400); pg.evaluate("document.querySelectorAll('.toast').forEach(e=>e.remove())"); pg.screenshot(path=os.path.join(SHOTS, name + '.png'), full_page=full)
def confirm(pg):
    pg.wait_for_timeout(150)
    if pg.locator('.dlg [data-d="1"]').count(): pg.click('.dlg [data-d="1"]')

with sync_playwright() as p:
    br = p.chromium.launch(executable_path=CHROME)
    c = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True).new_page()
    m = br.new_context(viewport={'width': 430, 'height': 900}, device_scale_factor=2).new_page()
    errs = []
    for pg in (c, m): pg.on('pageerror', lambda e: errs.append(str(e)))

    m.goto(BASE + '/#merchant'); m.fill('#m-user', 'owner'); m.fill('#m-pass', 'wrong'); m.click('[data-a=mLogin]')
    expect(m.locator('.toast')).to_contain_text('用户名或密码错误')
    m.fill('#m-pass', 'heshu2026'); m.click('[data-a=mLogin]')
    expect(m.locator('.mhead')).to_contain_text('禾舒养生馆'); ok('商家登录')
    expect(m.locator('.stats')).to_contain_text('在岗技师'); expect(m.locator('.stats')).to_contain_text('今日储值'); ok('看板：在岗技师 / 今日储值')
    shot(m, 'merchant_dashboard')

    # 顾客首页
    c.goto(BASE + '/'); c.wait_for_selector('.tabbar')
    expect(c.locator('.hero')).to_contain_text('禾舒养生馆'); expect(c.locator('.intro')).to_contain_text('4 位技师')
    expect(c.locator('.svc .thumb.img img').first).to_be_visible(); ok('首页：项目配图')
    expect(c.locator('.techstrip button')).to_have_count(4); ok('首页：技师')
    shot(c, 'customer_home')
    c.evaluate("document.querySelector('.svc').scrollIntoView({block:'start'})"); shot(c, 'customer_home_services')

    # 储值：登录 → 模拟充值
    c.evaluate("window.scrollTo(0,0)"); c.click('.vip [data-a=goRecharge]')
    c.fill('#lg-phone', PHONE); c.click('[data-a=lgNext]'); c.click('[data-a=sms]')
    code = c.locator('#ab-demo-code').inner_text(timeout=5000).strip(); assert re.fullmatch(r'\d{6}', code)
    c.fill('#ab-code', code); c.click('[data-a=smsVerify]'); ok('短信验证码登录（演示显示验证码）')
    c.wait_for_selector('.tierR'); expect(c.locator('.tierR')).to_have_count(3)
    c.locator('.tierR').nth(1).click(); expect(c.locator('.foot')).to_contain_text('1150')
    shot(c, 'customer_recharge')
    c.click('[data-a=doRecharge]'); expect(c.locator('.toast')).to_contain_text('充值成功'); ok('模拟充值 1000 送 150')

    # 技师 → 技师详情（排班、评价）→ 预约该技师
    c.click('.tab:has-text("技师")'); expect(c.locator('.tech')).to_have_count(4)
    c.click('.tech:has-text("苏技师")'); expect(c.locator('.rvitem').first).to_be_visible(); expect(c.locator('.wk span')).to_have_count(7); ok('技师详情：7 天排班 + 顾客评价')
    shot(c, 'customer_tech_detail')
    c.click('[data-a=bookTech]'); expect(c.locator('.tierbar')).to_contain_text('苏技师 可做的项目')
    expect(c.locator('.svc')).to_have_count(3); ok('只显示该技师会做的项目')
    shot(c, 'customer_booking_service')
    c.click('.svc[data-v="3"]'); c.click('.foot .btn')
    expect(c.locator('.tech.on')).to_contain_text('苏技师'); ok('选技师步骤：已预选苏技师')
    shot(c, 'customer_booking_tech')
    c.click('.foot .btn'); c.wait_for_selector('.date')
    c.locator('.date:not(.off)').nth(1).click(); c.locator('.slot:not([disabled])').first.click()
    shot(c, 'customer_booking_time')
    c.click('.foot .btn')
    if c.locator('#f-name').input_value() == '': c.fill('#f-name', 'E2E')
    c.click('.foot .btn'); c.wait_for_selector('.ticket')
    expect(c.locator('.ticket')).to_contain_text('苏技师')
    c.click('[data-a=payPick][data-v^="balance"]'); expect(c.locator('.foot')).to_contain_text('储值扣款'); ok('确认页：选择余额支付')
    shot(c, 'customer_booking_confirm')
    c.click('.foot .btn[data-a=submit]'); c.wait_for_selector('.succ h2'); ok('提交：' + c.locator('.succ h2').inner_text())

    # 商家端实时看到 → 技师排班 → 储值会员
    m.click('[data-a=mTab][data-v=upcoming]')
    card = m.locator(f'.card.bk:has-text("{PHONE[-4:]}")').first
    expect(card).to_contain_text('苏技师', timeout=8000); ok('商家端实时出现新预约，带指定技师')
    m.click('[data-a=goSched]'); m.wait_for_selector('.wk.sched'); expect(m.locator('.wk.sched')).to_have_count(4)
    shot(m, 'merchant_schedule')
    zhou = m.locator('.card:has-text("周师傅") .wk.sched button:not(.off)').last
    zv = zhou.get_attribute('data-v'); zhou.click(); expect(m.locator('.toast')).to_contain_text('已设为休息')
    m.locator(f'[data-a=schTog][data-v^="{zv.rsplit("|",1)[0]}"]').click(); expect(m.locator('.toast')).to_contain_text('已设为上班'); ok('技师调休：设为休息 → 恢复上班')
    m.click('.nav [data-a=back]')
    m.click('[data-a=goMem]'); m.wait_for_selector('.card.mrow')
    expect(m.locator('.card.mrow').first).to_be_visible()
    m.click('[data-a=memCharge]'); m.fill('#mc-name', '测试女士'); m.fill('#mc-phone', MPHONE); m.click('[data-a=mcSave]')
    expect(m.locator('.toast')).to_contain_text('已充值，余额 ¥550'); ok('前台代充值')
    expect(m.locator(f'.card.mrow:has-text("{MPHONE[-4:]}")')).to_contain_text('550')
    shot(m, 'merchant_members')

    # 店员：排班只读、可代充值、手机号打码
    s = br.new_context(viewport={'width': 430, 'height': 900}).new_page(); s.on('pageerror', lambda e: errs.append(str(e)))
    s.goto(BASE + '/#merchant'); s.fill('#m-user', 'staff'); s.fill('#m-pass', 'staff2026'); s.click('[data-a=mLogin]')
    expect(s.locator('.mhead')).to_contain_text('前台小禾')
    s.click('[data-a=goSched]'); s.wait_for_selector('.wk.sched'); assert s.locator('.wk.sched button[disabled]').count() == 28
    s.click('.nav [data-a=back]'); s.click('[data-a=goMem]'); s.wait_for_selector('.card.mrow')
    expect(s.locator(f'.card.mrow:has-text("{MPHONE[-4:]}")')).to_contain_text(MPHONE[:3] + '****'); expect(s.locator('[data-a=memCharge]')).to_have_count(1)
    ok('店员：排班只读、可代充值、手机号打码')
    assert not errs, errs
    ok('无前端报错')
    br.close()
print('E2E PASS')
