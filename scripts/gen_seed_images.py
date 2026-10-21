"""禾舒养生馆 · 示例项目配图（程序绘制）。用法：python scripts/gen_seed_images.py（需要 playwright + Chrome）"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from seedimg import *
OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'seed-images'
SKIN, HAIR, TOWEL = '#F4DCC6', '#3A2F2A', '#FFFFFF'
def leaf(x, y, s, r, c='#7FA88A'):
    return f'<path transform="translate({x} {y}) rotate({r}) scale({s})" d="M0 0 C 20 -30 60 -30 80 0 C 60 30 20 30 0 0Z" fill="{c}"/><path transform="translate({x} {y}) rotate({r}) scale({s})" d="M4 0 H76" stroke="#fff" stroke-width="2" opacity=".6"/>'
def stones(x, y):
    return f'<g transform="translate({x} {y})"><ellipse cx="0" cy="40" rx="90" ry="26" fill="#4A4A48"/><ellipse cx="10" cy="0" rx="70" ry="22" fill="#5E5E5B"/><ellipse cx="0" cy="-34" rx="50" ry="17" fill="#6F6F6B"/></g>'
def hands(x, y, s=1, r=0):
    h = '<path d="M0 0 c10 -30 40 -40 70 -30 c14 5 14 18 0 22 l-40 8 c-14 3 -24 10 -30 0z" fill="#EFC9A9"/>'
    return f'<g transform="translate({x} {y}) rotate({r}) scale({s})">{h}</g>'
IMGS = {}
IMGS['s1_neck'] = bg('#E7F0E9', '#F6FAF6', '#5E8B6E') + \
    '<path d="M300 760 C 300 560 400 500 540 500 C 680 500 780 560 780 760Z" fill="#E8EEE6"/><path d="M300 760 C 310 600 420 540 540 540 C 660 540 770 600 780 760Z" fill="#fff" opacity=".9"/>' + \
    f'<rect x="500" y="420" width="80" height="110" rx="30" fill="{SKIN}"/><ellipse cx="540" cy="330" rx="105" ry="120" fill="{SKIN}"/><path d="M430 320 c0 -110 60 -150 110 -150 s110 40 110 150 c-20 -60 -60 -80 -110 -80 s-90 20 -110 80z" fill="{HAIR}"/>' + \
    '<ellipse cx="540" cy="200" rx="70" ry="40" fill="' + HAIR + '"/>' + '<path d="M490 350 q18 12 36 0 M554 350 q18 12 36 0" stroke="#3A2F2A" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M525 405 q15 8 30 0" stroke="#B5705A" stroke-width="5" fill="none" stroke-linecap="round"/>' + hands(380, 540, 1.6, 10) + hands(700, 540, 1.6, 170) + \
    ''.join(sparkle(x, y, s, '#5E8B6E', .4) for x, y, s in [(260, 300, 3), (820, 280, 2.4), (860, 440, 1.8)]) + leaf(150, 600, 1.2, -30) + leaf(880, 620, 1.1, 200) + label('肩颈推拿 · 示例插画')
IMGS['s2_body'] = bg('#F6EEDF', '#FCF8F1', '#B8925A') + \
    '<rect x="140" y="470" width="800" height="70" rx="20" fill="#C9A47A"/><rect x="180" y="540" width="24" height="140" fill="#A88458"/><rect x="876" y="540" width="24" height="140" fill="#A88458"/>' + \
    '<rect x="150" y="420" width="780" height="70" rx="30" fill="#fff"/>' + f'<ellipse cx="250" cy="400" rx="70" ry="58" fill="{SKIN}"/><path d="M190 380 c10 -50 50 -70 80 -60 c30 8 50 30 46 60 c-30 -20 -80 -24 -126 0z" fill="{HAIR}"/>' + \
    f'<path d="M320 380 C 420 340 700 350 860 390 L 860 430 L 320 430Z" fill="{SKIN}"/><path d="M560 370 C 640 360 760 370 860 395 L 860 440 L 560 440Z" fill="#E8D6BD"/>' + \
    ''.join(f'<circle cx="{x}" cy="{y}" r="7" fill="#B8925A"/>' for x, y in [(380, 372), (430, 366), (480, 362), (530, 360)]) + '<path d="M370 372 Q 450 350 540 358" stroke="#B8925A" stroke-width="3" fill="none" stroke-dasharray="8 8"/>' + \
    hands(440, 330, 1.4, -20) + leaf(820, 220, 1.4, -30, '#B8925A') + leaf(200, 220, 1.0, 200, '#C9A47A') + label('全身经络推拿 · 示例插画')
IMGS['s3_oil'] = bg('#F3E6EC', '#FBF6F8', '#B26B86') + stones(330, 560) + \
    '<g transform="translate(600 250)"><rect x="40" y="-60" width="60" height="70" rx="10" fill="#6B4A3A"/><rect x="30" y="-90" width="80" height="36" rx="12" fill="#3A2E28"/><path d="M0 40 Q0 0 40 0 H100 Q140 0 140 40 V320 Q140 360 100 360 H40 Q0 360 0 320Z" fill="#C88AA2" opacity=".9"/><rect x="20" y="140" width="100" height="110" rx="10" fill="#fff" opacity=".85"/><path d="M50 195 c10 -30 30 -30 40 0 c-10 20 -30 20 -40 0z" fill="#B26B86"/></g>' + \
    '<path d="M840 330 C 850 360 860 375 860 392 A 20 20 0 0 1 820 392 C 820 375 830 360 840 330Z" fill="#E7B9C9"/>' + \
    leaf(150, 300, 1.4, -20) + leaf(820, 560, 1.3, 210) + ''.join(f'<circle cx="{x}" cy="{y}" r="14" fill="#F3C2D3"/>' for x, y in [(260, 460), (300, 430), (240, 420)]) + label('精油 SPA · 示例插画')
IMGS['s4_foot'] = bg('#E6EEF4', '#F5F9FC', '#5C86A6') + \
    '<path d="M300 420 H780 L740 680 Q735 700 715 700 H365 Q345 700 340 680Z" fill="#B88A5E"/>' + ''.join(f'<rect x="{x}" y="430" width="10" height="260" fill="#9C7046" opacity=".6"/>' for x in [400, 480, 560, 640]) + \
    '<rect x="290" y="400" width="500" height="40" rx="14" fill="#A07246"/><ellipse cx="540" cy="420" rx="230" ry="18" fill="#9FC6E0"/>' + \
    f'<path d="M430 140 C 410 260 420 330 440 400 L 520 400 C 520 320 510 230 500 140Z" fill="{SKIN}"/><path d="M570 150 C 560 260 570 330 590 400 L 660 400 C 660 320 650 240 640 150Z" fill="{SKIN}"/>' + \
    ''.join(f'<circle cx="{x}" cy="{y}" r="16" fill="#F2A7A0"/>' for x, y in [(360, 418), (700, 422), (620, 414)]) + bubbles([(250, 300, 22), (840, 280, 30), (880, 380, 16)], '#fff', .8) + leaf(170, 620, 1.2, -30) + label('中式足疗 · 示例插画')
IMGS['s5_moxa'] = bg('#F8E9DE', '#FDF7F2', '#C8763C') + \
    '<ellipse cx="540" cy="620" rx="200" ry="40" fill="#8C5A33"/><path d="M340 600 Q540 760 740 600Z" fill="#A86B3C"/>' + \
    '<g transform="rotate(-20 540 420)"><rect x="510" y="300" width="60" height="300" rx="14" fill="#E9D2A8"/><rect x="510" y="330" width="60" height="40" fill="#C8763C"/><ellipse cx="540" cy="300" rx="30" ry="12" fill="#E2502C"/></g>' + \
    '<path d="M500 280 C 460 230 540 200 500 150 C 470 110 520 80 500 40" stroke="#B9AFA6" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/><path d="M540 270 C 580 220 520 190 560 140" stroke="#CFC6BD" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/>' + \
    leaf(200, 380, 1.3, -30, '#9BB07A') + leaf(800, 420, 1.3, 210, '#9BB07A') + label('艾灸调理 · 示例插画')
IMGS['s6_head'] = bg('#ECE9F5', '#F8F7FC', '#7A6AAE') + \
    f'<ellipse cx="540" cy="460" rx="150" ry="170" fill="{SKIN}"/><path d="M390 450 c0 -170 80 -230 150 -230 s150 60 150 230 c-30 -90 -90 -130 -150 -130 s-120 40 -150 130z" fill="{HAIR}"/>' + \
    '<path d="M480 470 q20 12 40 0 M560 470 q20 12 40 0" stroke="#3A2F2A" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M520 540 q20 10 40 0" stroke="#B5705A" stroke-width="5" fill="none" stroke-linecap="round"/>' + \
    hands(400, 260, 1.8, 30) + hands(690, 270, 1.8, 150) + \
    '<text x="760" y="250" font-size="70" fill="#7A6AAE" font-family="sans-serif" opacity=".6">z</text><text x="820" y="190" font-size="50" fill="#7A6AAE" font-family="sans-serif" opacity=".45">z</text>' + \
    ''.join(sparkle(x, y, s, '#7A6AAE', .4) for x, y, s in [(240, 240, 3), (260, 600, 2)]) + label('头疗放松 · 示例插画')
render(OUT, IMGS)
