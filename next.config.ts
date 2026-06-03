module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.hebent.tech",
        pathname: "/app/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.hebent.tech",
        pathname: "/uploads/**",
      },
    ],
  },
  // images: {
  //     unoptimized: true,
  //     remotePatterns: [
  //         {
  //             protocol: 'http',
  //             hostname: 'localhost',
  //             port: '3001',
  //             pathname: '/uploads/**',
  //         },
  //     ],
  // },
};
