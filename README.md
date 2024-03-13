This package escapes characters from ChatGPT answers ignoring code blocks (\`\`\`...\`\`\`) for Telegram

```JAVASCRIPT
import escapeMarkdown from 'gpt-telegram-markdown-escape';
// ...

this.telegram.send(chatId, escapeMarkdown(gptAnswer));
```