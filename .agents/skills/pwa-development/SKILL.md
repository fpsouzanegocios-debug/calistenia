---
name: pwa-development
description: Progressive Web Apps - service workers, caching strategies, offline, manifest, install prompts, push notifications
when-to-use: When building PWA features - service workers, caching, offline support, install tracking
---

# PWA Development Skill

**Purpose:** Build Progressive Web Apps that work offline, install like native apps, and deliver fast, reliable experiences across all devices.

## Core PWA Requirements
1. HTTPS (localhost allowed for development)
2. Service Worker (background script for caching, offline, notifications)
3. Web App Manifest (metadata, icons, display: standalone)

## Web App Manifest
Ensure manifest.json includes:
- name, short_name, description
- start_url, scope
- display: "standalone"
- orientation: "portrait-primary"
- background_color, theme_color
- Complete icon set (192px, 512px, 512px maskable)
- shortcuts for quick access

## Service Worker Lifecycle & Caching
- Cache First for static assets (CSS, JS, fonts, media)
- Stale-While-Revalidate or Network First for API and dynamic views
- Offline fallback page or cached shell
- Push event listeners for native notifications
- Notificationclick handling with window focus and navigation

## Installability & Install Tracking
- Intercept `beforeinstallprompt` event to provide in-app custom install buttons
- Listen to `appinstalled` event and `display-mode: standalone` media query to detect and persist installation metrics
