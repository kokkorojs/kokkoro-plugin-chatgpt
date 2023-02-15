import { Plugin } from 'kokkoro';
import { ChatGPTService } from './service';

const { version } = require('../package.json');
const plugin = new Plugin('chat');
const service = new ChatGPTService(plugin.logger, process.env.OPENAI_API_KEY);

plugin
  .version(version)

plugin
  .command('send <message>')
  .description('发送消息')
  .sugar(/^咨询\s?(?<message>.+)$/)
  .action(async (ctx) => {
    const { query, sender } = ctx;
    const { message } = query;
    const { user_id } = sender;
    const text = await service.sendMessage(user_id, message);

    await ctx.reply(text);
  })
