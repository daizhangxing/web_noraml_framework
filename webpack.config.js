/*
  开发环境配置：能让代码运行
    运行项目指令：
      webpack 会将打包结果输出出去
      npx webpack-dev-server 只会在内存中编译打包，没有输出
*/

const {resolve} = require('path');
//帮postcss找到package.json中browserslist里面的配置，通过配置加载指定的css兼容性样式
// "browserslist": {
//     // 开发环境 --> 设置node环境变量：process.env.NODE_ENV = development
//     "development": [
//         "last 1 chrome version",
//         "last 1 firefox version",
//         "last 1 safari version"
//     ],
//         // 生产环境：默认是看生产环境
//         "production": [
//         ">0.2%",
//         "not dead",
//         "not op_mini all"
//     ]
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//压缩css
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
//html进行打包
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 定义nodejs环境变量：决定使用browserslist的哪个环境
// process.env.NODE_ENV = 'production';
process.env.NODE_ENV = 'development';

// 复用loader
const commonCssLoader = [
    //这个loader取代style-loader，将css从js中抽离出来
    MiniCssExtractPlugin.loader,

    'css-loader',
    {
        // 还需要在package.json中定义browserslist
        loader: 'postcss-loader',
        options: {
            ident: 'postcss',   //css兼容性处理：postcss --> postcss-loader postcss-preset-env
            plugins: () => [require('postcss-preset-env')()]
        }
    }
];

module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: 'js/built.js',
        path: resolve(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [...commonCssLoader]
            },
            {
                test: /\.less$/,
                use: [...commonCssLoader, 'less-loader']
            },
            /*
              正常来讲，一个文件只能被一个loader处理。
              当一个文件要被多个loader处理，那么一定要指定loader执行的先后顺序：
                先执行eslint 在执行babel
            */
            //js代码检查 一般不用
            // {
            //   // 在package.json中eslintConfig --> airbnb
            //   test: /\.js$/,
            //   exclude: /node_modules/,
            //   // 优先执行
            //   enforce: 'pre',
            //   loader: 'eslint-loader',
            //   options: {
            //     fix: true
            //   }
            // },

            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    // 预设：指示babel做怎么样的兼容性处理
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                // 按需加载
                                useBuiltIns: 'usage',
                                // 指定core-js版本
                                corejs: {version: 3},
                                // 指定兼容性做到哪个版本浏览器
                                targets: {
                                    chrome: '60',
                                    firefox: '60',
                                    ie: '9',
                                    safari: '10',
                                    edge: '17'
                                }
                            }
                        ]
                    ]
                }
            },
            {
                test: /\.(jpg|png|gif)/,
                loader: 'url-loader',
                options: {
                    limit: 8 * 1024,  //小于8K的图片 转换成base64z字符串输出
                    name: '[hash:10].[ext]',
                    // 关闭es6模块化,不然无法解析html中的图片
                    outputPath: 'imgs',
                    esModule: false
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                exclude: /\.(js|css|less|html|jpg|png|gif)/,
                loader: 'file-loader',
                options: {
                    outputPath: 'media'
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/built.css'
        }),
        new OptimizeCssAssetsWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            // 压缩html代码
            minify: {
                // 移除空格
                collapseWhitespace: true,
                // 移除注释
                removeComments: true
            }
        })
    ],
    // mode: 'production',
    mode: 'development',
    devServer: {
        contentBase: resolve(__dirname, 'build'),
        compress: true,
        port: 3000,
        open: true
    },
    devtool: 'source-map'
    /*
  source-map: 一种 提供源代码到构建后代码映射 技术 （如果构建后代码出错了，通过映射可以追踪源代码错误）

    [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map

    source-map：外部
      错误代码准确信息 和 源代码的错误位置
    inline-source-map：内联
      只生成一个内联source-map
      错误代码准确信息 和 源代码的错误位置
    hidden-source-map：外部
      错误代码错误原因，但是没有错误位置
      不能追踪源代码错误，只能提示到构建后代码的错误位置
    eval-source-map：内联
      每一个文件都生成对应的source-map，都在eval
      错误代码准确信息 和 源代码的错误位置
    nosources-source-map：外部
      错误代码准确信息, 但是没有任何源代码信息
    cheap-source-map：外部
      错误代码准确信息 和 源代码的错误位置 
      只能精确的行
    cheap-module-source-map：外部
      错误代码准确信息 和 源代码的错误位置 
      module会将loader的source map加入

    内联 和 外部的区别：1. 外部生成了文件，内联没有 2. 内联构建速度更快

    开发环境：速度快，调试更友好
      速度快(eval>inline>cheap>...)
        eval-cheap-souce-map
        eval-source-map
      调试更友好  
        souce-map
        cheap-module-souce-map
        cheap-souce-map

      --> 结论：eval-source-map  / eval-cheap-module-souce-map

    生产环境：源代码要不要隐藏? 调试要不要更友好
      内联会让代码体积变大，所以在生产环境不用内联
      nosources-source-map 全部隐藏
      hidden-source-map 只隐藏源代码，会提示构建后代码错误信息

      --> source-map / cheap-module-souce-map
*/
};
