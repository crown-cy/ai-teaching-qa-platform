# AI助教答疑平台

这是一个可直接运行的课程演示项目，包含个性化注册页、登录页和与作业截图一致的答疑工作台。项目采用原生 HTML、CSS、JavaScript，不依赖 Node.js、接口服务或第三方框架。

## 快速运行

直接双击 `index.html` 即可。也可以依次打开：

1. `register.html`：完成个性化注册。
2. `login.html`：使用刚注册的账号登录。
3. `app.html`：进入答疑工作台，体验多轮提问。

未注册时可以使用演示账号：

- 用户名：`demo`
- 密码：`Demo@123`

## 页面说明

- 注册页：姓名、学号、邮箱、身份、学院、兴趣方向、头像、密码和协议确认。
- 登录页：账号或邮箱登录、记住账号、密码显示切换和原生校验。
- 答疑页：课程切换、连续追问、附件名称、清空记录、字数统计和演示回答。

## 表单增强

项目使用了 `required`、`pattern`、`minlength`、`maxlength`、`type=email`、`autocomplete`、`inputmode`、`spellcheck`、`fieldset`、`legend`、`meter`、`output`、`FormData`、`validity`、`setCustomValidity()` 和 `reportValidity()` 等 HTML5 能力。详细说明见 [课后任务提交说明](docs/课后任务提交说明.md)。

## 数据范围

账号和对话仅保存在当前浏览器的 `localStorage` 中，用于课程演示。密码经过浏览器 Web Crypto SHA-256 摘要后保存，但本项目仍然不是生产级身份系统。
