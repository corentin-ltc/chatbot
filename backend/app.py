from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import os

# Initialize the OpenAI API client
client = OpenAI(api_key="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")

# Initialize Flask app and enable CORS
app = Flask(__name__, static_folder="../frontend/static")
CORS(app, resources={r"/api/*": {"origins": ["http://46.202.168.20:5000", "http://127.0.0.1:5000"]}})

# Define a hidden preprompt (you can modify this as per your requirement)
PREPROMPT = "Tu dois te comporter comme un humain expert dans son domaine (en roleplay), fais des réponses courtes qui vont directement au but, ne sois pas trop nuancé."

# Store chatbots in a dictionary {bot_name: history}
chatbots = {}

# Route for serving the index.html file
@app.route('/')
def home():
    return send_from_directory('../frontend', 'index.html')

# API route to create a new chatbot
@app.route('/api/create-chatbot', methods=['POST'])
def create_chatbot():
    global chatbots

    bot_name = request.json.get('bot_name')
    custom_prompt = request.json.get('custom_prompt')

    if not bot_name or not custom_prompt:
        return jsonify({"error": "Bot name and prompt are required"}), 400

    # Initialize the chatbot's history with the custom prompt and the hidden preprompt
    chatbots[bot_name] = [{"role": "system", "content": PREPROMPT}, {"role": "system", "content": custom_prompt}]

    return jsonify({"success": True}), 200

# API route for chat with a specific chatbot
@app.route('/api/chat', methods=['POST'])
def chat():
    global chatbots

    bot_name = request.json.get('bot_name')
    user_input = request.json.get('user_input')

    if not bot_name or bot_name not in chatbots:
        return jsonify({"error": "Chatbot not found"}), 404

    if not user_input:
        return jsonify({"error": "User input is required"}), 400

    # Get the chatbot's history
    history = chatbots[bot_name]
    history.append({"role": "user", "content": user_input})

    try:
        # Make a request to OpenAI API for response
        response = client.chat.completions.create(
            model="gpt-4-1106-preview",  # Use the appropriate model
            messages=history,
            temperature=0.7
        )

        # Extract the assistant's response
        assistant_response = response.choices[0].message.content

        # Add assistant response to history
        history.append({"role": "assistant", "content": assistant_response})

        return jsonify({"response": assistant_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API route to get the list of all chatbots
@app.route('/api/get-bots', methods=['GET'])
def get_bots():
    bots = [{"name": bot_name} for bot_name in chatbots.keys()]
    return jsonify({"bots": bots})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
