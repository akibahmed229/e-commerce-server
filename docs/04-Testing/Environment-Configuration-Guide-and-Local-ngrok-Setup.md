## Overview

This project is developed on **NixOS**, where each project uses its own isolated development environment through **Nix DevShell**. Rather than manually installing development dependencies, the entire development environment is reproducible from the Nix configuration.

In addition to the development environment, **ngrok** is configured as a **systemd service** using a custom NixOS module. This allows the backend API to be securely exposed to the internet without manually starting ngrok each time.

---

# Development Environment

The development environment is managed using my personal NixOS configuration.

**NixOS Configuration Repository**

> https://github.com/akibahmed229/nixos

The repository contains:

- Reproducible development environments using DevShell
- Shared development tools
- Custom NixOS modules
- Host-specific configurations
- System services

Each project can have its own isolated development environment while keeping the base operating system clean.

---

# Custom ngrok Module

Instead of manually starting ngrok from the terminal, this project uses a custom **NixOS module** that automatically creates **systemd services** for ngrok tunnels.

Module Source:

> https://github.com/akibahmed229/nixos/blob/main/modules/nixos/ngrok/default.nix

The module provides:

- Automatic ngrok installation
- Dynamic tunnel creation
- Systemd service management
- Automatic restart on failure
- Service dependency management
- Support for multiple tunnels
- Dynamic domain loading from external files

This makes ngrok behave like any other system service.

---

# Module Configuration

The module exposes the following configuration options.

| Option             | Description                                       |
| ------------------ | ------------------------------------------------- |
| `serviceName`      | Name of the generated systemd service.            |
| `targetPort`       | Local application port to expose.                 |
| `domainFile`       | File containing the reserved ngrok domain.        |
| `dependsOnService` | Service that must be running before ngrok starts. |
| `runAsUser`        | User that owns the ngrok process.                 |

---

# Project Configuration

For this e-commerce backend, the ngrok module is configured in the desktop host configuration.

Configuration:

> https://github.com/akibahmed229/nixos/blob/main/hosts/nixos/x86_64-linux/desktop/default.nix

```nix
nm.ngrok = {
  en = true;

  tunnels = [
    {
      serviceName = "ngrok_ecommerce_server";
      targetPort = 4000;
      domainFile = secrets "/ngrok/domain.txt";
      runAsUser = user;
    }
  ];
};
```

This configuration creates a dedicated systemd service that exposes the backend running on **port 4000**.

---

# How It Works

The custom module performs the following steps automatically:

1. Installs **ngrok** as a system package.
2. Reads the reserved ngrok domain from a secure file.
3. Waits for the target service (if configured).
4. Creates a dedicated systemd service.
5. Starts the ngrok tunnel automatically.
6. Restarts the tunnel if it unexpectedly stops.

Since the domain is read from an external file, sensitive configuration is kept outside of the Nix configuration itself.

---

# Starting the Backend

Start the backend application as usual.

```bash
docker compose up --build -d
```

The backend listens on:

```text
http://localhost:4000
```

The ngrok systemd service automatically exposes this endpoint using the configured reserved domain.

---

# Managing the ngrok Service

Check the service status:

```bash
sudo systemctl status ngrok_ecommerce_server
```

Start the service manually:

```bash
sudo systemctl start ngrok_ecommerce_server
```

Restart the service:

```bash
sudo systemctl restart ngrok_ecommerce_server
```

Stop the service:

```bash
sudo systemctl stop ngrok_ecommerce_server
```

View service logs:

```bash
journalctl -u ngrok_ecommerce_server -f
```

---

# Advantages of This Setup

Compared to manually running ngrok, this approach provides several benefits:

- Fully reproducible through NixOS
- No manual ngrok commands
- Automatic startup using systemd
- Automatic restart on failures
- Secure separation of secrets
- Supports multiple simultaneous tunnels
- Easy to extend for additional services

---

# References

- NixOS Configuration Repository
  https://github.com/akibahmed229/nixos

- Custom ngrok Module
  https://github.com/akibahmed229/nixos/blob/main/modules/nixos/ngrok/default.nix

- Desktop Host Configuration
  https://github.com/akibahmed229/nixos/blob/main/hosts/nixos/x86_64-linux/desktop/default.nix
