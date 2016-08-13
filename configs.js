module.exports = {
    projectName: 'Nutaku Trainer',
    server: {
        port: 3100
    },
    waitMultiplyer: 2,
    natuku: {
        username: "rahvin708@yahoo.com",
        password: "n1s1m0n3"
    },
    game: {
        active: [
            // 'hellfireUS',
            // 'hellfire',
            'osawari'
            // 'aigis',
            
        ]
    },
    osawari: {
        // mode: 'daily',
        // mode: 'selloff',
        mode: 'static',
        // mode: 'advancement',
        playCycleCount: 14, //11
        sellOffCount: 5,
        // playCycleCount: 6,
        level: {
            location: -2,
            start: 14
        },
    },
    aigis: {
        mode: 'daily'
    },
    hellfireUS:{
        mode: 'daily'
    },
    hellfire:{
        mode: 'daily'
    },
    selenium: {
        // browser: 'firefox',
        // browser:'ie',
        browser: 'chrome',
        host: "127.0.0.1",
        port: '4444',
        path: '/wd/hub',
        protocol: 'http'
    }
}