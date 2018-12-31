(function () {
  // API 來源
  //https://opendata.epa.gov.tw/Data/Contents/AQI/

  let cardComponent = {
    props: ['items'],
    computed: {
      status() {
        if (this.items.AQI <= 50) {
          return 'status-aqi1';
        } else if (this.items.AQI <= 100) {
          return 'status-aqi2';
        } else if (this.items.AQI <= 150) {
          return 'status-aqi3';
        } else if (this.items.AQI <= 200) {
          return 'status-aqi4';
        } else if (this.items.AQI <= 300) {
          return 'status-aqi5';
        } else {
          return 'status-aqi6';
        }
      }
    },
    methods: {
      starStatus() {
        this.items.star = !this.items.star;
        this.$emit('stared-status');
      }
    },
    template: `<div class="card":class="status">
    <div class="card-header">
      {{items.County}} - {{items.SiteName}} <a href="javascript:;" class="float-right" v-on:click="starStatus">
      <div v-show="!items.star"><i class="far fa-star" ></i></div>
      <div v-show="items.star"><i class="fas fa-star"></i></div>
      </a>
    </div>
    <div class="card-body">
      <ul class="list-unstyled">
        <li>AQI 指數: {{items.AQI}}</li>
        <li>PM2.5: {{items['PM2.5']}}</li>
        <li>說明: {{items.Status}}</li>
      </ul>
      {{items.PublishTime}}
    </div>
  </div>
  </div>`
  };

  let app = new Vue({
    el: '#app',
    data: {
      data: [],
      stared: JSON.parse(localStorage.getItem('staredData')) || [],
      filter: '',
    },
    components: {
      'card-component': cardComponent,
    },
    computed: {
      filterCounty() {
        let county = [];
        this.data.forEach(el => {
          county.push(el.County);
        });
        return county.filter((el, index, arr) => {
          return arr.indexOf(el) === index;
        })
      },
      filterData() {
        let filter = this.filter;
        let data = this.data;
        if (filter === '') {
          return data;
        } else {
          return data.filter(county => {
            return county.County === filter;
          })
        }
      },
      getStaredData() {
        let dataFilter = [];
        this.stared.forEach(stared => {
          this.data.forEach(newData => {
            if (newData.SiteName === stared.SiteName) {
              this.$set(newData, 'star', true);
              dataFilter.push(newData);
            }
          })
        })
        return dataFilter;
      }
    },
    methods: {
      addToStared(item) {
        //isRepeat 是判斷條件
        if (item.star) {
          let isRepeat = function (el) {
            //這邊的el是指將被調用的陣列值
            return el.SiteName === item.SiteName
          }
          let check = this.stared.some(isRepeat);
          if (!this.stared.length) {
            this.stared.push(item);

          } else {
            if (!check) {
              this.stared.push(item);
            } else {
              return;
            }
          }
        } else {
          let staredZone = []
          this.stared.forEach((el, index) => {
            staredZone.push(el.SiteName);
            if (staredZone.indexOf(item.SiteName) === index) {
              this.removeFromStared(index);
            }
          })
        }
        this.setStar();
        this.staredData();
      },
      removeFromStared(index) {
        console.log(index)
        this.stared.splice(index, 1)
        this.staredData()
      },
      staredData() {
        this.setStar();
        let staredDataItem = JSON.stringify(this.stared);
        localStorage.setItem('staredData', staredDataItem);
        let staredData = JSON.parse(localStorage.getItem('staredData'));
        this.stared = staredData;
      },
      setStar() {
        let vm = this;
        vm.data.forEach(el => {
          vm.stared.forEach(stared => {
            if (el.SiteName === stared.SiteName) {
              vm.$set(el, 'star', true);
            } else {
              vm.$set(el, 'star', false);
            }
          })
        })
      }
    },
    mounted() {
      const vm = this;
      let url = 'https://opendata.epa.gov.tw/ws/Data/AQI/?$format=json';
      $.ajax({
        url: url,
        contentType: 'application/json',
        method: 'GET',
        dataType: 'jsonp'
      }).done(function (response) {
        vm.data = response;
        // console.log(response);
      });
      this.setStar()
    }
  });
})();