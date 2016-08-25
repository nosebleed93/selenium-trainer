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
    schedule: { minute: 0, hour: 21 }   // 9PM EST
    // schedule: { minute: 18, hour: 2 }   // testing settings
  },
  {
    title: 'osawari event night',
    settings: {
      engine: [
        'osawari',
      ],
      mode: 'static',
      playCycleCount: 14,
      sellOffCount: 5,
      level: {
          location: -2,
          start: 14
      },
    },
    schedule: { minute: 30, hour: 23 }   // Every 10hrs
  },
  {
    title: 'osawari event morning',
    settings: {
      engine: [
        'osawari',
      ],
      mode: 'static',
      playCycleCount: 14,
      sellOffCount: 5,
      level: {
          location: -2,
          start: 14
      },
    },
    schedule: { minute: 10, hour: 7 }
  },
  {
    title: 'osawari event afternoon',
    settings: {
      engine: [
        'osawari',
      ],
      mode: 'static',
      playCycleCount: 14,
      sellOffCount: 5,
      level: {
          location: -2,
          start: 14
      },
    },
    schedule: { minute: 40, hour: 14 }
  }
  // ,{
  //   title: 'osawari manual',
  //   settings: {
  //     engine: [
  //       'osawari',
  //     ],
  //     mode: 'static',
  //     playCycleCount: 14,
  //     sellOffCount: 5,
  //     level: {
  //         location: -2,
  //         start: 14
  //     },
  //   },
  //   schedule: { minute: 12, hour: 21 }
  // }
];