// vue.config.js
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const resolve = (dir) => path.join(__dirname, dir)

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; //Webpack包文件分析器

const prodid = ['production'].includes(process.env.NODE_ENV)
const deveid = ['development'].includes(process.env.NODE_ENV)

const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer

const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  parallel: require('os').cpus().length > 1,
  publicPath: '/',
  outputDir: process.env.BASE_URL,
  assetsDir: 'static',
  configureWebpack: config => {
    let plugins = []
    if(prodid) {

      // 压缩js css
      plugins.push(
        new UglifyJsPlugin({
          uglifyOptions: {
            warnings: false,
            parse: {},
            compress: {},
            mangle: true, // Note `mangle.properties` is `false` by default.
            output: null,
            toplevel: false,
            nameCache: null,
            ie8: false,
            keep_fnames: false,
          },
          sourceMap: false,
          parallel: true
        })
      );

      // 预加载
      plugins.push(
        new PrerenderSpaPlugin({
          staticDir: resolve("dist"),
          routes: ["/"],
          postProcess(ctx) {
            ctx.route = ctx.originalRoute;
            ctx.html = ctx.html.split(/>[\s]+</gim).join("><");
            if (ctx.route.endsWith(".html")) {
              ctx.outputPath = path.join(__dirname, "dist", ctx.route);
            }
            return ctx;
          },
          minify: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            decodeEntities: true,
            keepClosingSlash: true,
            sortAttributes: true
          },
          renderer: new Renderer({
            // 需要注入一个值，这样就可以检测页面当前是否是预渲染的
            inject: {},
            headless: false,
            // 视图组件是在API请求获取所有必要数据后呈现的，因此我们在dom中存在“data view”属性后创建页面快照
            renderAfterDocumentEvent: "render-event"
          })
        })
      );

      // gzip压缩
      plugins.push(
        new CompressionWebpackPlugin({
          filename: "[path].gz[query]",
          algorithm: "gzip",
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8
        })
      );

    }

    config.plugins = [...config.plugins, ...plugins];
  },

  chainWebpack: config => {

      // 添加别名
      config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('pages', resolve('src/pages'))
      .set('base', resolve('src/base'))
      .set('static', resolve('src/static'));


      config.module
        .rule("images")
        .use("image-webpack-loader")
        .loader("image-webpack-loader")
        .options({
          mozjpeg: { progressive: true, quality: 65 },
          optipng: { enabled: false },
          pngquant: { quality: [0.65, 0.9], speed: 4 },
          gifsicle: { interlaced: false }
          // webp: { quality: 75 }
        });

  },
  devServer: {
    hotOnly: prodid? false: true ,
    host: '0.0.0.0',
    port: 8001,
    https: false,
    // open: true,
    proxy: {
      '/api': {
        target: 'http://192.168.198.107:3579/api',
        changeOrigin: true,
        secure: false,
        pathRewrite:{
          '^/api':''
        },
        headers: {
          'Referer':'localhost:8001',
          'host': '0.0.0.0'
        }
      },
      '/file': {
        target: 'http://192.168.198.107:3579/file',
        changeOrigin: true,
        secure: false,
        pathRewrite:{
          '^/file':''
        },
        headers: {
          'Referer':'localhost:8001',
          'host': '0.0.0.0'
        }
      },
    },
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        // path.resolve(__dirname, './src/assets/scss/_common.scss'),
      ],
    }
  }
}