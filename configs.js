module.exports = {
    projectName: 'Name',
    server: {
        port: 3100
    },
    waitMultiplyer: 1,
    natuku: {
        username: "rahvin708@yahoo.com",
        password: "n1s1m0n3"
    },
    game: {
        active: [
            'osawari',
            // 'aigis',
            // 'hellfireUS',
            'hellfire'
        ]
    },
    osawari: {
        url: "http://www.nutaku.net/games/osawari-island/play/",
        mode: 'daily',
        // mode: 'static',
        playCycleCount: 16, //11
        // playCycleCou5nt: 6,
        location: 'eventOne',
        // location: 'eventTwo',
        levelRow: 2
    },
    aigis: {
        url: "http://www.nutaku.net/games/millennium-war-aigis/play/",
        mode: 'daily'
    },
    hellfireUS:{
        url: "http://www.nutaku.net/games/hellfire-girls-us/play/",
        mode: 'daily'
    },
    hellfire:{
        url: "http://www.nutaku.net/games/hellfire-girls/play/",
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