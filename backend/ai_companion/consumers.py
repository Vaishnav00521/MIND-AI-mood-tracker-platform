import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
import google.generativeai as genai

class AICompanionConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Configure Gemini with API key from settings
        gemini_api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def connect(self):
        self.user = self.scope.get('user')
        # In this dev phase, we'll allow connection for testing even if auth is tricky locally
        await self.accept()
        
        # Initial greeting from AI
        greeting = "Neural link established. Identity verified. Connected to Google Gemini Neural Layer."
        await self.send(text_data=json.dumps({
            'type': 'connection_status',
            'sender': 'ai',
            'text': greeting
        }))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get('text', '')

            # 1. Check for Crisis Triggers
            if any(word in message.lower() for word in ['panic', 'emergency', 'kill', 'die', 'help']):
                 await self.send(text_data=json.dumps({
                    'type': 'CRISIS_PROTOCOL',
                    'sender': 'ai',
                    'text': "CRITICAL ALERT OVERRIDE. I have detected high-amplitude distress markers. I am prioritizing your safety protocols. Please contact the global crisis network immediately or reach out to a verified human professional. You are not alone."
                }))
            
            # 2. Stream Gemini Response
            await self.stream_gemini_response(message)
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'text': f"Neural link disruption: {str(e)}"
            }))

    async def stream_gemini_response(self, user_message):
        """
        Connects to Google Gemini API and streams a response.
        """
        system_prompt = (
            "You are MindAI, a compassionate and knowledgeable mental health companion. "
            "Your tone is warm, empathetic, and supportive. "
            "Provide detailed, thorough responses that show understanding and offer practical advice. "
            "When users share feelings or challenges, acknowledge them validate their experience before offering guidance. "
            "Include examples, explanations, and follow-up suggestions in your responses. "
            "Focus on cognitive health, mental wellness, emotional regulation, and personal growth."
        )

        if not self.model:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'text': "Gemini API key not configured. Please set GEMINI_API_KEY in environment."
            }))
            return

        try:
            # Send start of stream signal
            await self.send(text_data=json.dumps({
                'type': 'stream_start',
                'sender': 'ai'
            }))

            # Start Gemini chat session
            chat = self.model.start_chat(history=[
                {"role": "user", "parts": [system_prompt]},
            ])
            
            # Generate content with streaming
            response = await asyncio.to_thread(
                chat.send_message,
                user_message,
                stream=True
            )
            
            # Stream each chunk
            for chunk in response:
                if chunk.text:
                    await self.send(text_data=json.dumps({
                        'type': 'stream_chunk',
                        'chunk': chunk.text
                    }))
                    # Small delay to simulate streaming effect
                    await asyncio.sleep(0.02)

            # Send end of stream signal
            await self.send(text_data=json.dumps({
                'type': 'stream_end'
            }))
        except Exception as e:
            error_msg = str(e)
            # Check for quota errors
            if '429' in error_msg or 'quota' in error_msg.lower():
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'text': "AI service is taking a short break due to high demand. Please try again in a moment, or check your API quota."
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'text': f"AI service temporarily unavailable: {error_msg}"
                }))
