import { defineConfig } from 'jsrepo';
import { repository } from 'jsrepo/outputs';
import { fs, jsrepo } from 'jsrepo/providers';

export default defineConfig({
	providers: [fs(), jsrepo()],
	registry: {
		name: '@auth/svelte',
		description: 'Plug & Play Auth Widgets for your application',
		homepage: 'https://etesie.dev/docs/auth',
		bugs: 'https://github.com/mmailaender/Convex-Better-Auth-UI/issues',
		repository: 'https://github.com/mmailaender/Convex-Better-Auth-UI',
		tags: ['auth', 'svelte', 'ui', 'convex', 'better-auth'],
		version: 'package',
		defaultPaths: {
			base: './',
			convex: './src/convex',
			lib: './src/lib',
			routes: './src/routes',
			themes: './src/themes'
		},
		excludeDeps: ['svelte', '@sveltejs/kit'],
		outputs: [repository({ format: true })],
		items: [
			// ── Base & config ────────────────────────────────────────────────
			{
				name: 'config',
				add: 'when-added',
				type: 'base',
				files: [
					{
						path: 'src',
						files: [
							{
								path: 'convex',
								files: [
									{
										path: 'auth.ts',
										dependencyResolution: 'manual',
										dependencies: ['@convex-dev/better-auth', 'better-auth']
									},
									{ path: 'storage.ts', dependencyResolution: 'manual' },
									{ path: 'auth.constants.ts' },
									{ path: 'auth.constants.types.ts' }
								]
							}
						]
					}
				]
			},
			{
				name: 'base',
				add: 'when-added',
				type: 'base',
				files: [
					{ path: 'convex.dist.json', target: 'convex.json' },
					{ path: 'svelte.config.js', target: 'svelte.config.js' },
					{
						path: 'src',
						files: [
							{ path: 'app.html' },
							{ path: 'app.d.ts' },
							{
								path: 'routes',
								files: [
									{
										path: '+layout.svelte',
										dependencyResolution: 'manual',
										dependencies: ['@mmailaender/convex-better-auth-svelte']
									},
									{
										path: 'layout.css',
										dependencyResolution: 'manual',
										devDependencies: [
											'@skeletonlabs/skeleton',
											'tw-animate-css',
											'@types/node',
											'svelte-sonner'
										]
									}
								]
							},
							{
								path: 'lib',
								files: [
									{
										path: 'assets'
									}
								]
							},
							{
								path: 'convex',
								files: [
									{
										path: 'tsconfig.json'
									},
									{
										path: 'auth.config.ts'
									},
									{
										path: 'convex.config.ts'
									},
									{
										path: 'http.ts',
										dependencyResolution: 'manual'
									},
									{
										path: 'polyfills.ts'
									},
									{
										path: 'schema.ts'
									},
									{
										path: 'migrations.ts',
										dependencyResolution: 'manual',
										dependencies: ['@convex-dev/migrations']
									},
									{
										path: 'betterAuth',
										files: [
											{
												path: 'adapter.ts'
											},
											{
												path: 'convex.config.ts'
											},
											{
												path: 'schema.ts'
											}
										]
									}
								]
							}
						]
					}
				]
			},
			{
				name: 'base/ssr',
				add: 'when-added',
				type: 'base',
				files: [
					{
						path: 'src',
						files: [
							{ path: 'hooks.server.ts' },
							{
								path: 'routes',
								files: [
									{
										path: '+layout.server.ts',
										dependencyResolution: 'manual',
										dependencies: ['@mmailaender/convex-better-auth-svelte']
									}
								]
							}
						]
					}
				]
			},
			{
				name: 'primitives',
				add: 'when-needed',
				type: 'lib',
				files: [
					{
						path: 'src/lib/primitives'
					}
				]
			},
			{
				name: 'themes',
				add: 'when-added',
				type: 'themes',
				files: [
					{
						path: 'src/themes/auth.css'
					}
				]
			},

			// ── Auth ─────────────────────────────────────────────────────────
			{
				name: 'auth/lib',
				add: 'when-added',
				type: 'lib',
				files: [
					{
						path: 'src/lib',
						files: [
							{ path: 'context.svelte.ts' },
							{
								path: 'types.ts',
								dependencyResolution: 'manual',
								dependencies: ['convex']
							}
						]
					},
					{
						path: 'src/lib/auth'
					}
				]
			},
			{
				name: 'auth/routes',
				add: 'when-added',
				type: 'routes',
				files: [
					{
						path: 'src/routes/**/auth/*/+server.ts'
					},
					{
						path: 'src/routes/*/signin/+page.svelte'
					},
					{
						path: 'src/routes/*/reset-password/+page.svelte'
					}
				]
			},

			// ── Users ────────────────────────────────────────────────────────
			{
				name: 'users/convex',
				add: 'when-added',
				type: 'convex',
				files: [
					{
						path: 'src/convex/users',
						files: [
							{
								path: 'actions.ts',
								dependencyResolution: 'manual',
								dependencies: ['convex']
							},
							{
								path: 'mutations.ts',
								dependencyResolution: 'manual',
								dependencies: ['convex', 'better-auth']
							},
							{
								path: 'queries.ts',
								dependencyResolution: 'manual',
								dependencies: ['convex', 'better-auth']
							}
						]
					},
					{
						path: 'src/convex/betterAuth',
						files: [
							{
								path: 'user.ts',
								dependencyResolution: 'manual',
								dependencies: ['convex', 'convex-helpers']
							}
						]
					}
				]
			},
			{
				name: 'users/lib',
				add: 'when-added',
				type: 'lib',
				files: [
					{
						path: 'src/lib/users'
					}
				]
			},

			// ── Organizations ────────────────────────────────────────────────
			{
				name: 'organizations/convex',
				add: 'when-added',
				type: 'convex',
				files: [
					{
						path: 'src/convex/organizations',
						files: [
							{
								path: 'mutations.ts',
								dependencyResolution: 'manual',
								dependencies: ['convex', 'better-auth']
							},
							{
								path: 'queries.ts',
								dependencyResolution: 'manual',
								dependencies: ['convex']
							},
							{
								path: 'invitations',
								files: [{ path: 'queries.ts', dependencyResolution: 'manual' }]
							},
							{
								path: 'members',
								files: [
									{
										path: 'mutations.ts',
										dependencyResolution: 'manual',
										dependencies: ['convex', 'better-auth']
									}
								]
							}
						]
					},
					{
						path: 'src/convex/model',
						files: [
							{
								path: 'organizations',
								files: [
									{
										path: 'index.ts',
										dependencyResolution: 'manual',
										dependencies: ['convex', 'better-auth']
									}
								]
							}
						]
					},
					{
						path: 'src/convex/betterAuth',
						files: [
							{
								path: 'organization.ts',
								dependencyResolution: 'manual',
								dependencies: ['convex', 'convex-helpers']
							}
						]
					}
				]
			},
			{
				name: 'organizations/lib',
				add: 'when-added',
				type: 'lib',
				files: [
					{
						path: 'src/lib/organizations'
					}
				]
			},
			{
				name: 'organizations/routes',
				add: 'when-added',
				type: 'routes',
				files: [
					{
						path: 'src/routes/**/accept-invitation/*/+page.svelte'
					}
				]
			},

			// ── Email ────────────────────────────────────────────────────────
			{
				name: 'email/convex',
				add: 'when-added',
				type: 'convex',
				files: [
					{
						path: 'src/convex/email.ts',
						dependencyResolution: 'manual',
						dependencies: ['@convex-dev/resend']
					},
					{
						path: 'src/convex/model',
						files: [
							{
								path: 'emails',
								files: [
									{ path: 'validateEmail.ts', dependencyResolution: 'manual' },
									{
										path: 'templates',
										files: [{ path: 'baseEmail.ts' }, { path: 'emailTemplates.ts' }]
									}
								]
							}
						]
					}
				]
			},

			// ── Device Authorization ─────────────────────────────────────────
			{
				name: 'device-authorization/convex',
				add: 'when-added',
				type: 'convex',
				files: [
					{
						path: 'src/convex/deviceAuthorization.ts',
						dependencyResolution: 'manual',
						dependencies: ['convex', 'better-auth']
					}
				]
			},
			{
				name: 'device-authorization/routes',
				add: 'when-added',
				type: 'routes',
				files: [
					{
						path: 'src/routes/*/device-authorization/*/+page.svelte'
					}
				]
			}
		]
	}
});
