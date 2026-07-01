import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://qy4t6j33.us-east.insforge.app',
  anonKey: 'ik_f50434d9fbcbd8c7b6eae3d527afa7ee',
});

async function main() {
  try {
    const response = await insforge.ai.chat.completions.create({
      model: 'anthropic/claude-sonnet-4.5',
      messages: [{ role: 'user', content: 'hola' }],
    });
    console.log("Success:", response);
  } catch (error) {
    console.error("Error details:", error);
  }
}

main();
