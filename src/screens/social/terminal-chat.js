const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws');
const readline = require('readline');

// Polyfill WebSocket for Node.js
Object.assign(global, { WebSocket });

// --- CONFIGURATION ---
// Pass these as environment variables or hardcode them here for testing
const JWT = process.env.JWT || "PASTE_JWT_HERE";
const CHANNEL_ID = process.env.CHANNEL_ID || "CHANNEL_ID_HERE";
const USER_NAME = process.env.USER_NAME || "Terminal User";
const BACKEND_URL = 'ws://localhost:8083/ws'; // Ensure this matches your SOCIAL API port

// Setup interactive terminal input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
rl.setPrompt(`${USER_NAME} > `);

const client = new Client({
    brokerURL: BACKEND_URL,
    connectHeaders: {
        Authorization: `Bearer ${JWT}`
    },
    onConnect: () => {
        console.log(`\n✅ [${USER_NAME}] Successfully connected to STOMP over RabbitMQ!`);
        console.log(`💬 Joined Channel: ${CHANNEL_ID}\n`);

        // Subscribe to incoming messages
        client.subscribe('/user/queue/messages', (message) => {
            const payload = JSON.parse(message.body);
            
            // Clear the current input line, print the received message, and restore the prompt
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            console.log(`\n📩 [Received]: ${payload.content}`);
            rl.prompt();
        });

        // Prompt user to start typing
        rl.prompt();

        // Listen for the user hitting "Enter" in the terminal
        rl.on('line', (input) => {
            if (input.trim() === '') {
                rl.prompt();
                return;
            }

            // Publish the message to Spring Boot
            client.publish({
                destination: '/app/chat.send',
                body: JSON.stringify({
                    channelId: CHANNEL_ID,
                    content: input.trim()
                })
            });
            
            rl.prompt();
        });
    },
    onStompError: (frame) => {
        console.error("\n❌ Broker reported error: " + frame.headers['message']);
        console.error("❌ Details: " + frame.body);
        process.exit(1);
    },
    onWebSocketError: (event) => {
        console.error("\n❌ WebSocket connection failed. Is the Social API running?");
        process.exit(1);
    }
});

// Start the connection
client.activate();
