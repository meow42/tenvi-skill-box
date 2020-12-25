var g_debug = 0;
var dbg_text_data;
var data_file_name;
if (g_debug == 1) {
	data_file_name = '';
}else {
	data_file_name = 't.uf8'/*tpa=http://cfd.178.com/s/moniqi/jl/t.uf8*/;
}
var thisURL = document.location.href;
var httpObj;
var timerId;
var timeout_sec = 30; //タイムアウトの秒数

var strKeiretuStr = new Array('n/a', '斬刃', '細菌');
var g_wakeup_level = new Array(0, 10, 30, 50, 70, 90, 110);

var build_code_version1 = 1;
var build_code_version2 = 2;
//var build_code_version = 1;
var disp_popup = true;
var loaded = false;
var main_skill_num = 53;
var all_skill_num = 73;
var max_upg_num = 3;

var page_begin = new Array();
var page_end = new Array();

var page1_begin = 13;
var page1_end = 33;
var page2_begin = 34;
var page2_end = 53;
//var page3_begin = 44;
//var page3_end = 46;
var now_select_page = 0;
var wakeup_page = 3;

// 0:なし 1:斬刃 2:細菌
var upgrade_flag = 0;
// +1～+3
var upgrade_add = 0;

var page_num = 3;
var g_tab_names = new Array('tab1', 'tab2', 'tab4');
var g_tab_nums = new Array(1, 2, 4);

var page_use_point = new Array();
//var page1_use_point = 0;
//var page2_use_point = 0;
//var page3_use_point = 0;

/*
var sim_pc_level = 4;
var sim_have_point = (sim_pc_level - 3) * 2;
if (sim_have_point < 0) {
	sim_have_point = 0;
}
if (sim_pc_level >= 60) {
	sim_have_point += 2;
}
var sim_left_point = sim_have_point;
*/
var sim_pc_level = 4;
var sim_pc_wakeup = '0';
var sim_have_point;
var sim_left_point;
resetPointParam(4);

var now_point_icon = new Object();
now_point_icon.index = -1;
now_point_icon.x = -1;
now_point_icon.y = -1;

var skill_list = new Array();

// 縦に往復の順で並べ直すと圧縮効率がいい
// 更にバージョン違いを吸収できる
// シルヴァ1.0s
/*
var ver1_bcode_table = new Array(
1,6,11,2,7,
12,3,8,13,9,
4,5,10,
14,15,16,17,
20,19,18,
22,23,24,
26,25,
27,28,29,30,
33,32,31,
35,37,38,39,
36,
40,41,42,
45,44,43,
47,48,49,
52,51,50);
*/
//タリー1.0t
/*
var ver1_bcode_table = new Array(
1,4,8,2,
9,5,6,7,
10,11,12,3,
14,13,15,16,17,
21,20,19,18,22,23,24,
27,26,25,
28,29,30,31,
34,33,32,
35,36,37,
40,39,38,
41,42,43,
46,45,44,
47,48
);
*/
var ver1_bcode_table = new Array(
1,4,8,2,9,5,6,7,10,11,12,3,
14,13,15,16,17,
22,21,20,19,23,24,25,
28,27,26,30,31,32,33,
36,35,34,37,38,39,43,42,41,
45,46,47,50,49,48,
52,53
);
var ver2_bcode_table = new Array(
1,4,8,2,9,5,6,7,10,11,12,3,
14,13,15,16,17,18,
22,21,20,19,23,24,25,
29,28,27,26,30,31,32,33,
36,35,34,37,38,39,40,
44,43,42,41,
45,46,47,
51,50,49,48,
52,53
);

function putDebugInfo(info)
{
	var code_edit = document.getElementById('code_edit');
	code_edit.value = info;
}

// g_debug = 1;
function readLocalFile(filename)
{
	if (g_debug == 0) {
		return '';
	}
	var fileSystem = new ActiveXObject('Scripting.FileSystemObject');
	var file = fileSystem.openTextFile(filename, 1, false, 0);
	// 0:ascii -1:uni -2:sys def
	var data = file.readAll();
	file.close();
	file = null;
	fileSystem = null;
	return data;
}

function debgviewUpgradeFlag()
{
	if (g_debug == 0) {
		return;
	}
//	var code_edit = document.getElementById('code_edit');
//	var code = makeBuildCode();
//	code_edit.value = upgrade_flag + " + " + upgrade_add;
//	code_edit.select();
}

function getUpgaradeAdd(idx)
{
	if (skill_list[idx].upg == 0) {
		return 0;
	}

	if (upgrade_flag == 0) {
		return 0;
	}

	var page = indexToPage(idx);
	if (page < 1) {
		return 0;
	}
	if (page == upgrade_flag) {
		return upgrade_add;
	}
	return 0;
}

function getUpgaradeMax(idx)
{
	var add = getUpgaradeAdd(idx);
	return skill_list[idx].max + add;
}

function setUpgradeFlag()
{
	upgrade_flag = 0;
	upgrade_add = 0;
	if (sim_pc_level < 50) {
		if (g_debug == 1) debgviewUpgradeFlag();
		return;
	}

	var wup = sim_pc_wakeup - 0;

	switch (wup) {
	case 0:
	case 1:
	case 10:
	case 2:
	case 20:
	case 11:
	case 12:
	case 21:
	case 22:
		if (g_debug == 1) debgviewUpgradeFlag();
		return;
	case 111:
	case 121:
		upgrade_flag = 1;
		break;
	case 211:
	case 221:
		upgrade_flag = 2;
		break;
	default:
		if (g_debug == 1) debgviewUpgradeFlag();
		return;
	}

	if (sim_pc_level < 55) {
		upgrade_add = 1;
		if (g_debug == 1) debgviewUpgradeFlag();
		return;
	}
	if (sim_pc_level < 58) {
		upgrade_add = 2;
		if (g_debug == 1) debgviewUpgradeFlag();
		return;
	}
	upgrade_add = 3;
	if (g_debug == 1) debgviewUpgradeFlag();
}

function resetWakeupParam(wup)
{
	sim_pc_wakeup = wup;
}

function resetPointParam(level)
{
	sim_pc_level = level;
	sim_have_point = (sim_pc_level - 3) * 2;
	if (sim_have_point < 0) {
		sim_have_point = 0;
	}
	// Lv60時にボーナスが2point
	if (sim_pc_level >= 60) {
		sim_have_point += 2;
	}
	sim_left_point = sim_have_point;
}

function resetSkillListToLimit()
{
	var max;
	var i;

	for (i = 1; i <= main_skill_num; ++i) {
		max = getUpgaradeMax(i);
		decPointToLimit(i, max);
	}
}

function setBuildCodeValueByIdx(level, idx, v)
{
	if (v > skill_list[idx].max + max_upg_num) {
		return false;
	}
	if (v < 0) {
		v = 0;
	}

	skill_list[idx].p = v;
	if (v == 0) {
		if (skill_list[idx].init > 0) {
			if (level >= skill_list[idx].n[0].cl) {
				skill_list[idx].p = skill_list[idx].init;
			}
		}
	} else {
		if (v >= skill_list[idx].init) {
			sim_left_point -= v - skill_list[idx].init;
		}
	}
	return true;
}

function setBuildCodeValue2(level, bidx, v)
{
	var idx;

	if (bidx >= ver2_bcode_table.length) {
		return false;
	}

	idx = ver2_bcode_table[bidx];

	return setBuildCodeValueByIdx(level, idx, v);
}

function setBuildCodeValue1(level, bidx, v)
{
	var idx;

	if (bidx >= ver1_bcode_table.length) {
		return false;
	}

	idx = ver1_bcode_table[bidx];

	return setBuildCodeValueByIdx(level, idx, v);
}

function setBuildCodeValue(version, level, bidx, v)
{
	if (version == build_code_version1) {
		return setBuildCodeValue1(level, bidx, v);
	}
	return setBuildCodeValue2(level, bidx, v);
}

function resetSkillListPoint()
{
	var i;
	for (i = 1; i <= main_skill_num; ++i) {
		skill_list[i].p = 0;
	}
}

