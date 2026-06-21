#!/usr/bin/env bash
# Deploy the TaDashboard *alongside* an existing HiClaw Helm release.
#
# This script does NOT deploy the HiClaw controller, Higress, Matrix or
# storage — those are assumed to be already installed (e.g. via
# `helm install hiclaw higress.io/hiclaw -n hiclaw-system`).
# It only applies the dashboard manifests under deploy/k3s-with-hiclaw/.
#
# Usage:
#   scripts/deploy-with-hiclaw.sh
#   K3S_KUBECONFIG=/path/k3s.yaml scripts/deploy-with-hiclaw.sh
#
# Assumes scripts/build-and-load-image.sh has been run first.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -f .env.k3s.local ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env.k3s.local; set +a
elif [ -f .env.k3s.example ]; then
  echo "info: .env.k3s.local not found; falling back to .env.k3s.example" >&2
  # shellcheck disable=SC1091
  set -a; . ./.env.k3s.example; set +a
fi

export KUBECONFIG="${K3S_KUBECONFIG:-/etc/rancher/k3s/k3s.yaml}"

if ! command -v kubectl >/dev/null 2>&1; then
  if [ -x /usr/local/bin/k3s ]; then
    shopt -s expand_aliases
    alias kubectl='k3s kubectl'
  else
    echo "kubectl (or k3s) not found on PATH" >&2
    exit 1
  fi
fi

echo "==> Verifying HiClaw controller is reachable"
if ! kubectl -n hiclaw-system get svc hiclaw-controller >/dev/null 2>&1; then
  echo "Service hiclaw-controller not found in namespace hiclaw-system." >&2
  echo "Install HiClaw first, e.g.:" >&2
  echo "  helm install hiclaw higress.io/hiclaw -n hiclaw-system --create-namespace" >&2
  exit 1
fi

echo "==> Verifying IngressClass 'higress' is installed"
if ! kubectl get ingressclass higress >/dev/null 2>&1; then
  echo "Higress IngressClass not found. HiClaw deploys Higress automatically;" >&2
  echo "if it is missing, check the Helm release status." >&2
  exit 1
fi

echo "==> Applying dashboard manifests under deploy/k3s-with-hiclaw/"
kubectl apply -k "${ROOT}/deploy/k3s-with-hiclaw"

echo "==> Waiting for dashboard rollout"
kubectl -n "${NAMESPACE:-hiclaw-system}" rollout status deploy/hiclaw-dashboard --timeout=180s

echo
echo "Cluster state:"
kubectl -n "${NAMESPACE:-hiclaw-system}" get pods,svc,ingress,pvc

HOST="${INGRESS_HOST:-hiclaw.localhost}"
echo
echo "Dashboard will be available at http://${HOST} (Higress gateway on node port 80)."
echo "Add '${HOST}' to /etc/hosts pointing at the k3s node IP if needed."
