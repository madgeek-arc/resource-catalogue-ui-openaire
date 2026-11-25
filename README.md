# OpenAIRE Service Catalogue UI

Angular 22 front end for the OpenAIRE service catalogue (npm package `resource-catalogue-ui`). It talks to the resource catalogue API under `/api`, mostly through its `/api/oa/*` endpoints.

## Requirements

Node 24 (see `.nvmrc`; CI and the Dockerfile use it). Angular 22 needs Node 22.12 or newer and TypeScript 6.

## Commands

| Command | What it does |
| --- | --- |
| `npm ci` | Install the locked dependencies |
| `npm start` | Dev server on http://localhost:3000 with `proxy.conf.json`: `/api/**` goes to `localhost:8080` (the catalogue API, for example through an SSH tunnel) |
| `npm test` | Unit tests (`*.spec.ts`) with Vitest in Node and jsdom, through `ng test`; no browser needed |
| `npm run build:prod` | Production build into `dist/resource-catalogue-ui`; `build:beta` uses the beta environment |
| `npm run lint` | ESLint (`eslint.config.mjs`) over TypeScript and templates |
| `npm run lint:ci` | Same, but fails when the warning count is above the limit in `package.json` |

The environments are `src/environments/environment.ts` (dev), `environment.beta.ts` and `environment.prod.ts`; the beta and production builds swap them in.

## Quality gates

The GitHub workflow in `.github/workflows/ci.yml` runs on every pull request and on pushes to `master` and `develop`:

1. **Lint:** `npm run lint:ci`. The rules that move the code towards modern Angular (standalone components, `inject()`, signals, OnPush, `NgOptimizedImage`, class bindings, no inline styles, no `any`, no `console.log`, `===`) are warnings. The limit in the `lint:ci` script is the current count, and it can only go down: fix warnings, then lower the number. The old structural directives (`*ngIf`, `*ngFor`) are errors.
2. **Test:** `npm test`.
3. **Build:** `npm run build:prod`. The budget in `angular.json` fails the build when the initial bundle grows past it.
4. **Audit:** `npm audit --audit-level=critical` prints every finding and fails on critical ones only.

TypeScript runs with `alwaysStrict`, `noImplicitThis`, `useUnknownInCatchVariables`, `strictFunctionTypes`, `strictBindCallApply`, `noFallthroughCasesInSwitch`, `noImplicitOverride` and `noImplicitReturns`. `noImplicitAny` and `strictNullChecks` are not on yet, and `strict` itself is set to `false` because TypeScript 6 would otherwise switch every strict flag on at once. Angular's `strictTemplates` is on, so the build fails on template type errors (a misspelled member, a wrongly typed binding); its null checks only take effect once `strictNullChecks` is on.

## Docker

`docker build -t catalogue-ui .` builds the production bundle and an nginx image. At start `init.sh` writes the nginx config from two environment variables: `SERVER_NAME` and `PROXY_API_ENDPOINT` (the catalogue API, served under `/api`). Files in the `./data` volume are served under `/images`, `/files`, `/ebooks` and `/pitch-decks`. See `docker-compose.yml`.

## Layout

- `src/app`: the application. `pages` holds search, the service and datasource landing pages, the provider dashboard, the service dashboard, the admin dashboard and the forms; `services` holds the API clients, the session (`UserSessionService`, which asks `/api/user/info`), the route guards and the HTTP interceptor.
- `src/catalogue-ui`: the dynamic form behind the service and datasource forms, and the rich-text editor (Tiptap) that the forms share. It used to be a git-subrepo of `madgeek-arc/catalogue-ui`; it is now part of this repository, without the parts this app does not route to.
- Styles: LESS, the default for new components (`inlineStyleLanguage` and the component schematic in `angular.json`). The global styles under `styles` in `angular.json` load in cascade order: `src/catalogue-ui/styles/service-catalogue-theme.less`, `src/styles/uikit/uikit.less`, `src/styles.less` (which imports the partials in `src/styles/` and the ng-select theme), then Font Awesome. `src/styles/uikit/uikit.less` builds UIkit's core from the `uikit` package's LESS sources (pinned to 3.25.31, whose JavaScript is listed under `scripts`) and themes it through UIkit variables (`_variables.less`) and hooks (`_hooks.less`); `_legacy.less` keeps the few rules of the old YOOtheme theme that templates still rely on.