function loadBuildCode(bcode)
{
	var ntable = '0123456789';
	var atable = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ';

	bcode = bcode.replace('+', ' ');

	resetSkillListPoint();

	var i;
	i = 0;
	var ch;
	var lcode = '';
	var next = 0;
	var cnt = 0;
	for (i = 0; i < bcode.length; ++i) {
		if (cnt > 3) {
			return false;
		}
		ch = bcode.charAt(i);
		if (ch == '+' || ch == ' ') {
			next = i + 1;
			break;
		}
		if (ntable.indexOf(ch) < 0) {
			return false;
		}
		lcode += ch;
		cnt++;
	}
	var level = parseInt(lcode);
	if (level < 4) {
		return false;
	}

	// 't'
	ch = bcode.charAt(next);
	if (ch != 't') {
		return false;
	}
	next++;

	var vcode = '';
	cnt = 0;
	for (i = next; i < bcode.length; ++i) {
		if (cnt > 2) {
			return false;
		}
		ch = bcode.charAt(i);
		if (ch == '+' || ch == ' ') {
			next = i + 1;
			break;
		}
		if (ntable.indexOf(ch) < 0) {
			return false;
		}
		vcode += ch;
		cnt++;
	}
	var version = parseInt(vcode);
	if (version != build_code_version2) {
		if (version != build_code_version1) {
			return false;
		}
	}
	resetPointParam(level);

	var wcode = '';
	cnt = 0;
	for (i = next; i < bcode.length; ++i) {
		if (cnt > 4) {
			return false;
		}
		ch = bcode.charAt(i);
		if (ch == '+' || ch == ' ') {
			next = i + 1;
			break;
		}
		if (ntable.indexOf(ch) < 0) {
			return false;
		}
		wcode += ch;
		cnt++;
	}
	var wup = parseInt(wcode);
	resetWakeupParam(wup);

	var num;
	var zf = false;
	var zc = 0;
	var nf = false;
	var nc = 0;
	var idx = 0;

	var j;
//	var str = 'Lv.' + level + ' ';
	for (i = next; i < bcode.length; ++i) {
		ch = bcode.charAt(i);
		num = ntable.indexOf(ch);
		if (num < 0) {
			if (zf == true) {
				// flush zc
				for (j = 0; j < zc; j++) {
//					str += ' 0';
					if (!setBuildCodeValue(version, level, idx, 0)) {
						return false;
					}
					idx++;
				}
				zf = false;
				zc = 0;
			} else if (nf == true) {
				// flush nc
//				str += ' ' + nc.toString(10);
				if (!setBuildCodeValue(version, level, idx, nc)) {
					return false;
				}
				idx++;
				nf = false;
				nc = 0;
			}
			num = atable.indexOf(ch);
			if (num < 0) {
				// error;
				return false;
			}
			if (num == 0) {
				// +
				nf = true;
				nc = 0;
			} else {
//				str += ' ' + num.toString(10);
				if (!setBuildCodeValue(version, level, idx, num)) {
					return false;
				}
				idx++;
			}
		} else {
			if (nf == false) {
				zf = true;
				zc *= 10;
				zc += num;
			} else {
				nc *= 10;
				nc += num;
			}
		}
	}
//	var bcr = document.getElementById('build_code_ret');
//	if (bcr != null && build_code.innerHTML != '') {
//		bcr.innerHTML = str;
//	}
	setLevelSelect(level);
	if (!setWakeupSelect(wup)) {
		return false;
	}
	return true;
}

function makeBuildCode()
{
	var i;
	var table = '+ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//				'012345678901234567890123456'
	var zf;
	var zc;
	var p;
	var code = '+';

	code += 't' + build_code_version2 + '+';
	code += sim_pc_wakeup + '+';

	if (ver2_bcode_table.length != main_skill_num) {
		alert('ver2_bcode_table.length is ' + ver2_bcode_table.length);
	}

	zf = false;
	zc = 0;
	var idx;
	for (i = 0; i < ver2_bcode_table.length; ++i) {
		idx = ver2_bcode_table[i];
		p = skill_list[idx].p;
		if (p > 0) {
			if (zf) {
				code += zc.toString(10);
				zf = false;
				zc = 0;
			}
			if (p <= 26) {
				code += table.charAt(p);
			} else {
				code += '+';
				code += p.toString(10);
			}
		} else {
			zf = true;
			zc++;
		}
	}
	return code;
}

function onClickGetCodeBtn(e)
{
	if (loaded == false) {
		return false;
	}
	var code_edit = document.getElementById('code_edit');
	var code = makeBuildCode();
	code_edit.value = thisURL + '?b=' + sim_pc_level + code;
	code_edit.select();
}

function onClickPointResetBtn(e)
{
	if (loaded == false) {
		return false;
	}
	resetSkillListPoint();
	resetPointParam(sim_pc_level);
	setUpgradeFlag();
	updateAllSkillBoxData();
	dispLevelAndPoint();
}

function makeToolTipWnd()
{
	var str = '';
	str += '<div id="dw_title">\n';
	str += 'タイトル\n';
	str += '</div>\n';
	str += '<div id="dw_point">\n';
	str += '[0/0]\n';
	str += '</div>\n';
	str += '<div id="dw_head" class="dw_head_a">\n';
	str += '<div id="dw_icon" class="dw_icon_a">\n';
	str += '<img src="s0_e.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/s0_e.gif*/ height="64" width="64" id="dw_img">\n';
	str += '</div>\n';
	str += '<div id="dw_kind">\n';
	str += '種類\n';
	str += '</div>\n';
	str += '</div>\n';
	str += '<div id="dw_desc">\n';
	str += '解説\n';
	str += '</div>\n';

	var dw_wnd  = document.getElementById('desc_wnd');
	dw_wnd.innerHTML = str;
	dw_wnd.style.zIndex = '1000';
}

function makeLevelSelect(init)
{
	var str;
	str = '<select name="level" id="lselect">\n';
	var i;
	for (i = 4; i <= 120; ++i) {
		str += '<option value="';
		str += i;
		str += '"';
		if (i == init) {
			str += ' selected';
		}
		str += '> ';
		str += i;
		str += ' </option>';
	}
	str += '</select>\n';

	var level_select  = document.getElementById('level_select');
	level_select.innerHTML = str;
	level_select.style.zIndex = 1;
}

function getWakeupName(i, wup)
{
	var str = wup.toString(10);

	var ch1 = str.charAt(0);
	var ch2 = str.charAt(1);
	var ch3 = str.charAt(2);
	if (i == 1) {
		if (ch1 == 1) return 'ローグ';
		if (ch1 == 2) return 'デバッファー';
	}
	if (i == 2) {
		if (ch1 == 1) {
			if (ch2 == 1) return 'ダガーブレイダー';
			if (ch2 == 2) return 'クロウブレイダー';
		}
		if (ch1 == 2) {
			if (ch2 == 1) return 'デビルウィッチ';
			if (ch2 == 2) return 'ダークウィッチ';
		}
	}
	if (i == 3) {
		if (ch1 == 1) {
			if (ch2 == 1) if (ch3 == 1) return 'ダガーアサシン';
			if (ch2 == 2) if (ch3 == 1) return 'クロウアサシン';
		}
		if (ch1 == 2) {
			if (ch2 == 1) if (ch3 == 1) return 'デビルサマナー';
			if (ch2 == 2) if (ch3 == 1) return 'ダークヘックス';
		}
	}
	return '未覚醒';
}

function makeWakeupSelect(init)
{
	var str;
	var wup_name = new Array(
		'未覚醒',
		'1次覚醒 ローグ',
		'┣2次覚醒 ダガーブレイダー',
		'┃┗3次覚醒 ダガーアサシン',
		'┗2次覚醒 クロウブレイダー',
		'　┗3次覚醒 クロウアサシン',
		'1次覚醒 デバッファー',
		'┣2次覚醒 デビルウィッチ',
		'┃┗3次覚醒 デビルサマナー',
		'┗2次覚醒 ダークウィッチ',
		'　┗3次覚醒 ダークヘックス'
	);
	var wup_value = new Array(
		'0',
		'1',
		'11',
		'111',
		'12',
		'121',
		'2',
		'21',
		'211',
		'22',
		'221'
	);

	str = '<select name="wup" id="wselect">\n';
	var i;
	for (i = 0; i < 11; ++i) {
		str += '<option value="';
		str += wup_value[i];
		str += '"';
		if (i == init) {
			str += ' selected';
		}
		str += '>';
		str += wup_name[i];
		str += '</option>';
	}
	str += '</select>\n';
	var wup_select  = document.getElementById('wup_select');
	if (wup_select != null) {
		wup_select.innerHTML = str;
	}
}

function buildSkillBox(idx)
{
	var str = '';
	str += '<div id="b';
	str += idx;
	str += '" class="disable_box">\n';
	if (g_debug == 1) {
		str += idx;
		str += ':';
	}
	str += '<img src="img/s';
	str += idx;
	str += '_d.gif" id="si';
	str += idx;
	str += '">\n';
	str += '<div>\n';
	str += '<div id="sn';
	str += idx;
	str += '" class="disable_tbox">\n';
	str += '0/0\n';
	str += '</div>\n';
	str += '<div id="sp';
	str += idx;
	str += '" class="plus"><img src="plus.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/plus.gif*/></div>\n';
	str += '</div>\n';
	str += '</div>\n';
	return str;
}

function buildDownArrow(idx, kind)
{
	var str = '<img src="img/down_';
	if (kind == 1) {
		str += 'd';
	} else if (kind == 2) {
		str += 'e';
	} else {
		str += 'b';
	}
	str += '.gif" id="ar';
	str += idx;
	str += '">';
	return str;
}

function buildLeftArrow(idx, kind)
{
	var str = '<img src="img/left_';
	if (kind == 1) {
		str += 'd';
	} else if (kind == 2) {
		str += 'e';
	} else {
		str += 'b';
	}
	str += '.gif" id="ar';
	str += idx;
	str += '">';
	return str;
}

function buildLongLeftArrow(idx, kind)
{
	var str = '<img src="img/lleft_';
	if (kind == 1) {
		str += 'd';
	} else if (kind == 2) {
		str += 'e';
	} else {
		str += 'b';
	}
	str += '.gif" id="ar';
	str += idx;
	str += '">';
	return str;
}

function buildRightArrow(idx, kind)
{
	var str = '<img src="img/right_';
	if (kind == 1) {
		str += 'd';
	} else if (kind == 2) {
		str += 'e';
	} else {
		str += 'b';
	}
	str += '.gif" id="ar';
	str += idx;
	str += '">';
	return str;
}

