module.exports = {
    projectName: 'Name',
    server: {
        port: 3200
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
        mode: 'static',
        playCycleCount: 24, //11
        // playCycleCou5nt: 6,
        // location: 'eventOne',
        location: 'eventTwo',
        levelRow: 1
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