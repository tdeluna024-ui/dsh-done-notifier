# dsh-done-notifier

当 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）的模型完成一轮回复、等待你输入时，自动弹出 macOS 系统通知，并播放一句童声提示音：

> 「老板，我干完活儿了！快来！」

让你离开电脑/切到别的窗口时，也能第一时间知道「轮到你了」。

## 效果

- 模型每完成一轮回复、状态进入 `idle` 时，触发一次通知。
- 弹出系统通知横幅（标题 `DeepSeek`，正文 `模型已完成，等你回复`）。
- 同时用 `afplay` 播放随包携带的童声提示音。
- 只通知顶层对话，忽略子代理（subagent）的结束，避免轰炸。
- 单轮内模型连续调用多个工具期间状态保持 `running`，不会重复触发。

## 环境要求

- macOS（依赖 `osascript` 与 `afplay`）。
- DSH 已安装，profile 包含提供 `agents` 与 `shell` 服务的宿主组合（`@deepseek-ai/dsh-base` 即满足）。

非 macOS 平台会打印一条警告并跳过，不影响其他功能。

## 安装

```bash
dsh plugin --profile <你的 profile 名> add dsh-done-notifier
```

安装后重启 DSH 生效。若 `dsh` 不在 PATH，改用：

```bash
node <dsh 安装根目录>/apps/cli/lib/bin.js plugin --profile <name> add dsh-done-notifier
```

## 自定义

横幅文案在 `index.js` 顶部的 `TITLE` / `BODY` 常量里；提示音文件在 `assets/notify-kid.mp3`。替换提示音时保持文件名一致即可（`afplay` 支持 mp3 / aiff / m4a / wav）。

## 工作原理

- 监听宿主事件 `agent/status`：状态从 `running` 回到 `idle` 即表示「模型跑完、等待用户」。
- 通过 `ctx.agents.roots()` 识别顶层对话，过滤子代理。
- 用 `shell` 服务依次执行 `osascript`（弹横幅）与 `afplay`（放提示音）。
- 提示音通过 `import.meta.url` 从包目录解析，不依赖任何用户绝对路径。

## License

[MIT](./LICENSE)
