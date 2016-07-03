# selenium-trainer

A simple selenium trainer for Nutaku web games.

- Web interface for monitoring activity (early stages)
- On demand runs
- Schedule runs
- different training modes
-- Daily harvester - Login in daily and get your daily bonuses
-- Event training - Automated special event training. Don't miss out on special events with this training mode. Limited game support
--- Current support
---- Osawari

# Setup

## Prereqs
- NodeJs Installed
- Selenium Server installed and running

Clone repo and install using NPM

```js
npm install
```

Start up web
```js
npm start
```

Browse to web: http://localhost:3100

train :)

# Configure

## config.js

- projectName - name to display in web at top left
- server
-- port - The port number http should bind to
- waitMultiplyer - How much should all wait commands be multiplied by. This can help if you find the trainer isn't waiting longer enough. Often helps with slower internet.
- nutaku
-- username - nutaku user to login as
-- password - password to use when logging in
- game.active
-- what engines to load and run when manual run is triggered
- selenium
-- browser - what browser to have selenium use
-- host - host of selenium server
-- port - port the selenium server is listen on
-- path - path to use when getting a driver instance
-- protocol - which protocol to use when connecting to selenium sertver. http or https
