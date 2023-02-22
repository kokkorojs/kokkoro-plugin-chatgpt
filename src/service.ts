import { Plugin } from '@kokkoro/core';

type Role = 'user' | 'assistant';

type SendMessageOptions = {
  conversationId?: string;
  parentMessageId?: string;
  messageId?: string;
  stream?: boolean;
  promptPrefix?: string;
  promptSuffix?: string;
  timeoutMs?: number;
  onProgress?: (partialResponse: ChatMessage) => void;
  abortSignal?: AbortSignal;
};

interface ChatMessage {
  id: string;
  text: string;
  role: Role;
  parentMessageId?: string;
  conversationId?: string;
  detail?: any;
}

interface History {
  conversationId?: string;
  parentMessageId?: string;
}

export class Service {
  api?: any;
  api_key?: string;
  /** 消息历史 */
  historyList: Map<number, History>;
  /** 消息队列 */
  messageQueue: string[];

  constructor(
    /** 插件 */
    private plugin: Plugin,
  ) {
    this.api_key = process.env.OPENAI_API_KEY;
    this.historyList = new Map();
    this.messageQueue = [];

    import('chatgpt').then((module) => {
      if (!this.api_key) {
        this.plugin.logger.warn('你没有添加 api key ，ChatGPT 服务将无法正常使用');
        return;
      }
      const { ChatGPTAPI } = module;

      this.api = new ChatGPTAPI({
        apiKey: this.api_key,
      });
    });
  }

  async sendMessage(user_id: number, message: string): Promise<string> {
    if (!this.api) {
      throw new Error('你没有添加 api key ，ChatGPT 服务将无法正常使用');
    }
    this.messageQueue.push(message);

    const history: History = this.historyList.get(user_id) ?? {};
    const options: SendMessageOptions = {
      conversationId: history.conversationId,
      parentMessageId: history.parentMessageId,
    };
    const { conversationId, parentMessageId, text } = await this.api.sendMessage(message, options) as ChatMessage;

    history.conversationId = conversationId;
    history.parentMessageId = parentMessageId;

    this.historyList.set(user_id, history);

    return text;
  }

  /**
   * 获取消息队列
   */
  getMessageQueue(): string[] {
    return this.messageQueue;
  }
}
