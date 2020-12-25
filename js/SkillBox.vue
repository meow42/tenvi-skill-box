<template>
  <div class="skill">
    <div
      v-if="skill.type === 4"
      @mouseenter="handelMouseenter"
      @mouseleave="handelMouseleave"
    >
      <img :src="skill.getImgURL(isEnable)" />
    </div>
    <div
      v-if="skill.type !== 4"
      :class="isEnable ? 'enable_box' : 'disable_box'"
      @click="handelClick"
      @contextmenu="handelRightClick"
      @mouseenter="handelMouseenter"
      @mouseleave="handelMouseleave"
    >
      <img :src="skill.getImgURL(isEnable && skill.lv > 0)" />
      <div :class="isEnable && skill.lv > 0 ? 'enable_tbox' : 'disable_tbox'">
        <span class="lv">{{ skill["lv"] }}/{{ skill["max"] }}</span>
        <img
          class="plus"
          src="img/plus.gif"
          v-show="isEnable && !skill['isMax']"
        />
      </div>
    </div>
    <div class="arrow">
      <slot></slot>
    </div>
  </div>
</template>
 
<script>
module.exports = {
  props: {
    id: { type: String, default: null }, // 字符串ID
  },
  computed: {
    skill() {
      let _skill = this.$root.skill(this.id);
      return _skill["id"] ? _skill : new SkillData();
    },
    isEnable() {
      return this.skill.isActive(this.$root.sim_pc_level);
    },
  },
  watch: {},
  methods: {
    /** 监听左键点击 */
    handelClick(e) {
      if (!this.isEnable) return;
      if (e.ctrlKey) e.shiftKey ? this.skill.toMin() : this.skill.add(-1);
      else e.shiftKey ? this.skill.toMax() : this.skill.add(1);
      //console.log("handelClick()", this);
    },
    /** 监听右键点击 */
    handelRightClick(e) {
      // 屏蔽右键菜单
      if (e.stopPropagation) e.stopPropagation();
      if (window.event) window.event.cancelBubble = true;
      if (e.preventDefault) e.preventDefault();
      if (window.event) window.event.returnValue = false;

      if (!this.isEnable) return;
      if (e.ctrlKey) e.shiftKey ? this.skill.toMax() : this.skill.add(1);
      else e.shiftKey ? this.skill.toMin() : this.skill.add(-1);
      //console.log("handelRightClick()", this);
    },
    /** 监听鼠标进入事件 */
    handelMouseenter(e) {
      this.$root.setPopup(this.skill, this.$el.getBoundingClientRect());
      //console.log("handelMouseenter()", this, offset);
    },
    /** 监听鼠标移出事件 */
    handelMouseleave(e) {
      this.$root.setPopup();
    },
    /** 获取相对于根节点的偏移 */
    getOffset(el) {
      if (!el) el = this.$el;
      let _x = 0;
      let _y = 0;
      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
      }
      return { top: _y, left: _x };
    },
  },
};
</script>
 
<style scoped>
.skill {
  width: fit-content;
  height: auto;
  text-align: center;
  border-color: rgb(95, 55, 0);
  cursor: pointer;
  -moz-user-select: none;
  -o-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.disable_box {
  margin: 0px;
  border: 1px solid #cfbda5;
  vertical-align: top;
  text-align: center;
  color: #000;
  background: #f6dfcd;
  padding: 2px 1px 1px 1px;
  font-size: 9pt;
  width: 52px;
  height: 52px;
}
.enable_box {
  margin: 0px;
  border: 1px solid #5f3700;
  vertical-align: top;
  text-align: center;
  color: #000;
  background: #f6dfcd;
  padding: 2px 1px 1px 1px;
  font-size: 9pt;
  width: 52px;
  height: 52px;
}
.disable_tbox {
  margin: 1px -1px 0;
  border: 1px solid #b3a18d;
  vertical-align: bottom;
  text-align: left;
  color: #eee;
  background: #caa;
  font-size: 9pt;
  width: 52px;
  height: 18px;
}
.enable_tbox {
  margin: 1px -1px 0;
  border: 1px solid #be531b;
  vertical-align: bottom;
  text-align: left;
  color: #fff;
  background: #f44;
  font-size: 9pt;
  width: 52px;
  height: 18px;
}
.lv {
  width: 33px;
  display: inline-block;
  text-align: center;
  padding-top: 1px;
}
.plus {
  float: right;
  margin: 1px -1px 0 0;
}
.arrow {
  height: 15px;
}
</style>