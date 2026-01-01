import{Ma as n,Na as e,Xa as t,Za as m,_a as o,na as i,xa as E}from"./chunk-MJEEDWY6.js";var l=class a{static \u0275fac=function(d){return new(d||a)};static \u0275cmp=E({type:a,selectors:[["app-api"]],decls:530,vars:18,consts:[[1,"max-w-4xl","mx-auto","px-6","py-12"],[1,"prose","prose-invert","max-w-none"],[1,"mb-12","pb-8","border-b","border-dark-500"],[1,"text-4xl","font-bold","text-text-primary","mb-4"],[1,"text-xl","text-text-secondary"],[1,"mb-12"],[1,"text-2xl","font-semibold","text-text-primary","mb-4","flex","items-center","gap-3"],[1,"text-nest-red"],[1,"text-text-secondary","mb-4"],[1,"mb-8"],[1,"text-xl","font-semibold","text-text-primary","mb-3"],[1,"bg-dark-800","rounded-lg","border","border-dark-500","overflow-hidden"],[1,"p-4","!bg-transparent","!border-0","!m-0"],[1,"text-sm"],[1,"text-code-pink"],[1,"text-code-green"],[1,"text-code-cyan"],[1,"mt-4"],[1,"text-sm","font-semibold","text-text-muted","mb-2"],[1,"bg-dark-800","rounded-lg","border","border-dark-500","p-4"],[1,"flex","items-start","gap-4"],[1,"text-code-cyan","text-sm"],[1,"text-text-muted","text-sm"],[1,"text-text-secondary","text-sm","mt-1"],[1,"space-y-8"],[1,"px-4","py-3","bg-dark-700","border-b","border-dark-500"],[1,"p-4"],[1,"text-text-secondary","text-sm"],[1,"text-text-secondary","text-sm","mb-3"],[1,"text-xs","text-text-muted"],[1,"text-text-muted"],[1,"space-y-6"],[1,"text-lg","font-semibold","text-text-primary","mb-3"],[1,"text-code-yellow"],[1,"text-code-orange"]],template:function(d,x){d&1&&(n(0,"div",0)(1,"article",1)(2,"header",2)(3,"h1",3),t(4,"API Reference"),e(),n(5,"p",4),t(6," Complete API documentation for the NestJS Deno adapter. "),e()(),n(7,"section",5)(8,"h2",6)(9,"span",7),t(10,"\u{1F4E6}"),e(),t(11," DenoAdapter "),e(),n(12,"p",8),t(13," The main adapter class that implements the NestJS "),n(14,"code"),t(15,"AbstractHttpAdapter"),e(),t(16," interface. "),e(),n(17,"div",9)(18,"h3",10),t(19,"Constructor"),e(),n(20,"div",11)(21,"pre",12)(22,"code",13)(23,"span",14),t(24,"new"),e(),t(25," "),n(26,"span",15),t(27,"DenoAdapter"),e(),t(28,"(options?: "),n(29,"span",16),t(30,"DenoHttpOptions"),e(),t(31,")"),e()()(),n(32,"div",17)(33,"h4",18),t(34,"Parameters"),e(),n(35,"div",19)(36,"div",20)(37,"code",21),t(38,"options"),e(),n(39,"div")(40,"span",22),t(41,"DenoHttpOptions (optional)"),e(),n(42,"p",23),t(43,"Configuration options for the Deno HTTP server."),e()()()()()(),n(44,"div",24)(45,"h3",10),t(46,"Methods"),e(),n(47,"div",11)(48,"div",25)(49,"code",13)(50,"span",16),t(51,"listen"),e(),t(52,"(port: "),n(53,"span",14),t(54,"number"),e(),t(55,", callback?: () => "),n(56,"span",14),t(57,"void"),e(),t(58,"): "),n(59,"span",14),t(60,"Promise"),e(),t(61,"<"),n(62,"span",14),t(63,"void"),e(),t(64,">"),e()(),n(65,"div",26)(66,"p",27),t(67,"Starts the HTTP server on the specified port."),e()()(),n(68,"div",11)(69,"div",25)(70,"code",13)(71,"span",16),t(72,"close"),e(),t(73,"(): "),n(74,"span",14),t(75,"Promise"),e(),t(76,"<"),n(77,"span",14),t(78,"void"),e(),t(79,">"),e()(),n(80,"div",26)(81,"p",27),t(82,"Gracefully shuts down the HTTP server."),e()()(),n(83,"div",11)(84,"div",25)(85,"code",13)(86,"span",16),t(87,"enableCors"),e(),t(88,"(options?: "),n(89,"span",16),t(90,"CorsOptions"),e(),t(91,"): "),n(92,"span",14),t(93,"void"),e()()(),n(94,"div",26)(95,"p",28),t(96,"Enables Cross-Origin Resource Sharing with optional configuration."),e(),n(97,"div",29)(98,"strong"),t(99,"Options:"),e(),t(100," origin, methods, allowedHeaders, exposedHeaders, credentials, maxAge, preflightContinue "),e()()(),n(101,"div",11)(102,"div",25)(103,"code",13)(104,"span",16),t(105,"useStaticAssets"),e(),t(106,"(path: "),n(107,"span",14),t(108,"string"),e(),t(109,", options?: "),n(110,"span",16),t(111,"StaticAssetsOptions"),e(),t(112,"): "),n(113,"span",14),t(114,"void"),e()()(),n(115,"div",26)(116,"p",28),t(117,"Serves static files from the specified directory."),e(),n(118,"div",29)(119,"strong"),t(120,"Options:"),e(),t(121," prefix, index, etag, maxAge, immutable, fallthrough "),e()()(),n(122,"div",11)(123,"div",25)(124,"code",13)(125,"span",16),t(126,"use"),e(),t(127,"(handler: "),n(128,"span",16),t(129,"MiddlewareHandler"),e(),t(130,"): "),n(131,"span",14),t(132,"void"),e()()(),n(133,"div",26)(134,"p",27),t(135,"Registers a middleware function to be executed for all requests."),e()()(),n(136,"div",11)(137,"div",25)(138,"code",13)(139,"span",16),t(140,"useExpressMiddleware"),e(),t(141,"(middleware: "),n(142,"span",16),t(143,"ExpressMiddleware"),e(),t(144,"): "),n(145,"span",14),t(146,"void"),e()()(),n(147,"div",26)(148,"p",27),t(149,"Registers Express-compatible middleware through the compatibility layer."),e()()(),n(150,"div",11)(151,"div",25)(152,"code",13)(153,"span",16),t(154,"useFastifyHook"),e(),t(155,"(hookName: "),n(156,"span",14),t(157,"string"),e(),t(158,", handler: "),n(159,"span",16),t(160,"FastifyHook"),e(),t(161,"): "),n(162,"span",14),t(163,"void"),e()()(),n(164,"div",26)(165,"p",27),t(166,"Registers a Fastify-compatible hook through the compatibility layer."),e()()()()(),n(167,"section",5)(168,"h2",6)(169,"span",7),t(170,"\u2699\uFE0F"),e(),t(171," DenoHttpOptions "),e(),n(172,"p",8),t(173," Configuration options for the Deno HTTP adapter. "),e(),n(174,"div",11)(175,"pre",12)(176,"code",13)(177,"span",14),t(178,"interface"),e(),t(179," "),n(180,"span",15),t(181,"DenoHttpOptions"),e(),t(182),n(183,"span",30),t(184,"// Hostname to bind the server to"),e(),t(185,`
  hostname?: `),n(186,"span",14),t(187,"string"),e(),t(188,`;

  `),n(189,"span",30),t(190,"// Port number (can also be set via listen())"),e(),t(191,`
  port?: `),n(192,"span",14),t(193,"number"),e(),t(194,`;

  `),n(195,"span",30),t(196,"// TLS/HTTPS configuration"),e(),t(197,`
  cert?: `),n(198,"span",14),t(199,"string"),e(),t(200,`;
  key?: `),n(201,"span",14),t(202,"string"),e(),t(203,`;

  `),n(204,"span",30),t(205,"// Abort signal for graceful shutdown"),e(),t(206,`
  signal?: `),n(207,"span",16),t(208,"AbortSignal"),e(),t(209),e()()()(),n(210,"section",5)(211,"h2",6)(212,"span",7),t(213,"\u{1F310}"),e(),t(214," CorsOptions "),e(),n(215,"p",8),t(216," Configuration options for Cross-Origin Resource Sharing. "),e(),n(217,"div",11)(218,"pre",12)(219,"code",13)(220,"span",14),t(221,"interface"),e(),t(222," "),n(223,"span",15),t(224,"CorsOptions"),e(),t(225),n(226,"span",30),t(227,"// Allowed origins (string, array, or function)"),e(),t(228,`
  origin?: `),n(229,"span",14),t(230,"string"),e(),t(231," | "),n(232,"span",14),t(233,"string"),e(),t(234,"[] | "),n(235,"span",14),t(236,"boolean"),e(),t(237," | "),n(238,"span",16),t(239,"RegExp"),e(),t(240," | "),n(241,"span",16),t(242,"Function"),e(),t(243,`;

  `),n(244,"span",30),t(245,"// Allowed HTTP methods"),e(),t(246,`
  methods?: `),n(247,"span",14),t(248,"string"),e(),t(249," | "),n(250,"span",14),t(251,"string"),e(),t(252,`[];

  `),n(253,"span",30),t(254,"// Allowed request headers"),e(),t(255,`
  allowedHeaders?: `),n(256,"span",14),t(257,"string"),e(),t(258," | "),n(259,"span",14),t(260,"string"),e(),t(261,`[];

  `),n(262,"span",30),t(263,"// Headers exposed to the client"),e(),t(264,`
  exposedHeaders?: `),n(265,"span",14),t(266,"string"),e(),t(267," | "),n(268,"span",14),t(269,"string"),e(),t(270,`[];

  `),n(271,"span",30),t(272,"// Allow credentials (cookies, authorization headers)"),e(),t(273,`
  credentials?: `),n(274,"span",14),t(275,"boolean"),e(),t(276,`;

  `),n(277,"span",30),t(278,"// Preflight cache duration in seconds"),e(),t(279,`
  maxAge?: `),n(280,"span",14),t(281,"number"),e(),t(282,`;

  `),n(283,"span",30),t(284,"// Pass preflight response to next handler"),e(),t(285,`
  preflightContinue?: `),n(286,"span",14),t(287,"boolean"),e(),t(288,`;

  `),n(289,"span",30),t(290,"// Status code for successful OPTIONS requests"),e(),t(291,`
  optionsSuccessStatus?: `),n(292,"span",14),t(293,"number"),e(),t(294),e()()()(),n(295,"section",5)(296,"h2",6)(297,"span",7),t(298,"\u{1F4C1}"),e(),t(299," StaticAssetsOptions "),e(),n(300,"p",8),t(301," Configuration options for serving static files. "),e(),n(302,"div",11)(303,"pre",12)(304,"code",13)(305,"span",14),t(306,"interface"),e(),t(307," "),n(308,"span",15),t(309,"StaticAssetsOptions"),e(),t(310),n(311,"span",30),t(312,"// URL prefix for static files (e.g., '/static')"),e(),t(313,`
  prefix?: `),n(314,"span",14),t(315,"string"),e(),t(316,`;

  `),n(317,"span",30),t(318,"// Index file name (default: 'index.html')"),e(),t(319,`
  index?: `),n(320,"span",14),t(321,"string"),e(),t(322," | "),n(323,"span",14),t(324,"boolean"),e(),t(325,`;

  `),n(326,"span",30),t(327,"// Enable ETag generation"),e(),t(328,`
  etag?: `),n(329,"span",14),t(330,"boolean"),e(),t(331,`;

  `),n(332,"span",30),t(333,"// Cache-Control max-age in seconds"),e(),t(334,`
  maxAge?: `),n(335,"span",14),t(336,"number"),e(),t(337,`;

  `),n(338,"span",30),t(339,"// Set immutable directive in Cache-Control"),e(),t(340,`
  immutable?: `),n(341,"span",14),t(342,"boolean"),e(),t(343,`;

  `),n(344,"span",30),t(345,"// Continue to next middleware if file not found"),e(),t(346,`
  fallthrough?: `),n(347,"span",14),t(348,"boolean"),e(),t(349),e()()()(),n(350,"section",5)(351,"h2",6)(352,"span",7),t(353,"\u{1F4A1}"),e(),t(354," Usage Examples "),e(),n(355,"div",31)(356,"div")(357,"h3",32),t(358,"Basic Setup"),e(),n(359,"div",11)(360,"pre",12)(361,"code",13)(362,"span",14),t(363,"import"),e(),t(364),n(365,"span",14),t(366,"from"),e(),t(367," "),n(368,"span",33),t(369,"'@nestjs/core'"),e(),t(370,`;
`),n(371,"span",14),t(372,"import"),e(),t(373),n(374,"span",14),t(375,"from"),e(),t(376," "),n(377,"span",33),t(378,"'@pegasusheavy/nestjs-platform-deno'"),e(),t(379,`;
`),n(380,"span",14),t(381,"import"),e(),t(382),n(383,"span",14),t(384,"from"),e(),t(385," "),n(386,"span",33),t(387,"'./app.module'"),e(),t(388,`;

`),n(389,"span",14),t(390,"const"),e(),t(391," app = "),n(392,"span",14),t(393,"await"),e(),t(394," NestFactory."),n(395,"span",16),t(396,"create"),e(),t(397,"(AppModule, "),n(398,"span",14),t(399,"new"),e(),t(400," "),n(401,"span",15),t(402,"DenoAdapter"),e(),t(403,`());
`),n(404,"span",14),t(405,"await"),e(),t(406," app."),n(407,"span",16),t(408,"listen"),e(),t(409,"("),n(410,"span",34),t(411,"3000"),e(),t(412,");"),e()()()(),n(413,"div")(414,"h3",32),t(415,"With HTTPS"),e(),n(416,"div",11)(417,"pre",12)(418,"code",13)(419,"span",14),t(420,"const"),e(),t(421," adapter = "),n(422,"span",14),t(423,"new"),e(),t(424," "),n(425,"span",15),t(426,"DenoAdapter"),e(),t(427),n(428,"span",14),t(429,"await"),e(),t(430," Deno."),n(431,"span",16),t(432,"readTextFile"),e(),t(433,"("),n(434,"span",33),t(435,"'./cert.pem'"),e(),t(436,`),
  key: `),n(437,"span",14),t(438,"await"),e(),t(439," Deno."),n(440,"span",16),t(441,"readTextFile"),e(),t(442,"("),n(443,"span",33),t(444,"'./key.pem'"),e(),t(445),n(446,"span",14),t(447,"const"),e(),t(448," app = "),n(449,"span",14),t(450,"await"),e(),t(451," NestFactory."),n(452,"span",16),t(453,"create"),e(),t(454,`(AppModule, adapter);
`),n(455,"span",14),t(456,"await"),e(),t(457," app."),n(458,"span",16),t(459,"listen"),e(),t(460,"("),n(461,"span",34),t(462,"443"),e(),t(463,");"),e()()()(),n(464,"div")(465,"h3",32),t(466,"Full Configuration"),e(),n(467,"div",11)(468,"pre",12)(469,"code",13)(470,"span",14),t(471,"const"),e(),t(472," app = "),n(473,"span",14),t(474,"await"),e(),t(475," NestFactory."),n(476,"span",16),t(477,"create"),e(),t(478,"(AppModule, "),n(479,"span",14),t(480,"new"),e(),t(481," "),n(482,"span",15),t(483,"DenoAdapter"),e(),t(484,`());

`),n(485,"span",30),t(486,"// Enable CORS"),e(),t(487,`
app.`),n(488,"span",16),t(489,"enableCors"),e(),t(490),n(491,"span",33),t(492,"'https://app.example.com'"),e(),t(493,`],
  credentials: `),n(494,"span",34),t(495,"true"),e(),t(496),n(497,"span",30),t(498,"// Serve static files"),e(),t(499,`
app.`),n(500,"span",16),t(501,"useStaticAssets"),e(),t(502,"("),n(503,"span",33),t(504,"'./public'"),e(),t(505),n(506,"span",33),t(507,"'/assets'"),e(),t(508,`,
  maxAge: `),n(509,"span",34),t(510,"86400000"),e(),t(511),n(512,"span",30),t(513,"// Set global prefix"),e(),t(514,`
app.`),n(515,"span",16),t(516,"setGlobalPrefix"),e(),t(517,"("),n(518,"span",33),t(519,"'api'"),e(),t(520,`);

`),n(521,"span",14),t(522,"await"),e(),t(523," app."),n(524,"span",16),t(525,"listen"),e(),t(526,"("),n(527,"span",34),t(528,"3000"),e(),t(529,");"),e()()()()()()()()),d&2&&(i(182),m(" ","{",`
  `),i(27),m(`;
`,"}"),i(16),m(" ","{",`
  `),i(69),m(`;
`,"}"),i(16),m(" ","{",`
  `),i(39),m(`;
`,"}"),i(15),o(" ","{"," NestFactory ","}"," "),i(9),o(" ","{"," DenoAdapter ","}"," "),i(9),o(" ","{"," AppModule ","}"," "),i(45),m("(","{",`
  cert: `),i(18),m(`),
`,"}",`);

`),i(45),m("(","{",`
  origin: [`),i(6),m(`,
`,"}",`);

`),i(9),m(", ","{",`
  prefix: `),i(6),m(`,
`,"}",`);

`))},encapsulation:2})};export{l as Api};
