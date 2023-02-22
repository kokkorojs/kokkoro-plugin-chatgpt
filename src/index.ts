import { Plugin, Option } from '@kokkoro/core';
import { Service } from './service';

interface ChatGPTOption extends Option {
  /** 消息超时，默认2分钟 */
  timeout: number;
}

const option: ChatGPTOption = {
  apply: true,
  lock: false,
  timeout: 2 * 60 * 1000,
};
const pkg = require('../package.json');
const plugin = new Plugin('chat', option);
const service = new Service(plugin);

plugin
  .version(pkg.version)

plugin
  .command('send <message>')
  .description('发送消息')
  .sugar(/^咨询\s?(?<message>.+)$/)
  .action(async (ctx) => {
    const { query, sender } = ctx;
    const { message } = query;
    const { user_id } = sender;
    await ctx.reply('处理中，请等待...', true);

    const text = await service.sendMessage(user_id, message);
    await ctx.reply(text, true);
  })

plugin
  .command('queue')
  .description('获取消息队列')
  .sugar(/^消息队列$/)
  .action(async (ctx) => {
    const messageQueue = service.getMessageQueue();
    await ctx.reply(`当前队列共有 ${messageQueue.length} 条消息待处理：\n${messageQueue.map(message => `  “${message}”\n`)}`);
  })
