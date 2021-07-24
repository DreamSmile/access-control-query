const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
    productionSourceMap: false,
    configureWebpack: (config) => {
        config.plugins.forEach((val) => {
            if (val instanceof HtmlWebpackPlugin) {
                val.options.title = 'IM 门禁考勤查询';
            }
        })
    },
    devServer: {
        disableHostCheck: true,
        host: '0.0.0.0',
        port: 8088,
        proxy: {
            '/api': {
                target: 'http://tm.lilanz.com/oa/project/facepass/pushmessage.ashx?servername=svr-build/att&action=LoadHikList',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            '/wxApi': {
                target: 'http://tm.lilanz.com/oa/api/WxAuthForLilanz.ashx',
                changeOrigin: true,
                pathRewrite: {
                    '^/wxApi': ''
                }
            },
        }
    }
}