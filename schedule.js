module.exports = [
  {
    title: 'hellfire daily',
    settings: {
      engine: [
        'hellfire',
        'hellfireUS'
      ],
      mode: 'daily'
    },
    // schedule: { minute: 0, hour: 21 }
    schedule: { minute: 23, hour: 16 }
  },
  {
    title: 'osawari event',
    settings: {
      engine: [
        'osawari',
      ],
      mode: 'static',
      playCycleCount: 3,
      // playCycleCou5nt: 6,
      // location: 'eventOne',
      location: 'eventTwo',
      levelRow: 1
    },
    // schedule: { minute: 0, hour: 21 }
    schedule: { minute: 24, hour: 16 }
  }
];