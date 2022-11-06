# Chatbot

Chatbot that resolves simple calculations, implemented with the MERN stack and socket.io.

## Installing Dependencies

1. **Node** - Follow the instructiioons to install the lastest version of node for this project in the node documents (https://nodejs.dev/en/learn/how-to-install-nodejs/)
   This has been build with the version 16.15.0.

2. **npm dependencies** - Install the required dependencies by navigating to the root folder of this project and run. Do the same in the frontend folder.

```bash
npm install
```

## Set up locally

1. Fork the project and clone it from the github repository

2. Create an MongoDB database in Altas.

3. Create an .env file and enter the following code with the data from your MongoDB database:

```bash
MONGODB_PASSWORD=""
USER=""
```

4. Install the required dependencies by navigating to the root folder of this project and run. Do the same in the frontend folder.

```bash
npm install
```

5. Run the app

```bash
npm run dev
```

## Run tests

Run the following command:

```bash
npm run test
```

## Deployment Setup

This website get automatically deployed to Heroku by pushing the main branch to github.

### Endpoint Documentation

`on "old messages"`

- Fetches the lastest 10 calculations from the database
- Request argument: None
- Return: an object with two keys, `old_messages`, that contains an object of all old messages, and `success`

```json
{
  "success": true,
  "oldMessagesList": [
    {
      "_id": "6366ddfb2c4a9c87f275a18c",
      "userMessage": "1 + 2",
      "botAnswer": "3",
      "createdAt": "2022-11-05T22:04:43.816Z",
      "updatedAt": "2022-11-05T22:04:43.816Z",
      "__v": 0
    },
    {
      "_id": "6366de042c4a9c87f275a18f",
      "userMessage": "2 * 4",
      "botAnswer": "8",
      "createdAt": "2022-11-05T22:04:52.982Z",
      "updatedAt": "2022-11-05T22:04:52.982Z",
      "__v": 0
    }
  ]
}
```

`on "chat message"`

- Fetches the response to the message the user has send
- Request argument: user message
  -Return: an object with two keys, `message`, that contains the answer message from the bot, and `success`

```bash
{ success: true, message: 3 }
```
