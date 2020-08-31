module.exports = {
  chainWebpack: (config) => {
    // 发布环境
    config.when(process.env.NODE_ENV === 'production', (config) => {
      config.entry('app').clear().add('./src/main-prod.ts')

      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        lodash: '_',
        axios: 'axios',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor',
      })

      config.plugin('html').tap((args) => {
        args[0].isProd = true
        return args
      })
    })

    // 开发环境
    config.when(process.env.NODE_ENV === 'development', (config) => {
      config.entry('app').clear().add('./src/main-dev.ts')

      config.plugin('html').tap((args) => {
        args[0].isProd = false
        return args
      })
    })
  },
}
