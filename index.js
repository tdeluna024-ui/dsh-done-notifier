import { fileURLToPath } from 'node:url'

// 提示音随包一起分发，从包自身目录解析，绝不依赖任何用户的绝对路径。
const SOUND_PATH = fileURLToPath(new URL('./assets/notify-kid.mp3', import.meta.url))

export const name = 'dsh-done-notifier'

// 依赖宿主组合中的 agents（识别顶层对话）与 shell（执行通知命令）。
export const inject = ['agents', 'shell']

export function apply(ctx) {
  // 当前实现依赖 macOS 的 osascript（横幅）与 afplay（播放提示音）。
  if (process.platform !== 'darwin') {
    console.warn('[dsh-done-notifier] 当前仅支持 macOS，已跳过通知。')
    return
  }

  // 通知横幅与文案，可按需修改。
  const TITLE = 'DeepSeek'
  const BODY = '模型已完成，等你回复'

  function notify() {
    // 先弹系统横幅，再播放童声提示音。
    const command = [
      `osascript -e 'display notification "${BODY}" with title "${TITLE}"'`,
      `afplay "${SOUND_PATH}"`
    ].join(' ; ')
    try {
      const spec = ctx.shell.resolve({ command, timeoutMs: 10000 })
      ctx.shell.run(spec).catch((err) => {
        console.error('[dsh-done-notifier] 发送通知失败', err)
      })
    } catch (err) {
      console.error('[dsh-done-notifier] 构造通知命令失败', err)
    }
  }

  ctx.on('agent/status', (payload) => {
    if (!payload || payload.status !== 'idle') return
    const agent = payload.agent
    if (!agent) return
    // 只通知顶层对话，忽略子代理（subagent）的结束，避免通知轰炸。
    const isRoot = ctx.agents.roots().some((r) => r === agent || (r && r.id === agent.id))
    if (!isRoot) return
    notify()
  })
}
