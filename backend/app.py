from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS module
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the OpenAI API client
client = OpenAI(api_key="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")

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Read the system prompt from the file
project_path = os.path.dirname(os.path.abspath(__file__))
sys_prompt_path = os.path.join(project_path, './system_prompt.txt')

with open(sys_prompt_path, 'r') as file:
    system_prompt = file.read()

# Initialize conversation history
history = [
    {"role": "system", "content": system_prompt},
]

@app.route('/api/chat', methods=['POST'])
def chat():
    user_input = request.json.get('user_input')

    if user_input:
        # Append the user input to the conversation history
        history.append({"role": "user", "content": user_input})

        try:
            # Make a request to OpenAI API for response
            response = client.chat.completions.create(
                model="gpt-4-1106-preview",  # Use the appropriate model
                messages=history,
                temperature=0.7
            )

            # Extract the assistant's response using the updated response format
            assistant_response = response.choices[0].message.content

            # Add assistant response to history
            history.append({"role": "assistant", "content": assistant_response})

            # Send the response back to the frontend
            return jsonify({"response": assistant_response})

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Invalid input"}), 400

if __name__ == '__main__':
    app.run(debug=True)
