# thunfisch-chat
ChatGPT like web app for OpenAI APIs 🖥️

ADDED TOOLS FOR HOMEASSISTANT INSTANCES.  
**NOT MEANT FOR PUBLIC HOSTING!**

## Setup

These environmental variables are needed. A simple way is to create an `.env` file. Keep in mind that Anthropic API is not able to use the tools currently.

```
PORT=XXXX
OPENAI_SECRET="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
ANTHROPIC_SECRET="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
HOMEASSISTANT_URL="http://127.0.0.1:8123"
HOMEASSISTANT_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Also you need to create a `devices.json` file which contains all of your smart home devices (and a small description) you want to control via GPT. Example:

```
{
    "light.schlafzimmer_kommode": "Licht auf der Kommode im Schlafzimmer",
    "switch.buro_computer": "Computer im Büro"
}
```