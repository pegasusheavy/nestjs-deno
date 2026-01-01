import{c as x}from"./chunk-2L6TCK4P.js";import{Ja as n,Ka as t,Xa as e,Za as a,_a as r,na as i,xa as m}from"./chunk-MJEEDWY6.js";var o=class d{static \u0275fac=function(l){return new(l||d)};static \u0275cmp=m({type:d,selectors:[["app-getting-started"]],decls:330,vars:20,consts:[[1,"max-w-4xl","mx-auto","px-6","py-12"],[1,"prose","prose-invert","max-w-none"],[1,"mb-12","pb-8","border-b","border-dark-500"],[1,"text-4xl","font-bold","text-text-primary","mb-4"],[1,"text-xl","text-text-secondary"],[1,"mb-12"],[1,"text-2xl","font-semibold","text-text-primary","mb-4","flex","items-center","gap-3"],[1,"w-8","h-8","bg-nest-red","rounded-full","flex","items-center","justify-center","text-sm","font-bold"],[1,"text-text-secondary","mb-4"],[1,"bg-dark-800","rounded-lg","border","border-dark-500","overflow-hidden","mb-4"],[1,"flex","items-center","justify-between","px-4","py-2","bg-dark-700","border-b","border-dark-500"],[1,"text-xs","text-text-muted"],[1,"p-4","!bg-transparent","!border-0","!m-0"],[1,"text-sm"],[1,"text-code-green"],[1,"text-sm","text-code-green"],[1,"text-code-pink"],[1,"text-text-primary"],[1,"text-code-yellow"],[1,"text-code-cyan"],[1,"text-text-muted"],[1,"text-code-orange"],[1,"text-text-secondary"],[1,"text-2xl","font-semibold","text-text-primary","mb-6","flex","items-center","gap-3"],[1,"text-nest-red"],[1,"mb-8"],[1,"text-xl","font-semibold","text-text-primary","mb-3"],[1,"bg-dark-800","rounded-lg","border","border-dark-500","overflow-hidden"],[1,"p-6","bg-dark-800","rounded-xl","border","border-dark-500"],[1,"text-xl","font-semibold","text-text-primary","mb-4"],[1,"grid","sm:grid-cols-2","gap-4"],["routerLink","/api",1,"p-4","bg-dark-700","hover:bg-dark-600","rounded-lg","border","border-dark-500","hover:border-nest-red/50","transition-all","group"],[1,"font-semibold","text-text-primary","mb-1","group-hover:text-nest-red","transition-colors"],[1,"text-sm","text-text-muted"],["routerLink","/express-compat",1,"p-4","bg-dark-700","hover:bg-dark-600","rounded-lg","border","border-dark-500","hover:border-nest-red/50","transition-all","group"],["routerLink","/fastify-compat",1,"p-4","bg-dark-700","hover:bg-dark-600","rounded-lg","border","border-dark-500","hover:border-nest-red/50","transition-all","group"],["href","https://github.com/pegasusheavy/nestjs-deno/tree/main/examples","target","_blank","rel","noopener",1,"p-4","bg-dark-700","hover:bg-dark-600","rounded-lg","border","border-dark-500","hover:border-nest-red/50","transition-all","group"]],template:function(l,s){l&1&&(n(0,"div",0)(1,"article",1)(2,"header",2)(3,"h1",3),e(4,"Quick Start"),t(),n(5,"p",4),e(6," Create your first NestJS application running on Deno in under 5 minutes. "),t()(),n(7,"section",5)(8,"h2",6)(9,"span",7),e(10,"1"),t(),e(11," Create a New NestJS Project "),t(),n(12,"p",8),e(13," Start by creating a new NestJS project using the CLI: "),t(),n(14,"div",9)(15,"div",10)(16,"span",11),e(17,"Terminal"),t()(),n(18,"pre",12)(19,"code",13)(20,"span",14),e(21,"npx @nestjs/cli new my-deno-app"),t(),e(22,`
`),n(23,"span",14),e(24,"cd my-deno-app"),t()()()()(),n(25,"section",5)(26,"h2",6)(27,"span",7),e(28,"2"),t(),e(29," Install the Deno Adapter "),t(),n(30,"p",8),e(31," Add the Deno platform adapter to your project: "),t(),n(32,"div",9)(33,"div",10)(34,"span",11),e(35,"Terminal"),t()(),n(36,"pre",12)(37,"code",15),e(38,"pnpm add @pegasusheavy/nestjs-platform-deno"),t()()()(),n(39,"section",5)(40,"h2",6)(41,"span",7),e(42,"3"),t(),e(43," Update Your Bootstrap Code "),t(),n(44,"p",8),e(45," Replace the default Express adapter with the Deno adapter in "),n(46,"code"),e(47,"src/main.ts"),t(),e(48,": "),t(),n(49,"div",9)(50,"div",10)(51,"span",11),e(52,"src/main.ts"),t()(),n(53,"pre",12)(54,"code",13)(55,"span",16),e(56,"import"),t(),e(57," "),n(58,"span",17),e(59),t(),e(60," "),n(61,"span",16),e(62,"from"),t(),e(63," "),n(64,"span",18),e(65,"'@nestjs/core'"),t(),e(66,`;
`),n(67,"span",16),e(68,"import"),t(),e(69," "),n(70,"span",17),e(71),t(),e(72," "),n(73,"span",16),e(74,"from"),t(),e(75," "),n(76,"span",18),e(77,"'@pegasusheavy/nestjs-platform-deno'"),t(),e(78,`;
`),n(79,"span",16),e(80,"import"),t(),e(81," "),n(82,"span",17),e(83),t(),e(84," "),n(85,"span",16),e(86,"from"),t(),e(87," "),n(88,"span",18),e(89,"'./app.module'"),t(),e(90,`;

`),n(91,"span",16),e(92,"async function"),t(),e(93," "),n(94,"span",19),e(95,"bootstrap"),t(),e(96),n(97,"span",20),e(98,"// Create the application with the Deno adapter"),t(),e(99,`
  `),n(100,"span",16),e(101,"const"),t(),e(102," app = "),n(103,"span",16),e(104,"await"),t(),e(105," NestFactory."),n(106,"span",19),e(107,"create"),t(),e(108,`(
    AppModule,
    `),n(109,"span",16),e(110,"new"),t(),e(111," "),n(112,"span",14),e(113,"DenoAdapter"),t(),e(114,`()
  );

  `),n(115,"span",20),e(116,"// Enable CORS if needed"),t(),e(117,`
  app.`),n(118,"span",19),e(119,"enableCors"),t(),e(120,`();

  `),n(121,"span",20),e(122,"// Start the server"),t(),e(123,`
  `),n(124,"span",16),e(125,"await"),t(),e(126," app."),n(127,"span",19),e(128,"listen"),t(),e(129,"("),n(130,"span",21),e(131,"3000"),t(),e(132,`);

  console.`),n(133,"span",19),e(134,"log"),t(),e(135,"("),n(136,"span",18),e(137),t(),e(138),n(139,"span",19),e(140,"bootstrap"),t(),e(141,"();"),t()()()(),n(142,"section",5)(143,"h2",6)(144,"span",7),e(145,"4"),t(),e(146," Create Deno Configuration "),t(),n(147,"p",8),e(148," Create a "),n(149,"code"),e(150,"deno.json"),t(),e(151," file in your project root: "),t(),n(152,"div",9)(153,"div",10)(154,"span",11),e(155,"deno.json"),t()(),n(156,"pre",12)(157,"code",13),e(158),n(159,"span",19),e(160,'"compilerOptions"'),t(),e(161),n(162,"span",18),e(163,'"experimentalDecorators"'),t(),e(164,": "),n(165,"span",21),e(166,"true"),t(),e(167,`,
    `),n(168,"span",18),e(169,'"emitDecoratorMetadata"'),t(),e(170,": "),n(171,"span",21),e(172,"true"),t(),e(173),n(174,"span",19),e(175,'"nodeModulesDir"'),t(),e(176,": "),n(177,"span",21),e(178,"true"),t(),e(179,`,
  `),n(180,"span",19),e(181,'"tasks"'),t(),e(182),n(183,"span",18),e(184,'"dev"'),t(),e(185,": "),n(186,"span",14),e(187,'"deno run -A --watch src/main.ts"'),t(),e(188,`,
    `),n(189,"span",18),e(190,'"start"'),t(),e(191,": "),n(192,"span",14),e(193,'"deno run --allow-net --allow-read --allow-env src/main.ts"'),t(),e(194),t()()()(),n(195,"section",5)(196,"h2",6)(197,"span",7),e(198,"5"),t(),e(199," Run Your Application "),t(),n(200,"p",8),e(201," Start your application with Deno: "),t(),n(202,"div",9)(203,"div",10)(204,"span",11),e(205,"Terminal"),t()(),n(206,"pre",12)(207,"code",13)(208,"span",14),e(209,"deno task dev"),t()()()(),n(210,"p",22),e(211," Visit "),n(212,"code"),e(213,"http://localhost:3000"),t(),e(214," to see your application running on Deno! \u{1F995} "),t()(),n(215,"section",5)(216,"h2",23)(217,"span",24),e(218,"\u{1F527}"),t(),e(219," Common Configurations "),t(),n(220,"div",25)(221,"h3",26),e(222,"Enabling CORS"),t(),n(223,"div",27)(224,"pre",12)(225,"code",13)(226,"span",20),e(227,"// Enable CORS with default options"),t(),e(228,`
app.`),n(229,"span",19),e(230,"enableCors"),t(),e(231,`();

`),n(232,"span",20),e(233,"// Or with custom configuration"),t(),e(234,`
app.`),n(235,"span",19),e(236,"enableCors"),t(),e(237),n(238,"span",18),e(239,"'https://example.com'"),t(),e(240,`,
  methods: [`),n(241,"span",18),e(242,"'GET'"),t(),e(243,", "),n(244,"span",18),e(245,"'POST'"),t(),e(246,", "),n(247,"span",18),e(248,"'PUT'"),t(),e(249,", "),n(250,"span",18),e(251,"'DELETE'"),t(),e(252,`],
  credentials: `),n(253,"span",21),e(254,"true"),t(),e(255),t()()()(),n(256,"div",25)(257,"h3",26),e(258,"Serving Static Files"),t(),n(259,"div",27)(260,"pre",12)(261,"code",13)(262,"span",16),e(263,"const"),t(),e(264," adapter = "),n(265,"span",16),e(266,"new"),t(),e(267," "),n(268,"span",14),e(269,"DenoAdapter"),t(),e(270,`();

adapter.`),n(271,"span",19),e(272,"useStaticAssets"),t(),e(273,"("),n(274,"span",18),e(275,"'./public'"),t(),e(276),n(277,"span",18),e(278,"'/static'"),t(),e(279,`,
  maxAge: `),n(280,"span",21),e(281,"86400"),t(),e(282,", "),n(283,"span",20),e(284,"// 1 day cache"),t(),e(285,`
  etag: `),n(286,"span",21),e(287,"true"),t(),e(288),t()()()(),n(289,"div",25)(290,"h3",26),e(291,"API Prefix"),t(),n(292,"div",27)(293,"pre",12)(294,"code",13)(295,"span",20),e(296,"// Add a global prefix to all routes"),t(),e(297,`
app.`),n(298,"span",19),e(299,"setGlobalPrefix"),t(),e(300,"("),n(301,"span",18),e(302,"'api/v1'"),t(),e(303,`);

`),n(304,"span",20),e(305,"// Routes will be: /api/v1/users, /api/v1/products, etc."),t()()()()()(),n(306,"section",28)(307,"h2",29),e(308,"What's Next?"),t(),n(309,"div",30)(310,"a",31)(311,"h3",32),e(312,"API Reference"),t(),n(313,"p",33),e(314,"Explore the complete API documentation"),t()(),n(315,"a",34)(316,"h3",32),e(317,"Express Middleware"),t(),n(318,"p",33),e(319,"Use existing Express middleware"),t()(),n(320,"a",35)(321,"h3",32),e(322,"Fastify Plugins"),t(),n(323,"p",33),e(324,"Integrate Fastify hooks and plugins"),t()(),n(325,"a",36)(326,"h3",32),e(327,"Examples"),t(),n(328,"p",33),e(329,"See real-world usage examples"),t()()()()()()),l&2&&(i(59),r("","{"," NestFactory ","}"),i(12),r("","{"," DenoAdapter ","}"),i(12),r("","{"," AppModule ","}"),i(13),a("() ","{",`
  `),i(41),r("`\u{1F995} Application running on: $","{","await app.getUrl()","}","`"),i(),a(`);
`,"}",`

`),i(20),a("","{",`
  `),i(3),a(": ","{",`
    `),i(12),a(`
  `,"}",`,
  `),i(9),a(": ","{",`
    `),i(12),r(`
  `,"}",`
`,"}"),i(43),a("(","{",`
  origin: `),i(18),a(`,
`,"}",");"),i(21),a(", ","{",`
  prefix: `),i(12),a(`,
`,"}",");"))},dependencies:[x],encapsulation:2})};export{o as GettingStarted};