function buildWRightArrowSrc(idx1, idx2, kind1, kind2)
{
	var str = 'img/wr_';
	if (kind1 == 1) {
		str += 'd';
	} else if (kind1 == 2) {
		str += 'e';
	} else {
		str += 'b';
	}
	if (kind2 == 1) {
		str += 'd';
	} else if (kind2 == 2) {
		str += 'e';
	} else {
		str += 'b';
	}
	str += '.gif';
	return str;
}

function buildWRightArrow(idx1, idx2, kind1, kind2)
{
	var str = '<img src="';
	str += buildWRightArrowSrc(idx1, idx2, kind1, kind2);
	str += '" id="ar';
	str += idx1;
	str += '_';
	str += idx2;
	str += '">';
	return str;
}

function makeCommonFrame()
{
	var str = '<table><tr><td>\n';
	str += buildSkillBox(1);
	str += buildDownArrow(2, 0);
	str += '</td><td>\n';
	str += buildSkillBox(4);
	str += buildDownArrow(5, 0);
	str += '</td><td>\n';
	str += buildSkillBox(8);
	str += buildDownArrow(9, 0);
	str += '</td></tr><tr><td>\n';

	str += buildSkillBox(2);
	str += buildDownArrow(3, 0);
	str += '</td><td>\n';
	str += buildSkillBox(5);
	str += buildDownArrow(6, 0);
	str += '</td><td>\n';
	str += buildSkillBox(9);
	str += buildDownArrow(10, 0);
	str += '</td></tr><tr><td>\n';

	str += buildSkillBox(3);
	str += buildDownArrow(4, 0);
	str += '</td><td>\n';
	str += buildSkillBox(6);
	str += buildDownArrow(7, 0);
	str += '</td><td>\n';
	str += buildSkillBox(10);
	str += buildDownArrow(11, 1);
	str += '</td></tr><tr><td>\n';

	str += '</td><td>\n';
	str += buildSkillBox(7);
	str += '</td><td>\n';
	str += buildSkillBox(11);
	str += buildDownArrow(12, 1);
	str += '</td></tr><tr><td>\n';

	str += '</td><td>\n';
	str += '</td><td>\n';
	str += buildSkillBox(12);
	str += '</td></tr><tr><td>\n';

	str += '</td></tr>\n';
	str += '</table>\n';

	var common  = document.getElementById('common');
	common.innerHTML = str;
}

function makePage1Frame()
{
	var str = '<table><tr><td rowspan="2">\n';
	str += buildLongLeftArrow(14, 1);
	str += '</td><td>\n';
	str += buildSkillBox(13);
	str += buildDownArrow(15, 1);
	str += '</td><td colspan="2">\n';
	str += buildWRightArrow(19, 23, 1, 1);
	str += '</td><td>\n';
	str += buildSkillBox(26);
	str += buildDownArrow(27, 1);
	str += '</td><td>\n';
	str += buildRightArrow(30, 1);
	str += '</td></tr><tr><td>\n';

	str += buildSkillBox(15);
	str += buildDownArrow(16, 1);
	str += '</td><td>\n';
	str += buildSkillBox(19);
	str += buildDownArrow(20, 1);
	str += '</td><td>\n';
	str += buildSkillBox(23);
	str += buildDownArrow(24, 1);
	str += '</td><td>\n';
	str += buildSkillBox(27);
	str += buildDownArrow(28, 1);
	str += '</td><td>\n';
	str += buildSkillBox(30);
	str += buildDownArrow(31, 1);
	str += '</td></tr><tr><td>\n';

	str += buildSkillBox(14);
	str += '</td><td>\n';
	str += buildSkillBox(16);
	str += buildDownArrow(17, 1);
	str += '</td><td>\n';
	str += buildSkillBox(20);
	str += buildDownArrow(21, 1);
	str += '</td><td>\n';
	str += buildSkillBox(24);
	str += buildDownArrow(25, 1);
	str += '</td><td>\n';
	str += buildSkillBox(28);
	str += buildDownArrow(29, 1);
	str += '</td><td>\n';
	str += buildSkillBox(31);
	str += buildDownArrow(32, 1);
	str += '</td></tr><tr><td>\n';

	str += '</td><td>\n';
	str += buildSkillBox(17);
	str += buildDownArrow(18, 1);
	str += '</td><td>\n';
	str += buildSkillBox(21);
	str += buildDownArrow(22, 1);
	str += '</td><td>\n';
	str += buildSkillBox(25);
	str += '</td><td>\n';
	str += buildSkillBox(29);
	str += '</td><td>\n';
	str += buildSkillBox(32);
	str += buildDownArrow(33, 1);
	str += '</td></tr><tr><td>\n';

	str += '</td><td>\n';
	str += buildSkillBox(18);
	str += '</td><td>\n';
	str += buildSkillBox(22);
	str += '</td><td>\n';
	str += '</td><td>\n';
	str += '</td><td>\n';
	str += buildSkillBox(33);

	str += '</td></tr>\n';
	str += '</table>\n';

	var page  = document.getElementById('page1');
	page.innerHTML = str;
}

function makePage2Frame()
{
	var str = '<table><tr><td>\n';
	str += buildLeftArrow(35, 1);
	str += '</td><td>\n';
	str += buildSkillBox(34);
	str += buildDownArrow(37, 1);
	str += '</td><td colspan="2">\n';
	str += buildWRightArrow(41, 45, 1, 1);
	str += '</td><td>\n';
	str += buildSkillBox(48);
	str += buildDownArrow(49, 1);
	str += '</td><td>\n';
	str += buildRightArrow(52, 1);
	str += '</td></tr><tr><td>\n';

	str += buildSkillBox(35);
	str += buildDownArrow(36, 1);
	str += '</td><td>\n';
	str += buildSkillBox(37);
	str += buildDownArrow(38, 1);
	str += '</td><td>\n';
	str += buildSkillBox(41);
	str += buildDownArrow(42, 1);
	str += '</td><td>\n';
	str += buildSkillBox(45);
	str += buildDownArrow(46, 1);
	str += '</td><td>\n';
	str += buildSkillBox(49);
	str += buildDownArrow(50, 1);
	str += '</td><td>\n';
	str += buildSkillBox(52);
	str += buildDownArrow(53, 1);
	str += '</td></tr><tr><td>\n';

	str += buildSkillBox(36);
	str += '</td><td>\n';
	str += buildSkillBox(38);
	str += buildDownArrow(39, 1);
	str += '</td><td>\n';
	str += buildSkillBox(42);
	str += buildDownArrow(43, 1);
	str += '</td><td>\n';
	str += buildSkillBox(46);
	str += buildDownArrow(47, 1);
	str += '</td><td>\n';
	str += buildSkillBox(50);
	str += buildDownArrow(51, 1);
	str += '</td><td>\n';
	str += buildSkillBox(53);
	str += '</td></tr><tr><td>\n';

	str += '</td><td>\n';
	str += buildSkillBox(39);
	str += buildDownArrow(40, 1);
	str += '</td><td>\n';
	str += buildSkillBox(43);
	str += buildDownArrow(44, 1);
	str += '</td><td>\n';
	str += buildSkillBox(47);
	str += '</td><td>\n';
	str += buildSkillBox(51);
	str += '</td></tr><tr><td>\n';

	str += '</td><td>\n';
	str += buildSkillBox(40);
	str += '</td><td>\n';
	str += buildSkillBox(44);
	str += '</td><td>\n';
	str += '</td></tr>\n';
	str += '</td></tr>\n';
	str += '</table>\n';

	var page  = document.getElementById('page2');
	page.innerHTML = str;
}

function showWup(p)
{
	var off  = document.getElementById('woff' + p);
	var on   = document.getElementById('won' + p);
	on.style.visibility = 'hidden';
	off.style.visibility = 'visible';
}

function hideWup(p)
{
	var off  = document.getElementById('woff' + p);
	var on   = document.getElementById('won' + p);
	on.style.visibility = 'hidden';
	off.style.visibility = 'hidden';
}

function showWupTable()
{
//	var wt = document.getElementById('wup_table');
//	wt.style.visibility = 'visible';
	var i;
	for (i = 1; i <= 6; ++i) {
		showWup(i);
	}
}

function hideWupTable()
{
//	var wt = document.getElementById('wup_table');
//	wt.style.visibility = 'hidden';

	var i;
	for (i = 1; i <= 6; ++i) {
		hideWup(i);
	}
}

function onWup(p)
{
	var off = document.getElementById('woff' + p);
	var on  = document.getElementById('won' + p);
	if (on != null) {
		on.style.visibility = 'visible';
	}
	if (off != null) {
		off.style.visibility = 'hidden';
	}
}

function offWup(p)
{
	var off  = document.getElementById('woff' + p);
	var on   = document.getElementById('won' + p);
	if (on != null) {
		on.style.visibility = 'hidden';
	} else {
		alert(p + ' on is null');
	}
	if (off != null) {
		off.style.visibility = 'visible';
	} else {
		alert(p + ' off is null');
	}
}

