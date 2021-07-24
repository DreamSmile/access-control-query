<template>
  <div class="home">
    <h1>门禁考勤查询
    </h1>
    <!-- 查询区 -->
    <div class="edit_box">
      <div class="user_info">
        <h2>{{userName || '--'}}</h2>
        <span>手机号：{{phone || '0000'}}</span>
      </div>
      <div class="time_info">
        <div class="start">
          <p>开始时间</p>
          <div>
            <span @click="showStart = true">{{ formatDate(start)}}</span>
            <van-icon color="#8e8e8e" name="arrow-down" />
            <van-calendar title="开始时间" v-model="showStart" :min-date="startMin" :max-date="new Date()" @confirm="confirmStart" />
          </div>
        </div>
        <p class="line">--</p>
        <div class="end">
          <p>结束时间</p>
          <div>
            <span @click="endCli">{{formatDate(end)}}</span>
            <van-icon color="#8e8e8e" name="arrow-down" />
            <van-calendar title="结束时间" v-model="showEnd" :min-date="start" :max-date="endMax" @confirm="confirmEnd" />
          </div>
        </div>
      </div>
      <div class="state_info">
        <span>处理状态</span>
        <van-radio-group v-model="radio" direction="horizontal">
          <van-radio :name="2">全部</van-radio>
          <van-radio :name="1">成功</van-radio>
          <van-radio :name="0">异常</van-radio>
        </van-radio-group>
      </div>
      <button class="btn" @click="check">查询</button>
    </div>
    <!-- 异常处理区 -->
    <div class="err_box" v-if="errList.length>0">
      <span class="err_title">异常数据{{errList.length}}条</span>
      <button class="err_btn" @click="handle">一键处理</button>
    </div>
    <!-- 显示区 -->
    <div class="tips">
      <span>考勤正常</span>
      <span>考勤异常</span>
      <span>正在处理</span>
    </div>
    <div class="show_box">
      <div class="list_box">
        <div class="items" v-for="(item,i) in itemList" :key="i">
          <div class="row">
            <span class="problem">刷卡时间</span>
            <div class="round first_round" :style="{backgroundColor:item.calresult_flag==1?'#5177fe':item.calresult_flag==0?'#ff4d58':'#3e3e3e'}"></div>
            <span>{{item.checktime|| '刷卡时间未知'}}</span>
          </div>
          <div class="row">
            <span class="problem">设备号</span>
            <div class="round"></div>
            <span>{{item.device || '地点'}}</span>
          </div>
          <div class="row">
            <span class="problem">处理时间</span>
            <div class="round"></div>
            <span class="answer">{{item.caltime || '处理时间未知'}}</span>
          </div>
          <!-- v-if="item.calresult_flag==0" -->
          <div class="row" v-if="item.calresult_flag==0">
            <span class="problem" :style="{color:item.calresult_flag==1?'#5177fe':item.calresult_flag==0?'#ff4d58':'#3e3e3e'}">异常原因</span>
            <div class="round"></div>
            <span class="answer" :style="{color:item.calresult_flag==1?'#5177fe':item.calresult_flag==0?'#ff4d58':'#3e3e3e'}">{{item.calresult || '该员工没有绑定总部人资系统和全渠道系统'}}</span>
          </div>
        </div>
        <van-empty v-if="itemList.length==0" description="请选择时间查看记录~" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      radio: 2,
      state: 1,
      start: new Date(), //开始时间
      end: new Date(), //结束时间
      showStart: false, //开始日历
      showEnd: false, //结束日历
      startMin: new Date(this.min()),
      endMax: new Date(), //结束时间最大=开始时间当月的最后一天
      itemList: [],
      errList: [], //错误列表
      userName: "",
      phone: "",
    };
  },
  created() {
    this.$utils.showToast("请稍等。。", { type: "loading" });
  },
  mounted() {
    this.$toast.clear();
    this.getUser();
  },
  methods: {
    // 一键处理异常
    handle() {
      this.$utils.showDialog("功能暂未实现~");
    },
    // 根据微信获得用户信息
    getUser() {
      let { isGo = false, wxtoken } = this.$route.query;
      //当缓存中有用户信息，并且距离上次鉴权没超过3天
      if (localStorage.getItem("VISA_USER") && this.$utils.overdue()) {
        this.userName = JSON.parse(localStorage.getItem("VISA_USER")).name;
        this.phone = JSON.parse(localStorage.getItem("VISA_USER")).mobile;
        return;
      }
      // 当上一层是鉴权界面，就会携带isGo(自定义参数)和wxtoken(鉴权界面携带)
      if (isGo && wxtoken) {
        //根据获得的wxtoken通过接口获得用户信息
        try {
          this.$apis
            .getUserInfoByToken({
              action: "getUserInfoByToken",
              wxtoken: wxtoken,
            })
            .then((res) => {
              console.log(res);
              if (res.errcode != 0) {
                this.$utils.showDialog(res.errmsg);
                return;
              }
              //将获得的用户信息存入localStorage
              localStorage.setItem("VISA_TIME", new Date().getTime());
              localStorage.setItem("VISA_USER", JSON.stringify(res.data[0]));
              this.userName = JSON.parse(
                localStorage.getItem("VISA_USER")
              ).name;
              this.phone = JSON.parse(localStorage.getItem("VISA_USER")).mobile;
            })
            .catch((err) => {
              this.$utils.showDialog(err, "错误");
            });
        } catch (error) {
          alert(err);
        }
        return;
      }
      // 当缓存中没有用户信息或者时间戳超过了三天，就重新鉴权
      if (!localStorage.getItem("VISA_USER") || !this.$utils.overdue()) {
        let { origin, pathname } = window.location;
        //注意isGo为自定义参数，当界面通过鉴权返回当前界面时可用来判断是否是刚鉴权结束
        let backurl = encodeURIComponent(`${origin}${pathname}#/?isGo=true`);
        let url =
          "http://tm.lilanz.com/oa/api/WxAuthForLilanz.ashx?&action=wxAuth&configkey=1&backurl=";
        window.location.replace(url + backurl); //打开鉴权界面
      }
    },
    // 开始时间的最小时间,当前时间的去年今天
    min() {
      let time = new Date();
      return `${Number(time.getFullYear() - 1)},${Number(
        time.getMonth() + 1
      )},${Number(time.getDate())}`;
    },
    // 结束最大时间为开始时间当月最后天,1:选择的是以前的月份，最大是到30,2：选择当月，就返回今天日期为最大选择
    endMaxFun() {
      return this.start.getMonth() == new Date().getMonth()
        ? new Date()
        : new Date(
            Number(this.start.getFullYear()),
            Number(this.start.getMonth() + 1),
            0
          );
    },
    // 查询
    check() {
      if (!this.userName) {
        this.$utils.showDialog("用户名称获取失败~");
        return;
      }
      this.$utils.showToast("请稍等。。", { type: "loading" });
      this.itemList = [];
      this.errList = [];
      let datas = {
        ksrq: this.formatDate(this.start),
        jsrq: this.formatDate(this.end),
        username: this.userName,
        calresult: this.radio,
      };
      let formdata = new FormData();
      formdata.append("data", JSON.stringify(datas));
      this.$apis
        .getList(formdata)
        .then((res) => {
          this.$toast.clear();

          console.log(res);
          if (res.errcode != 0) {
            this.$utils.showDialog(res.errmsg);
            return;
          }
          if (res.data.length < 1) {
            this.$utils.showToast("没有记录哦~", { duration: 2500 });
          }
          this.itemList = res.data;
          let errArr = [];
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].calresult_flag == 0) {
              errArr.push(res.data[i]);
            }
          }
          this.errList = errArr;
        })
        .catch((err) => {
          this.$toast.clear();
          this.$utils.showDialog(err);
        });
    },
    // 日历显示格式
    formatDate(date) {
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    },
    // 点击结束
    endCli() {
      this.endMax = this.endMaxFun();
      this.showEnd = true;
    },
    // 开始
    confirmStart(date) {
      this.showStart = false;
      this.start = date;
    },
    // 结束
    confirmEnd(date) {
      this.showEnd = false;
      this.end = date;
    },
  },
};
</script>
<style scoped lang="less">
.home {
  background-color: #f8f8f8;
  height: 100%;
  width: 100%;
  padding: 0 14px;
  overflow-y: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  h1 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
    padding-top: 20px;
  }
  .edit_box {
    background-color: #fff;
    padding: 14px;
    box-sizing: border-box;
    border-radius: 8px;
    .user_info {
      h2 {
        font-weight: bold;
        font-size: 16px;
        display: inline-block;
        margin-right: 6px;
      }
      span {
        font-size: 12px;
      }
    }
    .time_info {
      margin: 16px 0;
      display: flex;
      align-items: center;
      .start,
      .end {
        p {
          color: #505050;
          margin-bottom: 6px;
        }
        div {
          span {
            font-weight: 600;
            display: inline-block;
            margin-right: 6px;
            vertical-align: middle;
          }
          i {
            vertical-align: middle;
          }
        }
      }
      .line {
        margin-left: 14px;
      }
      .end {
        margin-left: 14px;
      }
    }
    .state_info {
      display: flex;
      align-items: center;
      span {
        margin-right: 10px;
      }
      /deep/.van-radio__label {
        font-size: 16px;
      }
    }
    .btn {
      width: 100%;
      color: #fff;
      background-color: #000;
      padding: 12px 0;
      border-radius: 99px;
      margin-top: 20px;
    }
  }
  .err_box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: #fff;
    margin: 20px 0 12px 0;
    .err_title {
      font-weight: 500;
    }
    .err_btn {
      color: #df7383;
      border-radius: 99px;
      padding: 3px 6px;
      font-size: 12px;
      background-color: #fee5e9;
    }
  }
  .tips {
    margin: 6px 0;
    span {
      padding-left: 20px;
      display: inline-block;
      position: relative;
      &:before {
        content: "";
        width: 10px;
        height: 10px;
        border-radius: 50%;
        position: absolute;
        top: 2px;
        left: 7px;
        background-color: #5176e8;
      }
    }
    span:nth-child(2) {
      &::before {
        background-color: #f45a5a;
      }
    }
    span:nth-child(3) {
      &::before {
        background-color: #3e3e3e;
      }
    }
  }
  .show_box {
    overflow-y: auto;

    .list_box {
      // height: calc(100% - 320px);
      // overflow-y: auto;
      .items {
        padding: 10px;
        box-sizing: border-box;
        background-color: #fff;
        margin-bottom: 16px;
        .row {
          display: flex;
          align-items: center;
          margin-bottom: 18px;
          .problem {
            text-align: right;
            width: 4em;
            display: inline-block;
          }
          .round {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #eaeaea;
            margin: 0 10px;
            position: relative;
            z-index: 5;
            &::before {
              content: "";
              height: 27px;
              width: 3px;
              background-color: #ebebeb;
              position: absolute;
              top: 10px;
              left: 4px;
              z-index: 1;
            }
          }
        }
        .first_round {
          width: 12px;
          height: 12px;
        }
        .answer {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: calc(100% - 7em);
        }
      }
      .row:last-child {
        margin-bottom: 0;
        .round {
          &::before {
            height: 0;
            width: 0;
          }
        }
      }
    }
  }
}
</style>
