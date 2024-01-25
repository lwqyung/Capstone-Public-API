# Capstone-Public-API

This project demonstrates using a public REST API, specifically from exchangerate-api.com, who provides currency exchange rates and conversions. 

Prerequisites:
This web backend requires the following to be already installed in your environment:
  - Bash
  - npm
  - nodemon

In order for this backend to actually use this provider's API, you need to replace <API_KEY> in this line of index.js:

  const API_URL = "https://v6.exchangerate-api.com/v6/<API_KEY>/";

with an actual API key from the provider. At the time of this project, you can obtain an API key with a free account (limited by a monthly quota and daily exchange rate updates).

After making the above change, to run the backend, you will need to do the following:
  1. In a BASH shell, run "npm i" to install the backend dependencies.
  2. Run "nodemon index.js" to start the backend.