function makeWakeupFrame()
{
//	var str = '<div id="wup_table">\n';
	var str = '';

	var i;
	for (i = 1; i <= 6; ++i) {
		str += '<div id="woff' + i + '">\n';
			str += '<div class="wcell_off">\n';
			str += ' <div class="lv">' + i + '次覚醒</div>\n';
			str += '</div>';
		str += '</div>\n';

		str += '<div id="won' + i + '">\n';
			str += ' <div class="wcell_on1">\n';
				str += '  <div class="lv">' + i + '次覚醒</div>\n';
				str += '  <div id="wn' + i + '" class="name">name0</div>\n';
			str += ' </div>';
			str += ' <div class="wcell_on2">\n';
				str += '  <div class="icon"><img src="w0_e.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/w0_e.gif*/ id="wa' + i + '"></div>\n';
				str += '  <div id="wan' + i + '" class="name">name1</div>\n';
				str += '  <div id="wal' + i + '" class="lv">[0/10]</div>\n';
			str += ' </div>\n';
			str += ' <div class="wcell_on3">\n';
				str += '  <div class="icon"><img src="w0_d.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/w0_d.gif*/ id="wb' + i + '"></div>\n';
				str += '  <div id="wbn' + i + '" class="name">name2</div>\n';
				str += '  <div id="wbl' + i + '" class="lv">[0/10]</div>\n';
			str += ' </div>\n';
		str += '</div>\n';
	}
//	str += '</div>\n';	// wup_table
	var page  = document.getElementById('wup_table');
	page.innerHTML = str;
	page.style.visibility = 'hidden';

	for (i = 1; i <= 6; ++i) {
		offWup(i);
	}
	hideWupTable();
}

function drawFrames()
{
	makeCommonFrame();
	makePage1Frame();
	makePage2Frame();
	makeWakeupFrame();
	makeToolTipWnd();
}

function isValidIndex(idx)
{
	if (idx == '') {
		return false;
	}
	if (idx < 0) {
		return false;
	}
	if (idx > all_skill_num) {
		return false;
	}
	return true;
}

function isAbleIncrement(idx)
{
	var max = getUpgaradeMax(idx);
	if (skill_list[idx].p >= max) {
		return false;
	}
	if (sim_left_point <= 0) {
		return false;
	}
	if (skill_list[idx].needs != 0) {
		var needs = skill_list[idx].needs;
		if (skill_list[needs].p < skill_list[idx].needl) {
			return false;
		}
	}
	var sub = skill_list[idx].p;
	if (sim_pc_level < skill_list[idx].n[sub].cl) {
		return false;
	}
	return true;
}

function isAbleOnArrow(idx)
{
	if (skill_list[idx].p > 0) {
		return true;
	}

	var max = getUpgaradeMax(idx);
	if (max < 1) {
		return false;
	}
	if (skill_list[idx].needs != 0) {
		var needs = skill_list[idx].needs;
		if (skill_list[needs].p < skill_list[idx].needl) {
			return false;
		}
	}
	var sub = skill_list[idx].p;
	if (sim_pc_level < skill_list[idx].n[sub].cl) {
		return false;
	}
	return true;
}

function incPoint(idx)
{
	if (isAbleIncrement(idx)) {
		skill_list[idx].p++;
		sim_left_point--;
	}
}

function incAllPoint(idx)
{
	while (isAbleIncrement(idx)) {
		skill_list[idx].p++;
		sim_left_point--;
	}
}

function isAbleDecrement(idx)
{
	if (skill_list[idx].p <= skill_list[idx].init) {
		skill_list[idx].p = skill_list[idx].init;
		return false;
	}
	return true;
}

function getKeiretuString(n)
{
	var str;

	var str = n.toString(10);
	var res = '';

	var p;
	var x;
	var i;
	for (i = 0; i < str.length; i++) {
		x = str.charAt(i);
		p = parseInt(x);
		if (res != '') {
			res += ',';
		}
		if (p < strKeiretuStr.length) {
			res += strKeiretuStr[p];
		}
	}
	return res;
}

function isEnoughUsePointForWakeupSkill(s)
{
	var cnt = 0;
	var n;

	n = parseInt(s.needs);
	switch (n) {
	case 1:
	case 2:
	case 3:
		cnt = page_use_point[s.needs];
		break;
	case 12:
		cnt = page_use_point[1] + page_use_point[2];
		break;
	case 13:
		cnt = page_use_point[1] + page_use_point[3];
		break;
	case 23:
		cnt = page_use_point[2] + page_use_point[3];
		break;
	}
	if (cnt >= s.needl) {
		return true;
	}
	return false;
}

function checkDependSkill(idx)
{
	var i;
	for (i = 1; i <= main_skill_num; ++i) {
		if (skill_list[i].needs == idx) {
			if (skill_list[idx].p < skill_list[i].needl) {
				// 減算したスキルに依存するスキルが使用不可能
				// 再帰するので注意
				decAllPoint(i);
			}
		}
	}
}

function decPoint(idx)
{
	if (isAbleDecrement(idx)) {
		skill_list[idx].p--;
		sim_left_point++;
		checkDependSkill(idx);
	}
}

function decAllPoint(idx)
{
	if (!isAbleDecrement(idx)) {
		return;
	}
	while (isAbleDecrement(idx)) {
		skill_list[idx].p--;
		sim_left_point++;
	}
	checkDependSkill(idx);
}

function decPointToLimit(idx, limit)
{
	if (skill_list[idx].p <= limit) {
		return;
	}
	if (!isAbleDecrement(idx)) {
		return;
	}
	while (isAbleDecrement(idx)) {
		if (skill_list[idx].p <= limit) {
			break;
		}
		skill_list[idx].p--;
		sim_left_point++;
	}
	checkDependSkill(idx);
}

function inNowDispPage(idx)
{
	if (idx < page1_begin) {
		if (now_select_page == wakeup_page) {
			return false;
		}
		return true;
	}
	if (idx <= page1_end) {
		if (now_select_page == 1) {
			return true;
		}
		return false;
	}
	if (idx <= page2_end) {
		if (now_select_page == 2) {
			return true;
		}
		return false;
	}
	return false;
}

function setWArrowImage(idx1, idx2)
{
	var ar = document.getElementById('ar' + idx1 + '_' + idx2);
	if (ar == null) {
		return;
	}
	var src = ar.src;

	var ar1_on = isAbleOnArrow(idx1);
	var ar2_on = isAbleOnArrow(idx2);

	if (ar1_on) {
		if (ar2_on) {
			src = buildWRightArrowSrc(idx1, idx2, 2, 2);
		} else {
			src = buildWRightArrowSrc(idx1, idx2, 2, 1);
		}
	} else {
		if (ar2_on) {
			src = buildWRightArrowSrc(idx1, idx2, 1, 2);
		} else {
			src = buildWRightArrowSrc(idx1, idx2, 1, 1);
		}
	}
	ar.src = src;
}

function setArrowImage(idx)
{
	// 19,23の２つを指す右矢印
	if (idx == 19) {
		return;
	} if (idx == 23) {
		setWArrowImage(19, 23);
		return;
	}
	// 41,45の２つを指す右矢印
	if (idx == 41) {
		return;
	} if (idx == 45) {
		setWArrowImage(41, 45);
		return;
	}
	var src;
	var ar = document.getElementById('ar' + idx);
	if (ar != null) {
		src = ar.src;
		if (skill_list[idx].needs > 0) {
			if (isAbleOnArrow(idx)) {
				src = src.replace('404.html'/*tpa=http://cfd.178.com/s/moniqi/jl/_d.gif*/, '404.html'/*tpa=http://cfd.178.com/s/moniqi/jl/_e.gif*/);
			} else {
				src = src.replace('404.html'/*tpa=http://cfd.178.com/s/moniqi/jl/_e.gif*/, '404.html'/*tpa=http://cfd.178.com/s/moniqi/jl/_d.gif*/);
			}
			ar.src = src;
		}
	}
}

function setSkillBoxData(idx)
{
	if (!isValidIndex(idx)) {
		return false;
	}

	var init = skill_list[idx].init;
	if (init > 0) {
		if (skill_list[idx].n[init - 1].cl > sim_pc_level) {
			skill_list[idx].p = 0;
		} else {
			if (skill_list[idx].p == 0) {
				skill_list[idx].p = skill_list[idx].init;
			}
		}
	}
	var box = document.getElementById('b' + idx);
	if (box == null) {
		return false;
	}
	if (skill_list[idx].p > 0) {
		box.style.borderColor = '#5F3700';
	} else {
		box.style.borderColor = '#CFBDA5';
	}
//	box.style.borderStyle = 'solid';
//	box.ttyle.borderWidth = '1px';

	var simg = document.getElementById('si' + idx);
	if (skill_list[idx].p > 0) {
		simg.src = 'img/s' + idx + '_e.gif';
	} else {
		simg.src = 'img/s' + idx + '_d.gif';
	}

	var tbox = document.getElementById('sn' + idx);
	if (skill_list[idx].p > 0) {
		tbox.style.borderColor = '#BE531B';
		tbox.style.background = '#f44';
		tbox.style.color = '#fff';
	} else {
		tbox.style.borderColor = '#B3A18D';
		tbox.style.background = '#caa';
		tbox.style.color = '#eee';
	}
	var max = getUpgaradeMax(idx);
	tbox.innerHTML = skill_list[idx].p + '/' + max;

	var plus = document.getElementById('sp' + idx);
	if (!inNowDispPage(idx)) {
		plus.style.visibility = 'hidden';
	} else {
		if (isAbleIncrement(idx) == true) {
			plus.style.visibility = 'visible';
		} else {
			plus.style.visibility = 'hidden';
		}
	}
	setArrowImage(idx);
}

