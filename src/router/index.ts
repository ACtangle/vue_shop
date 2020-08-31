import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

const Login = () =>
  import(/*webpackChunkName: "Login_Home_Welcome"*/ '../components/Login.vue')
const Home = () =>
  import(/*webpackChunkName: "Login_Home_Welcome"*/ '../components/Home.vue')
const Welcome = () =>
  import(/*webpackChunkName: "Login_Home_Welcome"*/ '../components/Welcome.vue')

const Users = () =>
  import(
    /*webpackChunkName: "Users_Rights_Roles"*/ '../components/user/Users.vue'
  )
const Rights = () =>
  import(
    /*webpackChunkName: "Users_Rights_Roles"*/ '../components/power/Rights.vue'
  )
const Roles = () =>
  import(
    /*webpackChunkName: "Users_Rights_Roles"*/ '../components/power/Roles.vue'
  )

const Cate = () =>
  import(/*webpackChunkName: "Cate_Params"*/ '../components/goods/Cate.vue')
const Params = () =>
  import(/*webpackChunkName: "Cate_Params"*/ '../components/goods/Params.vue')

const GoodsList = () =>
  import(
    /*webpackChunkName: "Goodslist_Goodsadd"*/ '../components/goods/List.vue'
  )
const GoodsAdd = () =>
  import(
    /*webpackChunkName: "Goodslist_Goodsadd"*/ '../components/goods/Add.vue'
  )

const Order = () =>
  import(/*webpackChunkName: "Order_Report"*/ '../components/order/Order.vue')
const Report = () =>
  import(/*webpackChunkName: "Order_Report"*/ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome,
      },
      {
        path: '/users',
        component: Users,
      },
      {
        path: '/rights',
        component: Rights,
      },
      {
        path: '/roles',
        component: Roles,
      },
      {
        path: '/categories',
        component: Cate,
      },
      {
        path: '/params',
        component: Params,
      },
      {
        path: '/goods',
        component: GoodsList,
      },
      {
        path: '/goods/add',
        component: GoodsAdd,
      },
      {
        path: '/orders',
        component: Order,
      },
      {
        path: '/reports',
        component: Report,
      },
    ],
  },
]

const router = new VueRouter({
  routes,
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to: 即将访问
  // from: 从哪个路径跳转而来
  // next: 函数，代表放行
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
