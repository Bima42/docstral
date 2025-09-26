import type { ChatMessage, ChatMetrics } from '@/types/chat';

export const MOCK_MESSAGES: ChatMessage[] = [
	{
		id: '1',
		role: 'user',
		content: 'What are the main differences between Mistral 7B and Mistral Large?',
		timestamp: new Date(Date.now() - 300000), // 5 min ago
	},
	{
		id: '2',
		role: 'assistant',
		content: `Great question! Here are the key differences between Mistral 7B and Mistral Large:

**Mistral 7B:**
- 7 billion parameters
- Optimized for speed and efficiency
- Perfect for general tasks, coding assistance
- Lower computational requirements
- Open-source model

**Mistral Large:**
- Much larger parameter count (exact number not disclosed)
- Superior performance on complex reasoning tasks
- Better multilingual capabilities
- Higher computational requirements
- Available through API

**Use Cases:**
- Use Mistral 7B for: Quick responses, coding, simple Q&A
- Use Mistral Large for: Complex analysis, research, advanced reasoning

Would you like me to elaborate on any specific aspect?`,
		timestamp: new Date(Date.now() - 280000), // 4m40s ago
		metadata: {
			tokensUsed: 156,
			latency: 1200,
			model: 'mistral-large-latest'
		}
	},
	{
		id: '3',
		role: 'user',
		content: 'How do I integrate Mistral API in a React application?',
		timestamp: new Date(Date.now() - 60000), // 1 min ago
	},
	{
		id: '4',
		role: 'assistant',
		content: `Here's a step-by-step guide to integrate Mistral API in React:

## 1. Installation
\`\`\`bash
npm install @mistralai/mistralai
\`\`\`

## 2. Basic Setup
\`\`\`typescript
import MistralClient from '@mistralai/mistralai';

const client = new MistralClient(process.env.MISTRAL_API_KEY);
\`\`\`

## 3. React Hook Example
\`\`\`typescript
const useMistralChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setLoading(true);
    try {
      const response = await client.chat({
        model: 'mistral-large-latest',
        messages: [...messages, { role: 'user', content }]
      });
      
      setMessages(prev => [...prev, response.choices[0].message]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};
\`\`\`

This gives you a solid foundation. Need help with streaming responses?`,
		timestamp: new Date(Date.now() - 30000), // 30s ago
		isStreaming: true,
		metadata: {
			tokensUsed: 89,
			latency: 890,
			model: 'mistral-large-latest'
		}
	}
];

export const MOCK_METRICS: ChatMetrics = {
	totalMessages: 4,
	totalTokensIn: 245,
	totalTokensOut: 387,
	averageLatency: 1045,
	errorRate: 0,
	estimatedCost: 0.0123,
	lastUpdated: new Date()
};