function updateRangeSkillBoxData(begin, end)
{
	var i;
	var n;
	var cnt = 0;
	for (i = begin; i <= end; ++i) {
		setSkillBoxData(i);
		n = 0;
		if (skill_list[i].p > 0) {
			if (skill_list[i].init > 0) {
				n = skill_list[i].p - skill_list[i].init;
				if (n < 0) {
					n = 0;
				}
			} else {
				n = skill_list[i].p;
			}
		}
		cnt += n;
	}
	return cnt;
}

function updatePageSkillBoxData(page)
{
	var cnt;
	cnt = updateRangeSkillBoxData(page_begin[page], page_end[page]);

	var tab_cnt;
	switch (page) {
	case 0:
		break;
	case 1:
		tab_cnt = document.getElementById('tab1_cnt');
		tab_cnt.innerHTML = cnt;
		page_use_point[1] = cnt;
		break;
	case 2:
		tab_cnt = document.getElementById('tab2_cnt');
		tab_cnt.innerHTML = cnt;
		page_use_point[2] = cnt;
		break;
/*	case 3:
		tab_cnt = document.getElementById('tab3_cnt');
		tab_cnt.innerHTML = cnt;
		page_use_point[3] = cnt;
		break;*/
	default:
		break;
	}
}

function updatePageSkillBoxDataByIndex(idx)
{
	var page = indexToPage(idx);
	if (page == 0) {
		if (now_select_page != wakeup_page) {
			updatePageSkillBoxData(now_select_page);
		}
	} else {
		updatePageSkillBoxData(page);
	}
	updatePageSkillBoxData(0);
}

function updateAllSkillBoxData()
{
	var i;
	var cnt;

	updateRangeSkillBoxData(page_begin[0], page_end[0]);
	for (i = 1; i < page_num; ++i) {
		page_use_point[i] = updateRangeSkillBoxData(page_begin[i], page_end[i]);
	}
	var tab_cnt;
	tab_cnt = document.getElementById('tab1_cnt');
	tab_cnt.innerHTML = page_use_point[1];
	tab_cnt = document.getElementById('tab2_cnt');
	tab_cnt.innerHTML = page_use_point[2];
/*	tab_cnt = document.getElementById('tab3_cnt');
	tab_cnt.innerHTML = page_use_point[3];*/
}

function getWakeupLevelPoint(idx, level)
{
	var i;
	var max = getUpgaradeMax(idx);
	for (i = 0; i < max; ++i) {
		if (skill_list[idx].n[i].cl > level) {
			return i;
		}
	}
	return max;
}

function getWakeupLevelString(idx, point)
{
	var max = getUpgaradeMax(idx);
	return '[' + point + '/' + max + ']';
}

function updateAllWakeupSkillBoxData()
{
	var idx;
	var icon;
	var name;
	var level;
	var point;
	var en;
	var i;
	for (i = 1; i <= 6; ++i) {
		idx = getWakeupIndexById(sim_pc_wakeup, i, 0);
		if (idx > 0) {
			point = getWakeupLevelPoint(idx, sim_pc_level);
			en = false;
			if (isEnoughUsePointForWakeupSkill(skill_list[idx])) {
				if (point != 0) {
					en = true;
				}
			}
			name = document.getElementById('wn' + i);
			if (sim_pc_level < g_wakeup_level[i]) {
				name.style.color = '#aaa';
				en = false;
			} else {
				name.style.color = '#af8';
			}
			name.innerHTML = getWakeupName(i, sim_pc_wakeup);
			icon = document.getElementById('wa' + i);
			icon.src = getWakeupIconFileName(sim_pc_wakeup, i, 0, en);
			name = document.getElementById('wan' + i);
			name.innerHTML = skill_list[idx].name;

			level = document.getElementById('wal' + i);
			level.innerHTML = getWakeupLevelString(idx, point);

			if (en == false) {
				name.style.color = '#aaa';
				level.style.color = '#aaa';
			} else {
				name.style.color = '#fff';
				level.style.color = '#fff';
			}

			idx = getWakeupIndexById(sim_pc_wakeup, i, 1);
			if (idx > 0) {
				point = getWakeupLevelPoint(idx, sim_pc_level);
				en = false;
				if (sim_pc_level >= g_wakeup_level[i]) {
					if (isEnoughUsePointForWakeupSkill(skill_list[idx])) {
						if (point != 0) {
							en = true;
						}
					}
				}
				icon = document.getElementById('wb' + i);
				icon.src = getWakeupIconFileName(sim_pc_wakeup, i, 1, en);
				name = document.getElementById('wbn' + i);
				name.innerHTML = skill_list[idx].name;
				level = document.getElementById('wbl' + i);
				level.innerHTML = getWakeupLevelString(idx, point);

				if (en == false) {
					name.style.color = '#aaa';
					level.style.color = '#aaa';
				} else {
					name.style.color = '#fff';
					level.style.color = '#fff';
				}

				onWup(i);
			} else {
				offWup(i);
			}
		} else {
			offWup(i);
		}
	}
}

function dispLevelAndPoint()
{
//	var slevel = document.getElementById('slevel');
	var spoint = document.getElementById('spoint');

//	slevel.innerHTML = sim_pc_level;
	spoint.innerHTML = sim_left_point + '/' + sim_have_point;
}

function setToolTipData(idx) {

	if (!isValidIndex(idx)) {
		return false;
	}
	var dw_wnd  = document.getElementById('desc_wnd');
	var dw_title = document.getElementById('dw_title');
	var dw_point = document.getElementById('dw_point');
//	var dw_head = document.getElementById('dw_head');
	var dw_icon = document.getElementById('dw_icon');
	var dw_img = document.getElementById('dw_img');
	var dw_kind = document.getElementById('dw_kind');
	var dw_desc = document.getElementById('dw_desc');
	var point;
	var wupless = false;

	if (skill_list[idx].wup == false) {
		point = skill_list[idx].p;
		dw_img.src = 'img/s' + idx + '_e.gif';
	} else {
		point = getWakeupLevelPoint(idx, sim_pc_level);
		if (skill_list[idx].needs != 0) {
			if (isEnoughUsePointForWakeupSkill(skill_list[idx])) {
				wupless = true;
			}
		}
		dw_img.src = getWakeupIconFileNameByIndex(idx, true);
	}

	if (point > 0) {
		dw_wnd.style.color = '#fff';
	} else {
		dw_wnd.style.color = '#aaa';
	}
	var max = getUpgaradeMax(idx);
	dw_point.innerHTML =
		'[' + point + '/' + max + ']';

	var kind_str = '';
	if (skill_list[idx].kind.charAt(0) == 'P') {
//		dw_head.class = 'dw_head_p';
//		dw_icon.class = 'dw_icon_p';
		kind_str = '被动技能';
		dw_icon.style.background = '#1288BA';
	} else if (skill_list[idx].kind.charAt(0) == 'A') {
//		dw_head.class = 'dw_head_a';
//		dw_icon.class = 'dw_icon_a';
		kind_str = '主动';
		if (skill_list[idx].kind.charAt(1) == 'P') {
			kind_str += '<br>角色技能';
		} else if (skill_list[idx].kind.charAt(1) == 'G') {
			kind_str += '<br>守护者技能';
		}
		dw_icon.style.background = '#F13B38';
	}
	if (skill_list[idx].needt != '') {
		kind_str += '<br>';
		kind_str += skill_list[idx].needt;
	}
	dw_kind.innerHTML = kind_str;

	var i;
	if (point < 1) {
		i = 1;
	} else {
		i = point;
	}
	dw_title.innerHTML = skill_list[idx].name + ' Lv.' + i;
	i--;

	var str = '';
	if (i < max) {
		if (skill_list[idx].n[i].ct != '') {
			str += '咏唱时间 ' + skill_list[idx].n[i].ct + '<br>\n';
		}
		if (skill_list[idx].n[i].dt != '') {
			str += '冷却时间 ' + skill_list[idx].n[i].dt + '<br>\n';
		}
		if (skill_list[idx].n[i].rg > 0) {
			str += '射程距離 ' + skill_list[idx].n[i].rg + '<br>\n';
		}

		if (skill_list[idx].wup != false) {
			if (skill_list[idx].needs != 0) {
				str += getKeiretuString(skill_list[idx].needs);
				str += ' 系列点数 : ';
				str += skill_list[idx].needl;
				str += '必要<br>\n';
			}
		}

		if (skill_list[idx].n[i].nt != '') {
			if (point > 0) {
				str += '<span class="dw_blue">'
				str += skill_list[idx].n[i].nt;
				str += '</span>';
			} else {
				str += skill_list[idx].n[i].nt;
			}
			str += '<br>\n';
		}
		str += '<span class="dw_orange">'
		str += skill_list[idx].text;
		str += '</span>\n';
	}
	var next_level = point + 1;
	if (next_level <= max) {
		str += '<br><br>\n';
		str += '<div class="dw_disable">';
		str += skill_list[idx].name + ' Lv.' + next_level;
		str += '<br>\n';
		if (skill_list[idx].wup != false) {
			if (next_level > 1) {
				str += skill_list[idx].n[next_level - 1].nt;
			}
		} else {
			if (skill_list[idx].n[next_level - 1].cl > 0) {
				str += '必要等级 ';
				if (sim_pc_level < skill_list[idx].n[next_level - 1].cl) {
					str += '<span class="dw_red">'
				} else {
					str += '<span class="dw_white">'
				}
				str += skill_list[idx].n[next_level - 1].cl;
				str += '</span><br>\n';
			}
			if (next_level == 1) {
				if (skill_list[idx].needs > 0) {
					var needs = skill_list[idx].needs;
					str += '必要技能 ';
					str += skill_list[needs].name;
					str += ' Lv.';
					str += skill_list[idx].needl;
				}
			} else {
				str += '必要技能 ';
				str += skill_list[idx].name;
				str += ' Lv.';
				str += next_level - 1;
				str += '<br>\n';
				str += skill_list[idx].n[next_level - 1].nt;
			}
		}
		str += '</div>\n';
	}
	dw_desc.innerHTML = str;
	return 1;
}

