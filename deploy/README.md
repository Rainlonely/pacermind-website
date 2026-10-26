# Alibaba Cloud website deployment

## Live deployment — 2026-10-26

- Website: https://pacermind.xyz; HTTP and https://www.pacermind.xyz redirect to the HTTPS apex, preserving paths and queries.
- Website filing: **沪ICP备2025147756号-3**, supplied by the owner on 2026-10-26. All five page footers display the number and link to `https://beian.miit.gov.cn/`.
- SSH host: `pacermind-plan-cn` (`101.132.63.172`, Shanghai).
- Source: `289804843a622fc6073f33376345f7bae7cb8873`, branch `codex/pacermind-3-atlas-editor-review-20261008`, plus the five footer additions captured in the deployment's `footer.patch`.
- Live release: `/var/www/pacermind-website/releases/20261026-2898048-icp`.
- Active symlink: `/var/www/pacermind-website/current`.
- Previous release: `releases/20261015-2898048`, retained for rollback.
- Deployment evidence: `/var/www/pacermind-website/deployments/20261026-2898048-icp` (root only). Includes the SHA256 manifest, source description, footer patch, DNS snapshots and original Nginx checksums.
- Public Nginx configuration: `/etc/nginx/sites-available/pacermind.xyz`, linked from `sites-enabled`. Source: `nginx-public.conf` beside this file.
- Private preview: `/etc/nginx/sites-available/pacermind-website-preview`, listening only on `127.0.0.1:4180`. Source: `nginx-preview.conf`.

Only HTML, browser JS/MJS, assets, favicon, robots.txt and sitemap.xml are deployed. Git metadata, deployment scripts, fixtures, device-sync tools and repository documentation are excluded. No npm runtime or application process is installed on the server. Public pages revalidate caches and have no preview noindex header. Both virtual hosts explicitly serve `.mjs` as JavaScript.

The homepage design alternatives discussed on 2026-10-19 were not part of this release.

## HTTPS and renewal

- Certificate covers `pacermind.xyz` and `www.pacermind.xyz`.
- Certificate path: `/etc/letsencrypt/live/pacermind.xyz/fullchain.pem`; private key stays on the server.
- Initial expiry: 2027-01-24. Check the live certificate for its current expiry after renewal.
- Initial issuance used temporary DNS-01 TXT records; those records were removed after issuance.
- Automatic renewal now uses HTTP-01 webroot `/var/www/pacermind-website/acme` through the existing enabled `certbot.timer`.
- The port 80 virtual host serves `/.well-known/acme-challenge/` directly before the HTTPS redirect.
- The renewal configuration `/etc/letsencrypt/renewal/pacermind.xyz.conf` uses `authenticator = webroot` with the deploy hook `nginx -t && systemctl reload nginx`.
- `certbot reconfigure --cert-name pacermind.xyz --webroot -w /var/www/pacermind-website/acme --preferred-challenges http --deploy-hook 'nginx -t && systemctl reload nginx' --run-deploy-hooks --non-interactive` passed its simulated renewal and saved the configuration.

Do not stop Nginx for certificate renewal. Existing OAuth Nginx protocol-option warnings were present before this deployment; configuration validation succeeds, and unrelated virtual hosts were left intact.

## DNS

The cutover changed only the website records:

| Record | Current value/state | Previous value/state |
| --- | --- | --- |
| `@` A | `101.132.63.172` | `185.199.108.153` |
| `www` CNAME | `pacermind.xyz` | `rainlonely.github.io` |
| Four `@` AAAA records | Disabled | Enabled, `2606:50c0:8000::153` through `2606:50c0:8003::153` |

TTL remains 600 seconds. Old AAAA records are retained but disabled because this release has no verified public IPv6 endpoint. The `oauth`, `plan-cn` and Google verification TXT records are unchanged. GitHub Pages was retained as a rollback destination; propagation can temporarily serve the previous site from cached records.

## Verification

Before cutover, HTTPS was verified against the new IP using `curl --resolve` without bypassing certificate validation. After cutover, normal DNS access from the Mac and the server returned the new homepage with exactly matching SHA256 hashes; `www` and HTTP redirected correctly.

- Static asset checks and `git diff --check` passed.
- All 112 files served by Nginx matched the release manifest.
- All five pages passed production-origin Chromium checks at 375px: valid HTTPS, visible correct filing link, no horizontal overflow, and no page errors. Planner modules and notes loaded successfully.
- The original private release also passed 20 core tests, independent plan-schema checks, 23 browser scenarios and 24 Chromium form-control cases. Those broader tests were not repeated for this footer-only content change.
- Existing Nginx config checksums matched the pre-cutover baseline. Nginx and AI main PIDs and Docker container IDs were unchanged. Prod/UAT AI and OAuth health checks remained healthy; merchant, familywu and zgp response statuses matched the baseline.
- Production Mapbox interaction, Safari, Android distribution and actual App clipboard import are not established by the cutover smoke checks.

## Private preview

```sh
ssh -N -o ExitOnForwardFailure=yes \
  -L 127.0.0.1:4180:127.0.0.1:4180 pacermind-plan-cn
```

Open `http://127.0.0.1:4180/` while the tunnel runs. The preview uses the same active release, but sends `X-Robots-Tag: noindex, nofollow`. Mapbox's production origin restrictions still apply to localhost.

## Updating the website

1. Run the checks listed in the repository README and REVIEW-3.0.md.
2. Package only public files from the chosen source revision. Retain meaningful file modification times, and store the source revision, any local patch and SHA256 manifest outside the public root.
3. Upload to a new release directory and verify all hashes before activation. Keep the previous release.
4. Create a new symlink beside `current`, then atomically rename it over `current` using `mv -Tf`. Content-only releases do not need a Nginx reload.
5. Check the public homepage, planner, notes, legal pages, scripts, images and filing links. Confirm existing services remain healthy.

For Nginx changes, back up the website configuration and run `nginx -t` before a graceful `systemctl reload nginx`. Wait for the new worker configuration to become active before evaluating readiness; initial requests immediately after reload can still hit the old virtual-host/certificate configuration. Do not bypass certificate validation. Restore the website configuration and release if readiness checks fail.

Git pushes and the existing journey-publishing script do not automatically deploy to this server. A separate static release is required for new code or journey data; no deployment automation was added.

## Rollback

For a content rollback, atomically point `current` back to the previous verified release. Keep the newly issued HTTPS certificate and valid website virtual host in place.

For a complete hosting rollback, restore the website DNS values and statuses from `dns-before.json`: old GitHub A, old `www` CNAME and the four enabled GitHub AAAA records. Leave unrelated records unchanged. Keep the Alibaba Cloud site running during the DNS TTL window. Disable only `/etc/nginx/sites-enabled/pacermind.xyz` after traffic has returned to the verified old host; validate Nginx and reload gracefully. Never replace other virtual hosts, restart Docker or restart AI services.

The original private release lacks the new filing footer, so restoring that content is a temporary operational recovery step, not the desired steady state.
