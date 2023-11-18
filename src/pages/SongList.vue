<template>
  <div class="song-list-wrapper">
    <header class="anniu">歌单列表</header>
    <div class="search-input" v-if="showSearchInput">
      <input type="text" v-model="filterTxt" autofocus placeholder="请输入关键词">
    </div>
    <section class="song-list">
      <div class="list-inner">
        <div class="song-item"
             :class="{active: clickIndex === songItem.id}"
             @click="clickIndex = songItem.id"
             v-for="songItem in songListCalc"
             :key="songItem.id">
          <span class="id">{{ songItem.id }}.</span>
          <span class="name">{{ songItem.name }}</span>
        </div>
      </div>
    </section>

    <div class="search-btn" @click="closeSearch"></div>
  </div>
</template>

<script>
import langJson from '@/assets/lang/langJson.json'

export default {
  name: 'SongList',
  computed: {
    songListCalc () {
      if (this.showSearchInput) return this.songList.filter(item => item.name.includes(this.filterTxt))
      return this.songList
    }
  },
  data () {
    return {
      filterTxt: '',
      showSearchInput: false,

      songList: langJson,
      clickIndex: undefined
    }
  },
  methods: {
    closeSearch () {
      this.showSearchInput = !this.showSearchInput

      if (!this.showSearchInput) {
        this.filterTxt = ''
      }
    }
  },
  mounted () {
    document.title = '选歌单'
  }
}
</script>

<style scoped lang="scss">
.song-list-wrapper {
  height: 100%;
  width: 100%;
  $headerHeight: 100px;
  color: white;
  display: flex;
  flex-direction: column;

  &:after {
    content: '';
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-image: url("~@/assets/image/bg-new.png");
    background-size: cover;
    background-position: left center;
    z-index: -1;
    //animation: fade 2s infinite ease-in-out alternate-reverse;
  }

  header {
    height: $headerHeight;
    font-size: 40px;
    border-bottom: 1px solid white;
    line-height: $headerHeight;
    font-weight: bold;
    color: mediumpurple;
    width: calc(100% - 40px);
    margin: 0 auto;
  }

  .search-input {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px auto 0;
    width: calc(100% - 80px);
    border-bottom: 1px solid #f9f9f9;

    input {
      background-color: transparent;
      appearance: none;
      -webkit-appearance: none;
      border: none;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      width: 100%;
      height: 100%;
      height: 100%;
      text-indent: 10px;
      color: white;
      font-size: 25px;

      &:active, &:focus {
        appearance: none;
        -webkit-appearance: none;
        border: none !important;
        outline: none;
      }
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
      margin: 0;
    }

    input::placeholder {
      font-size: 25px;
      color: white;
    }
  }

  .song-list {
    width: 100%;
    height: 0;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .list-inner {
      overflow-y: scroll;
      height: calc(100% - 40px);
      width: calc(100% - 40px);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;
      align-content: flex-start;

      .song-item {
        width: 49%;
        height: 58px;
        text-align: left;
        padding-left: 10px;
        display: flex;

        .id {
          font-style: italic;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          font-size: 23px;
        }

        .name {
          font-weight: bold;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          line-height: 1.2;
          font-size: 26px;
        }

        &.active {
          color: orange;
        }
      }
    }
  }

  .search-btn {
    position: fixed;
    height: 50px;
    width: 50px;
    top: #{$headerHeight / 2};
    transform: translateY(-50%);
    right: 40px;
    background-image: url("~@/assets/image/search.png");
    background-size: cover;
    background-position: left center;
  }
}
</style>