function onOut(e)
{
	if (loaded == false) {
		return false;
	}
	now_point_icon.index = -1;
	now_point_icon.x = -1;
	now_point_icon.y = -1;
	var desc = document.getElementById('desc_wnd');
	desc.style.visibility = 'hidden';
}

//设弹出tip的位置
function setDescWndPos(e,desc){
	if (now_point_icon.index < 0) {
		return;
	}
	var node=getTargetNode(e);
	var pnode=node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
	while(pnode.id.indexOf("middle")==-1){
		pnode=pnode.parentNode;
	}
	var ppoint=getElementPos(pnode);
	var top,left;
	if(pnode.id=="middle2"){
		top=(now_point_icon.y+3);
		left=(now_point_icon.x+70);
	}else if(pnode.id=="middle3"){	
		top=(now_point_icon.y+3);
		left=(now_point_icon.x-270);
	}else if(pnode.id=="middle4"){
		top=now_point_icon.y;
		left=now_point_icon.x+40;
	}
	
	var ctl=(top+desc.offsetHeight)-(ppoint.y+pnode.offsetHeight);
	if(ctl>0) desc.style.top=(top-ctl)+'px';
	else desc.style.top=top+'px';
	desc.style.left=left+'px';
}

function onWakeupOut(e) {
	if (loaded == false) {
		return false;
	}
	now_point_icon.index = -1;
	now_point_icon.x = -1;
	now_point_icon.y = -1;
	var desc = document.getElementById('desc_wnd');
	desc.style.visibility = 'hidden';
}

/*
wup     覚醒コード
offset1 1-6:覚醒次数
offset2 0:左のスキル 1:右のスキル
*/
function getWakeupIndexById(wup, offset1, offset2)
{
	var begin = page_begin[wakeup_page];
	if (begin == null) {
		return -1;
	}
	var str = wup.toString(10);
	if (str.length < 1) {
		return -1;
	}
	var ch0 = str.charAt(0);

	if (offset1 == 1) {
		switch (ch0) {
		case '1':
			return begin + offset2;
		case '2':
			return begin + 10 + offset2;
		}
		return -1;
	}

	if (str.length <= 1) {
		return -1;
	}
	var ch1 = str.charAt(1);

	if (offset1 == 2) {
		switch (ch0) {
		case '1':
			switch (ch1) {
			case '1':
				return begin + 2 + offset2;
			case '2':
				return begin + 6 + offset2;
			}
			break;
		case '2':
			switch (ch1) {
			case '1':
				return begin + 12 + offset2;
			case '2':
				return begin + 16 + offset2;
			}
			break;
		}
		return -1;
	}

	if (str.length <= 2) {
		return -1;
	}
	var ch2 = str.charAt(2);

	if (offset1 == 3) {
		if (ch2 != 1) {
			return -1;
		}
		switch (ch0) {
		case '1':
			switch (ch1) {
			case '1':
				return begin + 4 + offset2;
			case '2':
				return begin + 8 + offset2;
			}
			break;
		case '2':
			switch (ch1) {
			case '1':
				return begin + 14 + offset2;
			case '2':
				return begin + 18 + offset2;
			}
			break;
		}
		return -1;
	}
	return -1;
}

function getWakeupIconFileName(wup, offset1, offset2, enable)
{
	var idx = getWakeupIndexById(wup, offset1, offset2);
	if (idx <= 0) {
		return 'w0_d.gif'/*tpa=http://cfd.178.com/s/moniqi/jl/img/w0_d.gif*/;
	}

	var begin = page_begin[wakeup_page];
	if (begin == null) {
		return 'w0_d.gif'/*tpa=http://cfd.178.com/s/moniqi/jl/img/w0_d.gif*/;
	}

	idx -= begin;
	idx++;

	if (enable) {
		return 'img/w' + idx + '_e.gif';
	}
	return 'img/w' + idx + '_d.gif';
}

function getWakeupIconFileNameByIndex(idx, enable)
{
	var begin = page_begin[wakeup_page];
	if (begin == null) {
		return 'w0_d.gif'/*tpa=http://cfd.178.com/s/moniqi/jl/img/w0_d.gif*/;
	}

	idx -= begin;
	idx++;

	if (enable) {
		return 'img/w' + idx + '_e.gif';
	}
	return 'img/w' + idx + '_d.gif';
}

function onWakeupOver(e)
{
	if (loaded == false) {
		return false;
	}
	if (disp_popup == false) {
		return false;
	}
	var target_node = getTargetNode(e);
	var id = target_node.id;

	var desc = document.getElementById('desc_wnd');

	var ch = id.charAt(1);
	var offset1 = id.substring(2);
	var offset2 = 0;
	if (ch == 'a') {
		offset2 = 0;
	} else if (ch == 'b') {
		offset2 = 1;
	} else {
		return;
	}
	var idx = getWakeupIndexById(sim_pc_wakeup, offset1, offset2);
	if (idx <= 0) {
		return;
	}
	setToolTipData(idx);

	var pos = getElementPos(target_node);
	now_point_icon.index = idx;
	now_point_icon.x = pos.x;
	now_point_icon.y = pos.y;
	setDescWndPos(e, desc);
	desc.style.visibility = 'visible';
}

function onMove(e) {
	if (loaded == false) {
		return false;
	}
	if (disp_popup == false) {
		return false;
	}
	var desc = document.getElementById('desc_wnd');
	setDescWndPos(e, desc);
}

function getElementPos(elem){
	var obj = new Object();
	obj.x = elem.offsetLeft;
	obj.y = elem.offsetTop;
	while(elem = elem.offsetParent){
		obj.x += elem.offsetLeft;
		obj.y += elem.offsetTop;
	}
	return obj;
}

function getTargetNode(e)
{
	var target_node;
	if (e.target) {
		target_node = e.target;
	} else {
		target_node = e.srcElement;
	}
	return target_node;
}

function getSkillBoxNode(node)
{
//	var dbg_str = 'node walk';

	var id;
	while (node) {
		id = node.id;
//		dbg_str += ', ' + id;
		if (id.charAt(0) == 'b') {
//			putDebugInfo(dbg_str);
			return node;
		}
		node = node.parentNode;
	}
//	putDebugInfo(dbg_str);
	return null;
}

function onOver(e) {
	if (loaded == false) {
		return false;
	}
	if (disp_popup == false) {
		return false;
	}
	var target_node = getTargetNode(e);
	target_node = getSkillBoxNode(target_node);
	if (target_node == null) {
		return false;
	}
	var id = target_node.id;

	var desc = document.getElementById('desc_wnd');
	var idx = id.substring(1);
	setToolTipData(idx);

	var pos = getElementPos(target_node);
	now_point_icon.index = idx;
	now_point_icon.x = pos.x;
	now_point_icon.y = pos.y;
	setDescWndPos(e, desc);
	desc.style.visibility = 'visible';
}

function stopDefaultAndPropagation(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	}
	if (window.event) {
		window.event.cancelBubble = true;
	}
	if (e.preventDefault) {
		e.preventDefault();
	}
	if (window.event) {
		window.event.returnValue = false;
	}
}

function onMiddleClick(e)
{
	if (loaded == false) {
		return false;
	}
	return false;
}

function indexToPage(idx)
{
	for (i = 0; i < 4; ++i) {
		if ((page_begin[i] <= idx) && (idx <= page_end[i])) {
			return i;
		}
	}
	return -1;
}


function onRightClick(e)
{
	if (loaded == false) {
		return false;
	}
	var target_node = getTargetNode(e);
	target_node = getSkillBoxNode(target_node);
	if (target_node == null) {
		return false;
	}
	var id = target_node.id;
	if (id.charAt(0) == 's') {
		id = target_node.parentNode.id;
		target_node = target_node.parentNode;
	}

	var idx = id.substring(1);
	if (!isValidIndex(idx)) {
		return false;
	}

	// shiftキーはリセット
	if (e.shiftKey) {
		decAllPoint(idx);
	} else {
		decPoint(idx);
	}
	setToolTipData(idx);
//	setSkillBoxData(idx);

	setUpgradeFlag();
	updatePageSkillBoxDataByIndex(idx);

//	updateAllSkillBoxData();

	dispLevelAndPoint();
}

