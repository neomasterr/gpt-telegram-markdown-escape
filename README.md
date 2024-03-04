This package escapes characters from ChatGPT answers ignoring code blocks (\`\`\`...\`\`\`) for Telegram

```JAVASCRIPT
import {escape as escapeMarkdown} from 'gpt-telegram-markdown-escape';
// ...

this.telegram.send(chatId, escapeMarkdown(gptAnswer));
```