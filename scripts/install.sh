#!/usr/bin/env bash
# HuaweiCloud DevKit Linux/macOS Installer
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}HuaweiCloud DevKit Installer${NC}"
echo "============================"
echo ""

# 1. Check Node.js >= 20
check_node() {
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Install Node.js >= 20 from https://nodejs.org/ or via nvm:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash"
    echo "  nvm install 20"
    exit 1
  fi
  NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_MAJOR" -lt 20 ]; then
    echo -e "${RED}Error: Node.js >= 20 required (current: $(node -v))${NC}"
    exit 1
  fi
  echo -e "  Node.js $(node -v) ${GREEN}OK${NC}"
}

# 2. Install KooCLI if missing
install_hcloud() {
  if command -v hcloud &> /dev/null; then
    echo -e "  hcloud $(hcloud version | head -1) ${GREEN}OK${NC}"
    return
  fi

  echo ""
  echo -e "${YELLOW}KooCLI (hcloud) not found. Installing...${NC}"

  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)

  case "$ARCH" in
    x86_64|amd64) ARCH="amd64" ;;
    aarch64|arm64) ARCH="arm64" ;;
    *)
      echo -e "${RED}Unsupported architecture: $ARCH${NC}"
      echo "Please install KooCLI manually: https://support.huaweicloud.com/qs-hcli/hcli_02_003.html"
      exit 1
      ;;
  esac

  BASE_URL="https://cn-north-4-hdn-koocli.obs.cn-north-4.myhuaweicloud.com/cli/latest"

  case "$OS" in
    linux)
      echo "Detected: Linux ($ARCH)"
      echo "Downloading one-liner install script..."
      curl -sSL "${BASE_URL}/hcloud_install.sh" -o /tmp/hcloud_install.sh
      bash /tmp/hcloud_install.sh -y
      rm -f /tmp/hcloud_install.sh
      ;;
    darwin)
      echo "Detected: macOS ($ARCH)"
      echo "Downloading one-liner install script..."
      curl -sSL "${BASE_URL}/hcloud_install.sh" -o /tmp/hcloud_install.sh
      bash /tmp/hcloud_install.sh -y
      rm -f /tmp/hcloud_install.sh
      ;;
    *)
      echo -e "${RED}Unsupported OS: $OS${NC}"
      echo "Please install KooCLI manually: https://support.huaweicloud.com/qs-hcli/hcli_02_003.html"
      exit 1
      ;;
  esac

  # Verify install
  if command -v hcloud &> /dev/null; then
    echo -e "  hcloud ${GREEN}installed successfully${NC}"
  else
    echo -e "${YELLOW}Warning: hcloud installed but not on PATH.${NC}"
    echo "  Add ~/.local/bin to your PATH: export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo "  Or set HCLOUD_BIN: export HCLOUD_BIN=\"\$HOME/.local/bin/hcloud\""
  fi
}

# 3. Install DevKit
install_devkit() {
  echo ""
  echo "Installing HuaweiCloud DevKit via npm..."

  # Determine install target based on args
  TARGET="${1:-all}"
  case "$TARGET" in
    opencode|codex|codearts|all) ;;
    *)
      echo -e "${YELLOW}Unknown target '$TARGET', defaulting to 'all'${NC}"
      TARGET="all"
      ;;
  esac

  # Check if already installed globally
  if npm list -g huaweicloud-devkit &> /dev/null; then
    echo -e "  huaweicloud-devkit ${GREEN}already installed${NC}"
  else
    npm install -g huaweicloud-devkit
    echo -e "  huaweicloud-devkit ${GREEN}installed${NC}"
  fi

  # Run setup
  echo ""
  echo "Running setup (target: $TARGET)..."
  npx huaweicloud-devkit install --target "$TARGET"
}

# 4. Accept KooCLI privacy agreement (non-interactive)
accept_privacy() {
  if command -v hcloud &> /dev/null; then
    echo ""
    echo "Accepting KooCLI privacy agreement..."
    echo "y" | hcloud version > /dev/null 2>&1 || true
    echo -e "  Privacy agreement ${GREEN}accepted${NC}"
  fi
}

# 5. Verify
verify() {
  echo ""
  echo -e "${BOLD}Verification${NC}"
  echo "-----------"
  npx huaweicloud-devkit doctor
}

main() {
  check_node
  install_hcloud
  accept_privacy
  install_devkit "${1:-all}"
  verify

  echo ""
  echo -e "${GREEN}${BOLD}Installation complete!${NC}"
  echo ""
  echo "Quick start:"
  echo "  npx huaweicloud-devkit doctor    # Check environment"
  echo "  npx huaweicloud-devkit status    # Show installed components"
  echo ""
  echo "Configure credentials (do this outside the agent chat):"
  echo "  hcloud configure init"
  echo ""
  echo "Documentation: https://github.com/huaweicloud/HuaweiCloud-Devkit"
}

TARGET="${1:-all}"
if [ "$TARGET" = "-h" ] || [ "$TARGET" = "--help" ]; then
  echo "Usage: $0 [opencode|codex|codearts|all]"
  echo ""
  echo "Install HuaweiCloud DevKit and KooCLI on Linux/macOS."
  echo ""
  echo "Targets:"
  echo "  all        Install for all supported agents (default)"
  echo "  opencode   Install for OpenCode"
  echo "  codex      Install for Codex CLI/Desktop"
  echo "  codearts   Install for CodeArts"
  exit 0
fi

main "$TARGET"