function onLeftClick(e)
{
	if (loaded == false) {
		return false;
	}
	var target_node = getTargetNode(e);
	target_node = getSkillBoxNode(target_node);
	if (target_node == null) {
		return false;
	}
	var id = target_node.id;
	if (id.charAt(0) == 's') {
		id = target_node.parentNode.id;
		target_node = target_node.parentNode;
	}

	var idx = id.substring(1);
	if (!isValidIndex(idx)) {
		stopDefaultAndPropagation(e);
		return false;
	}

	// shiftキーは全振り
	if (e.shiftKey) {
		incAllPoint(idx);
	} else {
		incPoint(idx);
	}

	setToolTipData(idx);
//	setSkillBoxData(idx);
	setUpgradeFlag();
	updatePageSkillBoxDataByIndex(idx);
//	updateAllSkillBoxData();
	dispLevelAndPoint();
}

function onContextMenu(e)
{
	// ctrlはボタンを反転
	if (e.ctrlKey) {
		onLeftClick(e);
	} else {
		onRightClick(e);
	}
	stopDefaultAndPropagation(e);
	return false;
}

function onClick(e)
{
	
	// ctrlはボタンを反転
	if (e.button == 0) {		// left
		if (e.ctrlKey) {
			onRightClick(e);
		} else {
			onLeftClick(e);
		}
	} else if (e.button == 1) {	// middle
		onMiddleClick(e);
	} else if (e.button == 2) {	// right
		if (e.ctrlKey) {
			onLeftClick(e);
		} else {
			onRightClick(e);
		}
	}
	stopDefaultAndPropagation(e);
	return false;
}

function adjustSkillPoint(set_level)
{
	if (set_level == sim_pc_level) {
		return false;
	}
	if (set_level > sim_pc_level) {
		// Lv60時にボーナスがあるのでresetPointParam()を通す
		var old_have = sim_have_point;
		var old_left = sim_left_point;
		resetPointParam(set_level);
		var add = sim_have_point - old_have;
		sim_left_point = old_left + add;
		return true;
	}
	// set_level が小さいなら全リセット
	resetPointParam(set_level);

	var i;
	for (i = 1; i <= main_skill_num; ++i) {
		if (sim_pc_level < skill_list[i].n[0].cl) {
			skill_list[i].p = 0;
		} else {
			skill_list[i].p = skill_list[i].init;
		}
	}
	return true;
}

function setWakeupSelect(wup)
{
	var wselect  = document.getElementById('wselect');

	var opt_num = wselect.length;
	var i;
	for (i = 0; i < opt_num; ++i) {
		var opt = wselect.options[i];
		if (opt.value == wup) {
			opt.selected = true;
			return true;
		}
	}
	return false;
}

function setLevelSelect(level)
{
	var lselect  = document.getElementById('lselect');

	var idx = level - 4;
	if (idx < 0) {
		idx = 0;
	}
	var opt = lselect.options[idx];
	if (opt == null) {
		alert('opt is null');
	} else {
		opt.selected = true;
	}
}

function onChangeWakeupSelect(e)
{
	var target_node = getTargetNode(e);
	var id = target_node.id;

	var opt_num = target_node.length;
	var i;
	for (i = 0; i < opt_num; ++i) {
		var opt = target_node.options[i];
		if (opt.selected == true) {
			if (opt.value != sim_pc_wakeup) {
				sim_pc_wakeup = opt.value;
			}
			break;
		}
	}
	setUpgradeFlag();
	resetSkillListToLimit();
	updateAllSkillBoxData();
	dispLevelAndPoint();
	if (now_select_page == wakeup_page) {
		updateAllWakeupSkillBoxData();
	}
	return false;
}

function onChangeLevelSelect(e)
{
	var target_node = getTargetNode(e);
	var id = target_node.id;

	var opt_num = target_node.length;
	var i;
	for (i = 0; i < opt_num; ++i) {
		var opt = target_node.options[i];
		if (opt.selected == true) {
			if (i + 4 != sim_pc_level) {
				adjustSkillPoint(i + 4);
			}
			break;
		}
	}
	setUpgradeFlag();
	updateAllSkillBoxData();
	dispLevelAndPoint();
	if (now_select_page == wakeup_page) {
		updateAllWakeupSkillBoxData();
	}
	return false;
}

function onChangeUsePopupCheck(e)
{
	var target_node = getTargetNode(e);
	var id = target_node.id;

	if (target_node.checked) {
		disp_popup = true;
	} else {
		disp_popup = false;
	}
	return true;
}

function showPagePlusIcon(begin, end)
{
	var i;
	var plus;
	for (i = begin; i <= end; i++) {
		plus = document.getElementById('sp' + i);
		if (plus != null) {
			if (isAbleIncrement(i) == true) {
				plus.style.visibility = 'visible';
			}
		}
	}
}

function hidePagePlusIcon(begin, end)
{
	var i;
	var plus;
	for (i = begin; i <= end; i++) {
		plus = document.getElementById('sp' + i);
		if (plus != null) {
			plus.style.visibility = 'hidden';
		}
	}
}

function hideLoadingPage()
{
	var page;
	page = document.getElementById('page0');
	if (page != null) {
		page.style.visibility = 'hidden';
	}
}

function hidePage(p)
{
	var page;
	var middle2 = document.getElementById('middle2');
	var middle3 = document.getElementById('middle3');
	var middle4 = document.getElementById('middle4');
	if (p == 0) {
		page = document.getElementById('common');
		hidePagePlusIcon(page_begin[0], page_end[0]);
	} else if (p == 1) {
		page = document.getElementById('page1');
		hidePagePlusIcon(page1_begin, page1_end);
	} else if (p == 2) {
		page = document.getElementById('page2');
		hidePagePlusIcon(page2_begin, page2_end);
	} else if (p == 4) {
		page = document.getElementById('page4');
		middle4.style.visibility = 'hidden';
		middle2.style.visibility = 'visible';
		middle3.style.visibility = 'visible';
		hideWupTable();
		page.style.visibility = 'hidden';
		return;
	} else {
		return;
	}
	if (page == null) {
		alert('page' + p + 'がありません');
		return;
	}
	page.style.visibility = 'hidden';
}

function showPage(p)
{
	var page;
	var middle2 = document.getElementById('middle2');
	var middle3 = document.getElementById('middle3');
	var middle4 = document.getElementById('middle4');
	if (p == 0) {
		var pre_common  = document.getElementById('pre_common');
		pre_common.style.visibility = 'hidden';
		page = document.getElementById('common');
		showPagePlusIcon(page_begin[0], page_end[0]);
	} else if (p == 1) {
		page = document.getElementById('page1');
		showPagePlusIcon(page1_begin, page1_end);
	} else if (p == 2) {
		page = document.getElementById('page2');
		showPagePlusIcon(page2_begin, page2_end);
	} else if (p == 4) {
		page = document.getElementById('page4');
		middle4.style.visibility = 'visible';
		middle2.style.visibility = 'hidden';
		middle3.style.visibility = 'hidden';
		page.style.visibility = 'visible';
		showWupTable();
		return;
	} else {
		return;
	}
	if (page == null) {
		alert('page' + p + 'がありません');
		return;
	}
	page.style.visibility = 'visible';
}

function showCommonPage()
{
	var pre_common  = document.getElementById('pre_common');
	pre_common.style.visibility = 'hidden';
	var common  = document.getElementById('common');
	common.style.visibility = 'visible';
}

function onClickTab(e)
{
	if (loaded == false) {
		return false;
	}

	var target_node = getTargetNode(e);
	var id = target_node.id;
	var tab1 = document.getElementById('tab1');
	var tab2 = document.getElementById('tab2');
//	var tab3 = document.getElementById('tab3');
	var tab4 = document.getElementById('tab4');

	if (id == 'tab1') {
		if (now_select_page == 1) {
			return;
		}
		now_select_page = 1;
		showPage(0);
		hidePage(2);
		hidePage(4);
		showPage(1);;
		tab1.style.backgroundImage = 'url("t1_e.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/t1_e.gif*/)';
		tab2.style.backgroundImage = 'url("t2_d.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/t2_d.gif*/)';
		tab4.style.backgroundImage = 'url("t4_d.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/t4_d.gif*/)';
	} else if (id == 'tab2') {
		if (now_select_page == 2) {
			return;
		}
		now_select_page = 2;
		showPage(0);
		hidePage(1);
		hidePage(4);
		showPage(2);;
		tab1.style.backgroundImage = 'url("t1_d.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/t1_d.gif*/)';
		tab2.style.backgroundImage = 'url("t2_e.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/t2_e.gif*/)';
		tab4.style.backgroundImage = 'url("t4_d.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/t4_d.gif*/)';
	} else if (id == 'tab4') {
		if (now_select_page == 3) {
			return;
		}
		now_select_page = 3;
		hidePage(0);
		hidePage(1);
		hidePage(2);
		showPage(4);;
		tab1.style.backgroundImage = 'url("t1_d.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/t1_d.gif*/)';
		tab2.style.backgroundImage = 'url("t2_d.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/t2_d.gif*/)';
		tab4.style.backgroundImage = 'url("t4_e.gif"/*tpa=http://cfd.178.com/s/moniqi/jl/img/t4_e.gif*/)';
		updateAllWakeupSkillBoxData();
	}
}

function onOutTab(e)
{
	var target_node = getTargetNode(e);
	var id = target_node.id;
	var tab;
	var num;
	var fname;
	var i;
	for (i = 0; i < page_num; ++i) {
		if (id == g_tab_names[i]) {
			num = i + 1;
			if (now_select_page != num) {
				tab = document.getElementById(g_tab_names[i]);
				fname = 'url("img/t' + g_tab_nums[i] + '_d.gif")';
				tab.style.backgroundImage = fname;
			}
			break;
		}
	}
}

