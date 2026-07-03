# AgentTeams Integration Patches

This document describes how to integrate TaDashboard into the AgentTeams (HiClaw) installation scripts.

## Option A: Standalone Install (Recommended for existing installations)

Run directly against an existing AgentTeams deployment:

```bash
bash install/hiclaw-dashboard.sh
```

## Option B: Patch into AgentTeams Install Script

Apply the following changes to the AgentTeams repository.

### 1. `install/hiclaw-install.sh`

#### Add environment variable block (near the top, with other `HICLAW_` vars):

```bash
# TaDashboard (optional web management UI)
HICLAW_DASHBOARD="${HICLAW_DASHBOARD:-1}"           # 1=install, 0=skip
HICLAW_PORT_DASHBOARD="${HICLAW_PORT_DASHBOARD:-13000}"
HICLAW_DASHBOARD_IMAGE="${HICLAW_DASHBOARD_IMAGE:-hiclaw-dashboard:latest}"
```

#### Add message dictionary entries (in the `case` block for i18n):

```bash
# --- Dashboard ---
dash.prompt)        [ "$_lang" = "zh" ] && echo "是否安装 TaDashboard 管理面板?" || echo "Install TaDashboard management UI?" ;;
dash.port_prompt)   [ "$_lang" = "zh" ] && echo "Dashboard 端口号" || echo "Dashboard port" ;;
dash.image_prompt)  [ "$_lang" = "zh" ] && echo "Dashboard 镜像" || echo "Dashboard image" ;;
dash.starting)      [ "$_lang" = "zh" ] && echo "正在启动 TaDashboard..." || echo "Starting TaDashboard..." ;;
dash.ready)         [ "$_lang" = "zh" ] && echo "TaDashboard 已就绪" || echo "TaDashboard is ready" ;;
dash.failed)        [ "$_lang" = "zh" ] && echo "TaDashboard 启动失败" || echo "TaDashboard failed to start" ;;
dash.skipped)       [ "$_lang" = "zh" ] && echo "跳过 TaDashboard 安装" || echo "Skipping TaDashboard installation" ;;
```

#### Add wizard step (after `step_volume` or similar):

```bash
step_dashboard() {
  prompt_yes_no HICLAW_DASHBOARD "$(msg dash.prompt)" "1"
  if [ "${HICLAW_DASHBOARD}" = "1" ]; then
    prompt HICLAW_PORT_DASHBOARD "$(msg dash.port_prompt)" "13000"
    prompt HICLAW_DASHBOARD_IMAGE "$(msg dash.image_prompt)" "hiclaw-dashboard:latest"
  fi
}
```

#### Add to the state machine (in the main wizard loop):

```bash
# Add "dashboard" step after the volume/workspace step
"dashboard")
  step_dashboard
  STEP_RESULT="next"
  NEXT_STEP="<next_step_after_dashboard>"
  ;;
```

#### Add to container startup (after the main controller/manager container starts):

```bash
# --- TaDashboard (optional) ---
if [ "${HICLAW_DASHBOARD:-1}" = "1" ]; then
    echo "$(msg dash.starting)"

    # Detect controller URL
    local _dash_ctrl_url="http://hiclaw-controller:8090"
    if ${DOCKER_CMD} ps --format '{{.Names}}' | grep -q "hiclaw-manager"; then
        _dash_ctrl_url="http://hiclaw-manager:8090"
    fi

    ${DOCKER_CMD} run -d --name hiclaw-dashboard \
        --network hiclaw-net \
        --restart unless-stopped \
        -p "${_port_prefix}${HICLAW_PORT_DASHBOARD:-13000}:3000" \
        -e HICLAW_CONTROLLER_URL="${_dash_ctrl_url}" \
        -e NEXT_PUBLIC_MATRIX_API_URL="http://matrix-local.hiclaw.io:6167" \
        -e DATABASE_URL="file:/app/db/dashboard.db" \
        -v "hiclaw-dashboard-data:/app/db" \
        "${HICLAW_DASHBOARD_IMAGE:-hiclaw-dashboard:latest}"

    # Wait for readiness
    if _wait_for_url "http://127.0.0.1:${HICLAW_PORT_DASHBOARD:-13000}/" hiclaw-dashboard 60 "Dashboard"; then
        echo "$(msg dash.ready)"
    else
        echo "$(msg dash.failed)"
    fi
fi
```

#### Add to env file generation:

```bash
# Dashboard
echo "HICLAW_DASHBOARD=${HICLAW_DASHBOARD}" >> "${_env_file}"
echo "HICLAW_PORT_DASHBOARD=${HICLAW_PORT_DASHBOARD}" >> "${_env_file}"
echo "HICLAW_DASHBOARD_IMAGE=${HICLAW_DASHBOARD_IMAGE}" >> "${_env_file}"
```

### 2. `install/hiclaw-verify.sh`

Add after the existing health checks:

```bash
# --- Check: Dashboard ---
_step "Dashboard"
if [ "${HICLAW_DASHBOARD:-1}" = "1" ]; then
    if ${DOCKER_CMD} ps --format '{{.Names}}' | grep -qx "hiclaw-dashboard"; then
        _port_dash="${HICLAW_PORT_DASHBOARD:-13000}"
        if curl -sf "http://127.0.0.1:${_port_dash}/" >/dev/null 2>&1; then
            _pass "Dashboard accessible on port ${_port_dash}"
        else
            _fail "Dashboard not accessible on port ${_port_dash}"
        fi
    else
        _fail "Dashboard container not running"
    fi
else
    _skip "Dashboard disabled"
fi
```

### 3. `Makefile`

Add these targets:

```makefile
# --- TaDashboard ---
DASHBOARD_IMAGE ?= hiclaw-dashboard:latest
DASHBOARD_DIR ?= ./dashboard

.PHONY: build-dashboard install-dashboard

build-dashboard:
	docker build -t $(DASHBOARD_IMAGE) $(DASHBOARD_DIR)

install-dashboard: build-dashboard
	@bash ./install/hiclaw-dashboard.sh
```

## Quick Reference

| Action | Command |
|--------|---------|
| Standalone install | `bash install/hiclaw-dashboard.sh` |
| Uninstall | `bash install/hiclaw-dashboard.sh uninstall` |
| Build image only | `docker build -t hiclaw-dashboard:latest .` |
| View logs | `docker logs -f hiclaw-dashboard` |
| Default port | `13000` |
| Access URL | `http://127.0.0.1:13000/` |
