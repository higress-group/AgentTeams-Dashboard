# AgentTeams Integration Patches

This document describes how to integrate TaDashboard into the AgentTeams (HiClaw) installation scripts.

## Option A: Standalone Install (Recommended for existing installations)

Run directly against an existing AgentTeams deployment:

```bash
bash install/hiclaw-dashboard.sh          # install (first time)
bash install/hiclaw-dashboard.sh update   # pull latest & recreate
bash install/hiclaw-dashboard.sh uninstall
```

## Option B: Patch into AgentTeams Install Script

Apply the patches in `install/patches/` to the AgentTeams repository.

### Quick Apply (using the patch files)

```bash
cd /path/to/AgentTeams
git apply /path/to/TaDashboard/install/patches/0001-hiclaw-install-dashboard.patch
git apply /path/to/TaDashboard/install/patches/0002-hiclaw-verify-dashboard.patch
git apply /path/to/TaDashboard/install/patches/0003-Makefile-dashboard.patch
```

### Regenerate Patches

The patch files are generated from a working AgentTeams branch. To update them:

```bash
# 1. Edit the AgentTeams files directly (install/hiclaw-install.sh,
#    install/hiclaw-verify.sh, Makefile) to add or modify Dashboard integration.
# 2. Commit each file separately with a descriptive message.
# 3. Generate patches:
git format-patch HEAD~3 -o /path/to/TaDashboard/install/patches/
# 4. Rename the generated files to the canonical names if necessary:
#    0001-hiclaw-install-dashboard.patch
#    0002-hiclaw-verify-dashboard.patch
#    0003-Makefile-dashboard.patch
```

### Manual Integration Summary

The patches make the following changes:

#### 1. `install/hiclaw-install.sh`

- Add documented environment variables near the top (with other `HICLAW_` vars):
  - `HICLAW_DASHBOARD` — install Dashboard (default: 1)
  - `HICLAW_PORT_DASHBOARD` — Dashboard host port (default: 13000)
  - `HICLAW_DASHBOARD_IMAGE` — override Dashboard image
  - `HICLAW_AI_GATEWAY_ADMIN_URL` — Higress Console URL for shared auth
- Add Dashboard i18n messages (`success.dashboard.*`, `dash.*`).
- Add `DASHBOARD_IMAGE` and `HICLAW_AI_GATEWAY_ADMIN_URL` defaults in `resolve_image_tags()`.
- Load Dashboard variables from the saved env file in `load_current_params_from_env()`.
- Add `step_dashboard()` wizard function after `step_workspace()`.
- Add `step_dashboard` to the `_STEPS` state-machine array.
- Add `step_dashboard` handling to `should_skip_step()` and `clear_step_vars()`.
- Start the `hiclaw-dashboard` container after the embedded controller is ready.
- Print the Dashboard URL in the success banner when Dashboard is enabled.
- Persist Dashboard variables in the generated `.env` file.

#### 2. `install/hiclaw-verify.sh`

- Read `HICLAW_PORT_DASHBOARD` from the Manager container env.
- Add a 7th check that verifies Dashboard is accessible on its configured port.

#### 3. `Makefile`

- Add `DASHBOARD_CONTEXT ?= ./TaDashboard/`.
- Add `install-dashboard`, `update-dashboard`, and `uninstall-dashboard` to `.PHONY`.
- Add a `build-dashboard` target.
- Add `install-dashboard`, `update-dashboard`, and `uninstall-dashboard` targets.

## Quick Reference

| Action | Command |
|--------|---------|
| Standalone install | `bash install/hiclaw-dashboard.sh` |
| Update (pull latest) | `bash install/hiclaw-dashboard.sh update` |
| Uninstall | `bash install/hiclaw-dashboard.sh uninstall` |
| Build image only | `make build-dashboard` |
| View logs | `docker logs -f hiclaw-dashboard` |
| Default port | `13000` |
| LAN access | Controlled by `HICLAW_LOCAL_ONLY` (binds `0.0.0.0` when disabled) |
| Auth mode | Higress shared auth (if URL configured) or local fallback |
