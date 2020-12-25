<template>
  <div class="desc_wnd"> <!-- :style="`top: ${offset.top}px; left: ${offset.left}px`" -->
    <div class="dw_title">{{ skill.name }} Lv. {{ skill.lv || 1 }}</div>
    <div class="dw_point">[{{ skill.lv + "/" + skill.max }}]</div>
    <div class="dw_head">
      <div class="dw_icon">
        <img :src="skill.getImgURL()" height="64" width="64" />
      </div>
      <div class="dw_kind">
        {{ skill.kindState }}<br />{{ skill.kindTarget }}
      </div>
    </div>
    <div class="dw_desc">
      <div v-show="skill.getN('ct') && skill.getN('ct') !== '无'">咏唱时间 {{ skill.getN("ct") }}</div>
      <div v-show="skill.getN('dt')">
        冷却时间 {{ skill.getN("dt") ? skill.getN("dt") : "无" }}
      </div>
      <div v-show="skill.getN('rg')">射程距離 {{ skill.getN("rg") }}</div>
      <div class="dw_orange">{{ skill.text }}</div>
      <div class="dw_blue">{{ skill.getN("nt") }}</div>
      <br />
      <div class="dw_disable">
        <span class="dw_white" v-show="skill.getN('cl')">解锁条件：</span>
        <span v-show="skill.getN('cl')" class="dw_white">角色等级 {{ skill.getN("cl") }}</span>
        <span v-show="skill.needl" style="margin: 0 6px;">|</span>
        <span v-show="skill.needl" class="dw_white">前置技能 {{ skill.needl }}</span>
      </div>
    </div>
  </div>
</template>
 
<script>
module.exports = {
  props: {
    data: { type: Object, default: null }, // SkillData
    offset: { type: Object, default: {top: 0, left: 0} },
    // active: false, // 激活状态
  },
  data: () => {
    return {};
  },
  computed: {
    skill() {
      return this.data || new SkillData();
    },
    isEnable() {
      return this.skill.isActive(this.$root.sim_pc_level);
    },
  },
  watch: {},
  mounted() {},
  methods: {
    /** 获取后缀字符 */
    getSuffix() {
      let suffix = this.needLv >= this.tar1Needl ? "e" : "d";
      if (this.type === "wr" && this.tar2) {
        suffix = suffix + (this.needLv >= this.tar2Needl ? "e" : "d");
      }
      return suffix;
      //console.log("getSuffix()", this);
    },
  },
};
</script>
 
<style scoped>
.desc_wnd {
  position: fixed;
  margin: 0px;
  border: 1px solid #4e5253;
  vertical-align: top;
  text-align: left;
  color: #fff;
  background: #182f3d;
  padding: 4px;
  font-size: 10pt;
  width: 256px;
  filter: alpha(opacity=90);
  -moz-opacity: 0.9;
  opacity: 0.9;
  z-index: 1024;
  cursor: default;
  pointer-events:none;
  -moz-user-select: none;
  -o-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.dw_title {
  float: left;
}
.dw_point {
  text-align: right;
}
.dw_head {
  margin: 4px 0px;
  vertical-align: top;
  text-align: left;
  color: #fff;
  background: #444;
  padding: 2px;
  font-size: 10pt;
  height: 74px;
}
.dw_head_a {
  border: 1px solid #5b5253;
  border-top-color: #928a88;
  border-left-color: #928a88;
}
.dw_head_p {
  border: 1px solid #496475;
  border-top-color: #7493a7;
  border-left-color: #7493a7;
}
.dw_icon {
  float: left;
  vertical-align: middle;
  text-align: center;
  width: 72px;
  height: 72px;
  padding: 4px;
}
.dw_icon_a {
  background: #f13b38;
}
.dw_icon_p {
  background: #1288ba;
}
.dw_kind {
  float: left;
  vertical-align: top;
  text-align: left;
  font-size: 10pt;
  padding: 8px;
}
.dw_blue {
  color: #84d8f2;
}
.dw_orange {
  color: #e5b65e;
}
.dw_red {
  color: #f00;
}
.dw_white {
  color: #fff;
}
.dw_enable {
  color: #fff;
}
.dw_disable {
  color: #aaa;
}
</style>