<template>
  <div>
    <nav-header></nav-header>
    <nav-bread>
      <span slot="bread">Goods</span>
    </nav-bread>
    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">Sort by:</span>
          <a href="javascript:void(0)" class="default cur">Default</a>
          <a href="javascript:void(0)" class="price" @click="sortGoods">
            Price 
            <svg class="icon icon-arrow-short" :class="{'sort-up':!sortFlag}"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-arrow-short">
            <svg id="icon-arrow-short" viewBox="0 0 25 32" width="100%" height="100%"><title>arrow-short</title> <path d="M24.487 18.922l-1.948-1.948-8.904 8.904v-25.878h-2.783v25.878l-8.904-8.904-1.948 1.948 12.243 12.243z" class="path1"></path></svg>
            </use></svg>
          </a>
          <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter" :class="{'filterby-show': filterBy}">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd @click="setPriceFilter('all')"><a href="javascript:void(0)" :class="{'cur': priceChecked == 'all'}">All</a></dd>
              <dd v-for="(price, index) in priceFilter" @click="setPriceFilter(index)">
                <a href="javascript:void(0)" :class="{'cur': priceChecked == index}">{{ price.startPrice }} - {{ price.endPrice }}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="item in goodsList">
                  <div class="pic">
                    <a href="#"><img v-lazy="'/static/' + item.productImage"></a>
                  </div>
                  <div class="main">
                    <div class="name">{{ item.productName }}</div>
                    <div class="price">{{ item.salePrice | currency}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>
              </ul>

              <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>

    <modal :mdShow="mdShow" @close="closeModal">
      <p slot="msg">请先登录，否则无法加入到购物车中！</p>
      <div slot="btn-group">
        <a class="btn btn-m" href="javascript:;" @click="mdShow = false">关闭</a>
      </div>
    </modal>

    <modal :mdShow="mdShowCart" @close="closeModal">
      <p slot="msg">加入购物车成功！</p>
      <div slot="btn-group">
        <a class="btn btn-m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
        <router-link to="/cart" class="btn btn-m">查看购物车</router-link>
      </div>
    </modal>

    <nav-footer></nav-footer>
  </div>
</template>

<script>
  import './../assets/css/base.css'
  import './../assets/css/login.css'
  import './../assets/css/product.css'

  import NavHeader from '@/components/NavHeader'
  import NavFooter from '@/components/NavFooter'
  import NavBread from '@/components/NavBread'
  import Modal from '@/components/Modal'
  import axios from 'axios'

  export default{
    data(){
      return {
        goodsList: [],
        priceFilter: [
          {
            startPrice: '0.00',
            endPrice: '500.00'
          },
          {
            startPrice: '500.00',
            endPrice: '1000.00'
          },
          {
            startPrice: '1000.00',
            endPrice: '2000.00'
          }
        ],
        priceChecked: 'all',
        filterBy: false,
        overLayFlag: false,
        sortFlag: true,
        page: 1,
        pageSize: 8,
        busy: true, // default disabled
        loading: false,
        mdShow: false,
        mdShowCart: false
      }
    },
    components: {
      NavHeader,
      NavFooter,
      NavBread,
      Modal
    },
    filters: {
      currency(value) {
        return `$${value.toFixed(2)}`;
      }
    },
    mounted () {
      this.getGoodsList()
    },
    methods: {
      getGoodsList(paging) {
        const param = {
          page: this.page,
          pageSize: this.pageSize,
          sort: this.sortFlag ? 1 : -1,
          priceLevel: this.priceChecked
        }
        this.loading = true;
        axios.get('/goods/list', {
          params: param
        }).then(res => {
          const _res = res.data;
          this.loading = false;
          if (_res.status == '0') {
            if (paging) { // accumulate data
              this.goodsList = [...this.goodsList, ..._res.result.list];
              if (_res.result.count < this.pageSize) {
                this.busy = true;
              } else {
                this.busy = false;
              }
            } else {
              this.goodsList = _res.result.list;
              this.busy = false;
            }
          } else {
            this.goodsList = [];
          }
        });
      },
      sortGoods() {
        this.sortFlag = !this.sortFlag;
        this.page = 1;
        this.getGoodsList(true);
      },
      loadMore() {
        this.busy = true;
        setTimeout(() => { // in case excessive load
          this.page++;
          this.getGoodsList(true);
        }, 500);
      },
      showFilterPop() {
        this.filterBy = true;
        this.overLayFlag = true;
      },
      setPriceFilter(index) {
        this.priceChecked = index;
        this.page = 1;
        this.getGoodsList();
        this.closePop();
      },
      closePop() {
        this.filterBy = false;
        this.overLayFlag = false;
      },
      addCart(productId) {
        axios.post('/goods/addCart', {
          productId: productId
        }).then(res => {
          if (res.data.status == '0') {
            this.mdShowCart = true;
          } else {
            this.mdShow = true;
          }
        });
      },
      closeModal() {
        this.mdShow = false;
        this.mdShowCart = false;
      }
    }
  }
</script>
