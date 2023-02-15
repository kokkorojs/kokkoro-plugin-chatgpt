import { Logger } from 'kokkoro';

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

export class ChatGPTService {
  /** API */
  api?: any;
  historyList: Map<number, History>;

  constructor(
    /** 日志 */
    private logger: Logger,
    /** API key */
    private api_key?: string,
  ) {
    this.historyList = new Map();

    import('chatgpt').then((module) => {
      if (!this.api_key) {
        this.logger.warn('你没有添加 api key ，ChatGPT 服务将无法正常使用');
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
}