function onOverTab(e)
{
	var target_node = getTargetNode(e);
	var id = target_node.id;
	var tab;
	var num;
	var fname;
	var i;
	for (i = 0; i < page_num; ++i) {
		if (id == g_tab_names[i]) {
			num = i + 1;
			if (now_select_page != num) {
				tab = document.getElementById(g_tab_names[i]);
				fname = 'url("img/t' + g_tab_nums[i] + '_o.gif")';
				tab.style.backgroundImage = fname;
			}
			break;
		}
	}
}

function convartToSkillSubList(c)
{
	var a = new Array();
	a.sl = c[0] - 0;
	a.cl = c[1] - 0;
	a.ct = c[2];
	a.dt = c[3];
	a.rg = c[4];
	a.nt = c[5];
	return a;
}

function convartToSkillList(c)
{
	var a = new Array();
	a.p = 0;
	a.index = parseInt(c[0].substring(1));
	a.name = c[1];
	a.init = c[2] - 0;
	a.max = c[3] - 0;
	a.upg = c[4] - 0;
	a.kind = c[5];
	a.needs = c[6] - 0;
	a.needl = c[7] - 0;
	a.needt = c[8];
	a.text = c[9];
	a.wup = false;

	return a;
}

function convartToWupSkillList(c)
{
	var a = new Array();
	a.p = 0;
	a.index = parseInt(c[0].substring(1));
	a.name = c[1];
	a.init = c[2] - 0;
	a.max = c[3] - 0;
	a.upg = c[4] - 0;
	a.kind = c[5];
	a.needs = c[6];
	a.needl = c[7] - 0;
	a.needt = c[8];
	a.text = c[9];
	a.wup = true;

	return a;
}

function putErrorMessage(msg)
{
	var errmsg = document.getElementById('errmsg');
	if (errmsg != null) {
		errmsg.innerHTML = msg;
		errmsg.style.visibility = 'visible';
	}
}

function readBuildCode()
{
	var res;
	var build_code = window.location.href.split("?b=");
	if (build_code && build_code.length > 1) {
		res = loadBuildCode(build_code[1]);
		if (res == false) {
			putErrorMessage('加点还原失败.');
			resetPointParam(4);
			resetWakeupParam('00');
		}
	}
}

function onLoadData(text_data)
{

	var t = text_data.split('\n');
	var page = 0;
	var idx = 1;
	var page_top = 0;
	var sl = 0;
	var i;
	for (i = 0; i < t.length; i++) {
		if (
			(t[i] != '') &&
			(t[i].charAt(0) != '#')
		) {
			if ((t[i].charAt(0) == '.')) {
				break;
			} else if ((t[i].charAt(0) == '!')) {
				page_top = idx;
				page_begin[page] = idx;
				page_end[page] = idx;
				page++;
			} else if (page > 0) {
				var c = t[i].split(',');
				if (c[0].charAt(0) == '*') {	// 通常
					sl = 0;
					skill_list[idx] = convartToSkillList(c);
					if (skill_list[idx].needs > 0) {
						skill_list[idx].needs += (page_top - 1);
					}
					skill_list[idx].n = new Array();
					page_end[page - 1] = idx;
					idx++;
				} else if (c[0].charAt(0) == '$') {	// 覚醒
					sl = 0;
					skill_list[idx] = convartToWupSkillList(c);
					skill_list[idx].n = new Array();
					page_end[page - 1] = idx;
					idx++;
				} else {
					if (idx > 1) {
						skill_list[idx - 1].n[sl] = convartToSkillSubList(c);
						sl++;
					}
				}
			}
		}
	}
	if (page < 3) {
		// 少ない
	} else {
		page1_begin = page_begin[1];
		page1_end = page_end[1];
		page2_begin = page_begin[2];
		page2_end = page_end[2];
//		page3_begin = page_begin[3];
//		page3_end = page_end[3];
	}

//	var str = 'skill_list.length = ' + skill_list.length + '<br>';
//	str = skill_list[43].name;
//	document.getElementById('top1').innerHTML = str;

	loaded = true;

	readBuildCode();

	setUpgradeFlag();
	updateAllSkillBoxData();
	dispLevelAndPoint();

	now_select_page = 1;
	hideLoadingPage();
	showPage(0);
	showPage(1);
//	showCommonPage();
}

// CSVデータを読み込み
function doLoadData() {

	if (g_debug == 1) {
		dbg_text_data = readLocalFile(data_file_name);
		onLoadData(dbg_text_data);
		return;
	}
    // テキストファイルのURLを定義
    var target_url = data_file_name;
    // 処理を実行するための関数リファレンスを定義
    var funcRef = onLoadData;
    // HTTP通信を開始し、完了したら上記関数を実行させる
    httpRequest(target_url, funcRef);
}

// 引数に与えられたURLにHTTPリクエストを行ない、値をタグ要素にセットする
function httpRequest(target_url, funcitonReference) {
	try {
		if (window.XMLHttpRequest) {
			httpObj = new XMLHttpRequest();
		} else if(window.ActiveXObject) {
			httpObj = new ActiveXObject('Microsoft.XMLHTTP');
		} else {
			httpObj = false;
		}
	} catch(e) {
		httpObj = false;
	}
	if (! httpObj) {
		httpObjGenerateFail();
	}
	// タイマーをセット
	timerId = setInterval('timeoutCheck()', 1000);

	httpObj.open('GET', target_url, true);
	httpObj.onreadystatechange = function() {
		if (httpObj.readyState == 4) {
			clearInterval(timerId);
			if (httpObj.status == 200) {
				funcitonReference(httpObj.responseText);
			} else {
				if (httpObj.status != 0) {
					alert(httpObj.status + ' : ' + httpObj.statusText);
				}
				return false;
			}
		}
	}
	httpObj.send('');
}

// XMLHttpRequestオブジェクト生成に失敗した場合の処理
function httpObjGenerateFail() {
    alert('ご利用のブラウザーでは、当サイトをご利用頂けません。');
    return false;
}

// タイムアウト処理
function timeoutCheck() {
    timeout_sec --;
    if(timeout_sec <= 0) {
        // タイマーをストップする
        clearInterval(timerId);
        // HTTPリクエストを中断する
        httpObj.abort();
        // エラーダイアログを表示
        alert('タイムアウトです。');
        return false;
    }
}

// イベントリスナーをセットする
function setListeners(e) {
	var icon;
	var sn;
	var sp;
	var i;
	for (i = 1; i <= main_skill_num; ++i) {
		icon = document.getElementById('b' + i);
		if (icon != null) {
			addListener(icon, 'mouseover', onOver, false);
			addListener(icon, 'mousemove', onMove, false);
			addListener(icon, 'mouseout', onOut, false);
			addListener(icon, 'click', onClick, false);
			addListener(icon, 'contextmenu', onContextMenu, false);
			sn = document.getElementById('sn' + i);
			addListener(sn, 'click', onClick, false);
			addListener(sn, 'contextmenu', onContextMenu, false);
			sp = document.getElementById('sp' + i);
			addListener(sp, 'click', onClick, false);
			addListener(sp, 'contextmenu', onContextMenu, false);
		}
	}
	var lselect = document.getElementById('lselect');
	addListener(lselect, 'change', onChangeLevelSelect, false);

	var wselect = document.getElementById('wselect');
	addListener(wselect, 'change', onChangeWakeupSelect, false);

	var id;
	for (i = 1; i <= 6; ++i) {
		id ='wa' + i;
		icon = document.getElementById(id);
		if (icon != null) {
			addListener(icon, 'mouseover', onWakeupOver, false);
			addListener(icon, 'mouseout', onWakeupOut, false);
		}
		id ='wb' + i;
		icon = document.getElementById(id);
		if (icon != null) {
			addListener(icon, 'mouseover', onWakeupOver, false);
			addListener(icon, 'mouseout', onWakeupOut, false);
		}
	}

	var use_popup = document.getElementById('use_popup');
	addListener(use_popup, 'click', onChangeUsePopupCheck, false);

	var getcode_btn = document.getElementById('getcode_btn');
	addListener(getcode_btn, 'click', onClickGetCodeBtn, false);
	var reset_btn = document.getElementById('reset_btn');
	addListener(reset_btn, 'click', onClickPointResetBtn, false);

	var tab;
	for (i = 0; i < page_num; ++i) {
		tab = document.getElementById(g_tab_names[i]);
		addListener(tab, 'click', onClickTab, false);
		addListener(tab, 'mouseover', onOverTab, false);
		addListener(tab, 'mouseout', onOutTab, false);
	}
}

function onLoad(e)
{
	// レベルセレクタを描画する
	makeLevelSelect(sim_pc_level);

	makeWakeupSelect(0);

	// フレームを描画する
	drawFrames();

	// テキストデータを読み込む
	doLoadData();

	// イベントリスナーをセットする
	setListeners(e);
}

function addListener(elem, eventType, func, cap) {
    if(elem.addEventListener) {
        elem.addEventListener(eventType, func, cap);
    } else if(elem.attachEvent) {
        elem.attachEvent('on' + eventType, func);
    } else {
        alert('ご利用のブラウザーはサポートされていません。');
        return false;
    }
}

// HTMLがロードされた際に、setListeners()関数を実行させる
addListener(window, 'load', onLoad, false);