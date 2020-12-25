class SkillData {
  id = ""; // 字符串ID
  race = ""; // 种族 a s t
  name = ""; // 名称
  kind = ""; // 类型 A=主动 AG=角色主动 AP=守护者主动 P=被动
  text = ""; // 介绍文本
  needt = ""; // 需求描述文本
  n = []; // 每个等级的介绍文本
  needs = ""; // 前置技能ID
  needl = 0; // 需求前置技能等级
  init = 0; // 初始点数
  cost = 0; // 当前点数加值
  max1 = 0; // 点数上限
  max2 = 0;  // 觉醒后的上限
  wup = false; // 是否觉醒
  need = null; // 前置技能对象 SkillData
  nexts = []; // 后置技能对象 SkillData
  type = -1; // 种类 common skill1 skill2 skill3 wakeup
  getLeftPoint = () => { return 233; }; // 用于接收总剩余点数方法
  constructor(payload) {
    Object.assign(this, payload);
  }
  get max() {
    return this.wup ? max2 : this.max1;
  }
  get lv() {
    return this.init + this.cost;
  }
  get isMax() {
    return this.lv >= this.max;
  }
  get kindState() {
    let result = '';
    let char = this.kind.charAt(0);
    if (char === 'A') result = '主动';
    else if (char === 'P') result = '被动';
    return result;
  }
  get kindTarget() {
    let result = '';
    let char = this.kind.charAt(1);
    if (char === 'G') result = '守护者技能';
    else if (char === 'P') result = '角色技能';
    return result;
  }
  /** 获取等级数组中当前等级的数据 */
  getN(key) {
    let _n = this.n[Math.max(this.lv - 1, 0)];
    if (!key) return _n;
    if (!_n) return null;
    return _n[key];
  }
  /** 获取技能是否激活的状态 */
  isActive(pc_level) {
    pc_level = pc_level || 4;
    let flag = true;
    // 判断角色等级
    if (pc_level && this.n[0]) {
      if (pc_level < this.n[0]['cl']) flag = false;
    }
    // 判断前置技能的等级
    if (this.need) {
      if (this.need.lv < this.needl) flag = false;
    }
    return flag;
  }
  /** 获取图片URL */
  getImgURL(isEnable = true) {
    if (!this.race || !this.id) return "";
    return `img/${this.race}/${this.id}_${isEnable ? 'e' : 'd'}.gif`;
  }
  /** 点数运算 */
  add(n) {
    // 判断是否超出可加点上限
    let _cost = n > 0 ? Math.min(n, this.getLeftPoint()) : n;
    _cost += this.cost;
    if (_cost < 0 || _cost > this.max - this.init) return;
    this.cost = _cost;
    this.setNextsCost();
  }
  toMax() {
    this.add(this.max - this.lv);
    //this.cost = this.max - this.init;
  }
  toMin() {
    this.add(-(this.cost));
    //this.cost = 0;
    //this.setNextsCost();
  }
  /** 处理可能存在的后置技能归零事务 */
  setNextsCost() {
    for (let i = 0; i < this.nexts.length; i++) {
      if (this.lv < this.nexts[i].needl) this.nexts[i].toMin();
    }
  }
  /** 解析并载入原始数据 */
  parse(c) {
    this.id = c[0].substring(1);
    this.name = c[1];
    this.init = c[2] - 0;
    this.max1 = c[3] - 0;
    this.max2 = c[4] - 0;
    this.kind = c[5];
    this.needs = c[6];
    this.needl = c[7] - 0;
    this.needt = c[8];
    this.text = c[9];
  }
  /** 解析并添加每个等级的描述数据 */
  addLevelText(c) {
    let a = {};
    a.sl = c[0] - 0; // 技能等级
    a.cl = c[1] - 0; // 必要等级
    a.ct = c[2]; // 咏唱时间
    a.dt = c[3]; // 冷却时间
    a.rg = c[4] - 0; // 射程距離
    a.nt = c[5]; // 文字描述
    this.n.push(a);
  }
}

