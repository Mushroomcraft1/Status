# How To Run
1) Install [NodeJS](https://nodejs.org) on your system
2) Edit the [config file](https://github.com/Mushroomcraft1/Status/blob/main/config.json) to select what services you want to track the status of and if you want to get notified ect.
3) Run [start.bat](https://github.com/Mushroomcraft1/Status/blob/main/start.bat) (Windows) or [start.sh](https://github.com/Mushroomcraft1/Status/blob/main/start.sh) Linux to start it
4) Go to http://localhost/ to see it in action!
# Config Info
```js
{
    "devs": ["717070380795428866", "442724872326479899"], // Discord User IDs to mention for Discord webhooks
    "message": "{\"content\":\"%DEVS%, **%SYSTEM%** is offline!\"}", // Content of the POST request
    "webhook": {
        "host": "discord.com", // host to POST to if a system is offline
        "port": 443, // port
        "path": "/api/webhooks/<webhookID>/<webhookToken>" // path
    },
    "serverport": 80, // HTTP server port
    "pingfrequency": 5000, // how often to send a GET request
    "storageduration": 600000, // how long to store PING history
    "systems": [ // array of all the pages to PING
        {
           "name": "Website", // Display name
           "host": "slashbot.dev", // host
           "port": 443, // port
           "path": "/api/stats", // path (a light page is recomended)
           "colour": "#e06900", // (optional) Colour that the graph will appear in the web page
           "notify": true // (optional) Whether to send a POST request to the webhook or not if the system is offline
        }
    ]
}
```
