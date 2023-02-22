# kokkoro-plugin-chatgpt

> 年轻人的第一款人工智能

## 安装

```shell
# 切换至 bot 目录
cd bot

# 安装 npm 包
npm i kokkoro-plugin-chatgpt
```

## 环境变量

你可以在项目根目录下创建 `.env` 文件

```ini
# API key
OPENAI_API_KEY="xxx"
```

因为插件的 Service 是在初始化时创建的，所以如果你修改了 OPENAI_API_KEY 变量，需要使用 reload 指令将插件重新挂载才能生效。
