const https = require("https")
const http = require("http")
const fs = require("fs")
const config = require("./config.json")
let devs = "", history = []
config.systems.forEach(s => { const pings = []; while (pings.length < Math.floor(config.storageduration / config.pingfrequency)) pings.push(null); history.push({ name: s.name, colour: s.colour, pings: pings }) })
for (const d of config.devs) devs += `<@${d}> `
const server = http.createServer((req, res) => {
    try {
        if (req.url === "/") {
            const c = fs.readFileSync("./status.html", "ascii")
            res.writeHead(200)
            return res.end(c)
        } else if (req.url === "/status") {
            res.writeHead(200)
            return res.end(JSON.stringify(history))
        } else {
            res.writeHead(404)
            return res.end("404 Not found")
        }
    } catch (err) {
        console.log(err)
        res.writeHead(500)
        return res.end("500 Internal server error")
    }
})
server.listen(config.serverport)
console.log("HTTP server running → PORT %i", config.serverport)
setInterval(() => {
    for (const s of config.systems) {
        let data = "", newHistory = []
        history.forEach(sys => {
            if (sys.name === s.name) sys.pings.shift(), sys.pings.push(null)
            newHistory.push(sys)
        })
        history = newHistory
        function addHistory(ping) {
            newHistory = []
            history.forEach(sys => {
                if (sys.name === s.name) sys.pings[sys.pings.length - 1] = ping
                newHistory.push(sys)
            })
            history = newHistory
        }
        const start = new Date().getTime()
        if (s.port === 443) {
            const req = https.request({ "hostname": s.host, "path": s.path, "port": 443, "method": "GET" }, res => {
                res.on("data", (chunk) => {
                    data += chunk
                })
                res.on("end", () => {
                    const ping = new Date().getTime() - start
                    // console.log("Pinged %s, %ims", s.name, ping)
                    addHistory(ping)
                })
            })
            req.on("error", () => {
                notify(s)
                addHistory(null)
            })
            req.end()
        } else {
            const req = http.request({ "hostname": s.host, "path": s.path, "port": s.port, "method": "GET" }, res => {
                res.on("data", (chunk) => {
                    data += chunk
                })
                res.on("end", () => {
                    const ping = new Date().getTime() - start
                    addHistory(ping)
                })
            })
            req.on("error", () => {
                notify(s)
                addHistory(null)
            })
            req.end()
        }
    }
}, config.pingfrequency)
async function notify(system) {
    if (!system.notify) return
    console.log("%s is offline!", system.name)
    const data = config.message.replaceAll("%DEVS%", devs).replaceAll("%SYSTEM%", system.name)
    if (config.webhook.port === 443) {
        const req = https.request({ "hostname": config.webhook.host, "path": config.webhook.path, "port": 443, "method": "POST", headers: { "Content-Type": "application/json", "Content-Length": data.length } })
        req.on("error", () => { console.log("Failed to notify Devs") })
        req.write(data)
        req.end()
    } else {
        const req = http.request({ "hostname": config.webhook.host, "path": config.webhook.path, "port": config.webhook.port, "method": "POST", headers: { "Content-Type": "application/json", "Content-Length": data.length } })
        req.on("error", () => { console.log("Failed to notify Devs") })
        req.write(data)
        req.end()
    }
}