var app = new Vue({
  el: '#app',
  data: {
    loaded: false,
    disp_popup: true, // 是否显示技能详细介绍
    popupData: null, // 弹出内容数据
    popupOffset: { top: 0, left: 0 }, // 弹出框偏移量
    race: 'a', // a s t
    raceName: { a: '人类', s: '龙人', t: '精灵' },
    g_wakeup_level: [0, 10, 30, 50, 70, 90, 110],
    sim_pc_level: 120, // 选取的等级
    sim_pc_wakeup: '0', // 选取的觉醒状态
    sim_have_point: 0, // 技能点总数
    activeTab: 1, // 当前选中的tab下标
    skillTab: [ // 技能分类tab数据
      { a: '共通', s: '共通', t: '共通', point: 0, mouseover: false },
      { a: '斬打', s: '炎', t: '斬刃', point: 0, mouseover: false },
      { a: '射撃', s: '氷', t: '細菌', point: 0, mouseover: false },
      { a: '无', s: '光', t: '无', point: 0, mouseover: false },
      { a: '覚醒', s: '覚醒', t: '覚醒', mouseover: false }
    ],
    skills: [], // 技能数据
    wakeupList: [], // 觉醒技能列表
    wakeups: [ // 觉醒数据
      { id: '0', label: '未觉醒', skill: '', a: '', s: '', t: '' },
      { id: '1', label: '1次觉醒', skill: 'w1,w2', a: '近战', s: '元素', t: '刺客' },
      { id: '11', label: '┣2次觉醒', skill: 'w3,w4', a: '双手', s: '火法', t: '刀刺' },
      { id: '111', label: '┃┗3次觉醒', skill: 'w5,w6', a: '双手', s: '火法', t: '刀刺' },
      { id: '12', label: '┗2次觉醒', skill: 'w7,w8', a: '盾战', s: '冰法', t: '爪刺' },
      { id: '121', label: '\xa0\xa0┗3次觉醒', skill: 'w9,w10', a: '盾战', s: '冰法', t: '爪刺' },
      { id: '2', label: '1次觉醒', skill: 'w11,w12', a: '射击', s: '光法', t: '毒刺' },
      { id: '21', label: '┣2次觉醒', skill: 'w13,w14', a: '迅捷', s: '光法', t: '召唤' },
      { id: '211', label: '┃┗3次觉醒', skill: 'w15,w16', a: '迅捷', s: '光法', t: '召唤' },
      { id: '22', label: '┗2次觉醒', skill: 'w17,w18', a: '爆破', s: '牧师', t: '变身' },
      { id: '221', label: '\xa0\xa0┗3次觉醒', skill: 'w19,w20', a: '爆破', s: '牧师', t: '变身' },
    ],
  },
  computed: {
  },
  components: {
    'arrow': httpVueLoader('js/SkillArrow.vue?t=' + Date.now()),
    'skill': httpVueLoader('js/SkillBox.vue?t=' + Date.now()),
    'popup': httpVueLoader('js/SkillPopup.vue?t=' + Date.now()),
  },
  created() { },
  mounted() {
    this.resetPointParam();
    this.loadData();
    console.log('app.mounted() ', this);
  },
  watch: {
    // 选择的等级低于当前时，重置加点
    sim_pc_level: function (newValue, oldValue) {
      if (newValue < oldValue) this.resetSkillCost();
      this.resetPointParam();
    }
  },
  methods: {
    /** 变更种族 */
    changeRace(race) {
      if (!race) return;
      this.race = race;
      this.activeTab = 1;
      this.sim_pc_wakeup = '0';
      this.loadData();
      this.resetPointParam();
    },
    /** 重置总点数 */
    resetPointParam(level) {
      if (level) this.sim_pc_level = level;
      this.sim_have_point = (this.sim_pc_level - 3) * 2;
      if (this.sim_have_point < 0) {
        this.sim_have_point = 0;
      }
      // Lv60時额外获得2point
      if (this.sim_pc_level >= 60) {
        this.sim_have_point += 2;
      }
    },
    /** 重置技能加点 */
    resetSkillCost() {
      this.skills.map(item => {
        item.cost = 0;
      });
    },
    /** 载入数据 */
    loadData(url) {
      if (!url) {
        url = `data/178${this.race}.uf8`;
      }
      let that = this;
      that.loaded = false;
      axios.get(url + '?t=' + Date.now())
        .then((res) => {
          //console.log('loadData()', url, res.data);
          that.skills = that.parseData(res.data);
          //console.log('loadData()', url, that.skills);
        })
        .catch((err) => {
          console.log('loadData() - Failed', url, err);
        })
        .then(() => {
          that.loaded = true;
        });
    },
    /** 解析数据 */
    parseData(text_data) {
      let t = text_data.split('\n');
      let skills = [];
      let skillObj = {};
      let skillMap = new Map();
      let type = -1; // 标记技能大类别序号
      for (let i = 0; i < t.length; i++) {
        //if ((t[i] === '') || (t[i].charAt(0) === '#')) continue; // 跳过空行和注释
        //if ((t[i].charAt(0) === '!')) continue; //!开头的行说明是新的种类翻页
        //if ((t[i].charAt(0) === '.')) break; // 结尾符号
        let mark = t[i].charAt(0);
        if (['', '#', '.'].includes(mark)) continue;
        if (mark === '!') {
          type = t[i].includes('!覚醒') ? 4 : type + 1;
          continue;
        }
        // 处理数据行
        let c = t[i].split(',');
        if (['*', '$'].includes(mark)) {
          let data = new SkillData();
          data.parse(c);
          data.race = this.race;
          data.type = type;
          data.getLeftPoint = this.getLeftPoint;
          skills.push(data);
          skillObj = data;
          skillMap.set(data.id, data);
        }
        else { // 等级提升数据，要求必须紧跟在技能数据行之后
          skillObj.addLevelText(c);
        }
      }
      // 关联上下级对象
      skills.map(item => {
        let _need = skillMap.get(item.needs) || null;
        if (!_need) return;
        item.need = _need;
        _need.nexts.push(item);
      });
      //console.log('parseData()', skills);
      return skills;
    },
    /** TODO: 读取构建参数 */
    loadBuildCode() {
      return;
      let build_code = window.location.href.split("?b=");
      if (build_code.length < 2) return;
      let code = build_code[1];
      let res = loadBuildCode(code);
      if (res === false) {
        //putErrorMessage('ビルドコードが正しくありません。読み込みませんでした。');
        this.resetPointParam(4);
        this.resetWakeupParam('00');
      }
    },
    /** 设置弹出层 */
    setPopup(data, skill) {
      //console.log('setPopup()', id, e);
      if (!data) {
        this.popupData = null;
        return;
      }
      this.popupData = data;
      // 设置弹出位置
      let area = document.getElementById('middle2').getBoundingClientRect();
      let popup = document.getElementById('popup'); // width: 256px
      let popupWidth = 256;
      let _left = area.width / 2;
      let _top = skill.top - 42;
      if ((skill.left + skill.width + popupWidth) < (area.left + area.width)) {
        _left = skill.left + skill.width + 3;
      } else {
        _left = skill.left - popupWidth - 12;
      }
      popup.style.top = _top + 'px';
      popup.style.left = _left + 'px';
      //console.log(area, skill, _top, _left);      
    },
    /** 获取tab背景图片名称 */
    getTabBgUrl(index) {
      let suffix = 'd';
      if (this.activeTab === index) suffix = 'e';
      else if (this.skillTab[index]['mouseover']) suffix = 'o';
      return `img/${this.race}/t${index}_${suffix}.gif`;
    },
    /** 获得技能数据 */
    skill(id) {
      return this.skills.filter(item => {
        return item.id === id;
      })[0] || new SkillData();
    },
    /** 获得觉醒视图的数据 */
    getWakeupList(id) {
      let _id = id || this.sim_pc_wakeup;
      let _data = null;
      let result = [];
      // 压入存在的数据
      while (_id.length > 0 && _id !== '0') {
        _data = this.wakeups.filter(item => { return item.id === _id; })[0];
        _id = _data.id.substring(0, _data.id.length - 1) || '';
        //console.log(_data, _id);
        if (_data.id.length < 1) continue;
        result.unshift(_data);
        _data.skills = _data.skill.split(',');
        _data.skill1 = this.skill(_data.skill.split(',')[0]);
        _data.skill2 = this.skill(_data.skill.split(',')[1]);
      }
      // 补齐固定长度
      while (result.length < 6) {
        result.push({});
      }
      //console.log('getWakeupList()', result);
      return result;
    },
    /** 获取消耗总点数 */
    getUsedPoint() {
      let result = 0;
      this.skills.map(item => {
        if (item.type === 'wup') return;
        result += item.cost;
      });
      return result;
    },
    /** 获取剩余点数 */
    getLeftPoint() {
      return this.sim_have_point - this.getUsedPoint();
    },
    /** 获得某类别技能使用点数 */
    getTypePoint(type) {
      let result = 0;
      this.skills.map(item => {
        if (item.type === type) result += item.cost;
      });
      return result;
    },
    /** 觉醒选取 */
    handelWakeChange(e) {
      this.wakeupList = this.getWakeupList();
      //console.log('handelWakeChange()', this.sim_pc_wakeup);
    },
    /** 技能点重置 */
    handelPointReset(e) {
      console.log('handelPointReset()', e);
      if (!this.loaded) return;
      this.resetSkillCost();
    },
    /** 技能Tab点击 */
    handelTabClick(index) {
      this.activeTab = index;
      if (this.activeTab === 4) this.wakeupList = this.getWakeupList();
    },
  }
})