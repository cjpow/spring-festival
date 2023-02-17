<template>
  <div class="wrapper" @click="hide = !hide">
    <div class="left col bian">
      天运农历
      &nbsp;
      <div :class="[{hide}]">
        <p>甲辰</p>
        <p>癸卯</p>
      </div>
      &nbsp;
      年
      &nbsp;
      <div :class="[{hide}]">
        <p>正</p>
        <p>腊</p>
      </div>
      &nbsp;
      月
      &nbsp;
      <div :class="[{hide}]">
        <p>初一</p>
        <p>三十</p>
      </div>
      &nbsp;
      吉日
      &nbsp;&nbsp;&nbsp;
      火中化纳
    </div>
    <div class="center col">
      <span :class="[{hide}]">蒋</span>氏門中高曾远祖
      &nbsp;
      <div>
        <p class="span">外戚</p>
        <p class="span">内亲</p>
      </div>
      &nbsp;
      老少亡魂
      &nbsp;&nbsp;
      香位均分
    </div>
    <div class="right col bian">
      恭逢
      &nbsp;
      <div :class="[{hide}]">
        <p>新春</p>
        <p>岁暮</p>
      </div>
      &nbsp;
      之期虔俱
      &nbsp;
      <div>
        <p>长钱</p>
        <p>冥洋</p>
      </div>
      &nbsp;
      若干
      &nbsp;
      <div>
        <p>株 </p>
        <p>圆</p>
      </div>
      &nbsp;&nbsp;&nbsp;
      &nbsp;&nbsp;&nbsp;
      &nbsp;
      奉上
    </div>

    <div class="user">
      化帛人
      &nbsp;
      <span :class="[{hide}]">蒋康友</span>
      &nbsp;
      叩
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      hide: true
    }
  }
}
</script>

<style scoped lang="scss">
//@font-face {
//  font-family: 'HanyiSentyJournal';
//  src: url('../assets/HanyiSentyJournal.ttf');
//}
//
//@font-face {
//  font-family: 'HanyiSentyDiary';
//  src: url('../assets/HanyiSentyDiary.ttf');
//}

@font-face {
  font-family: '方正硬笔楷书';
  src: url('../assets/方正硬笔楷书.ttf');
}
  .wrapper{
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 100vh;
    width: 800px;
    margin: 0 auto;
    font-family: "方正硬笔楷书";
    position: relative;
    white-space: nowrap;
    padding-top: 50px;

    .col{
      display: flex;
      align-items: center;
      justify-content: center;
      writing-mode: tb-rl;
    }

    .center{
      font-size: 29px;
      letter-spacing: 12px;
      font-weight: bold;

      div{
        display: flex;
        flex-direction: column-reverse;
        p{
          margin: 0 60px;
        }
      }
    }

    .bian{
      font-size: 22px;
      letter-spacing: 8px;

      div{
        display: flex;
        flex-direction: column-reverse;

        p{
          margin: 0 42px;
        }
      }
    }

    .hide{
      opacity: 0;
    }

    .btn{
      position: fixed;
      left: 10px;
      top: 10px;
    }

    .user{
      position: absolute;
      left: 32.3%;
      transform: translateX(-50%);
      writing-mode: tb-rl;
      top: 63vh;

      @extend .bian;
    }
  }
</style>
