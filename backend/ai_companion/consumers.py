import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

class AICompanionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001) # Unauthorized
            return
            
        await self.accept()
        
        # Initial greeting from AI
        await self.send(text_data=json.dumps({
            'type': 'message',
            'sender': 'ai',
            'text': f"System initialized. Identity verified: {self.user.name}. I am Mind_AI, your cognitive firewall. State your query."
        }))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('text', '')

        # 1. Check for Crisis Triggers
        if 'panic' in message.lower() or 'emergency' in message.lower():
            await self.send(text_data=json.dumps({
                'type': 'CRISIS_PROTOCOL',
                'sender': 'ai',
                'text': "CRITICAL ALERT OVERRIDE. Initiating grounding protocol immediately. Take a deep breath. Focus on 5 things you can see."
            }))
            return

        # 2. Simulated OpenAI Streaming
        await self.stream_ai_response(message)

    async def stream_ai_response(self, user_message):
        """
        Simulates an asynchronous OpenAI API call streaming back chunk by chunk.
        """
        mock_response = f"Received data packet. Acknowledged: '{user_message}'. Suggest running a defrag cycle tonight."
        words = mock_response.split(' ')

        # Send start of stream signal
        await self.send(text_data=json.dumps({
            'type': 'stream_start',
            'sender': 'ai'
        }))

        # Send chunks
        for word in words:
            await asyncio.sleep(0.1) # Simulate network delay / token generation
            await self.send(text_data=json.dumps({
                'type': 'stream_chunk',
                'chunk': word + " "
            }))

        # Send end of stream signal
        await self.send(text_data=json.dumps({
            'type': 'stream_end'
        }))
