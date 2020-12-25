<template>
  <div class="arrow" :class="type">
    <img :src="`img/${type}_${getSuffix()}.gif`" />
  </div>
</template>
 
<script>
module.exports = {
  props: {
    type: { type: String, default: "down" }, // down left lleft right wr
    need: { type: String, default: null }, // SkillData
    tar1: { type: String, default: null }, // SkillData
    tar2: { type: String, default: null }, // SkillData
  },
  data: () => {
    return {};
  },
  computed: {
    needLv() {
      let data = this.$root.skill(this.need);
      return typeof data["lv"] === "number" ? data["lv"] : 0;
    },
    tar1Needl() {
      let data = this.$root.skill(this.tar1);
      return typeof data["needl"] === "number" ? data["needl"] : 999;
    },
    tar2Needl() {
      let data = this.$root.skill(this.tar2);
      return typeof data["needl"] === "number" ? data["needl"] : 999;
    },
  },
  watch: {},
  mounted() {},
  methods: {
    /** 获取后缀字符 */
    getSuffix() {
      // 判断是否满足等级要求
      let suffix = this.needLv >= this.tar1Needl ? "e" : "d";
      if (this.type === 'wr' && this.tar2) {
        suffix = suffix + (this.needLv >= this.tar2Needl ? "e" : "d");
      }
      return suffix;
      //console.log("getSuffix()", this);
    },
  },
};
</script>
 
<style scoped>
.down {
  margin: 0;
}
.left, .right, .wr {
  height: 72px;
  margin: 0;
}
.left > img, .right > img, .wr > img {
  margin-top: -7px;
}
.lleft {
  height: 144px;
}
.lleft > img {
  margin-top: -1px;
}
.arrow {
  cursor: default;
  -moz-user-select: none;
  -o-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>