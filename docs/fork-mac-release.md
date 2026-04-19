# Fork Mac Release

This document describes how to build signed macOS release assets from a personal fork of Cherry Studio.

## Scope

This repository includes a fork-only workflow:

- `.github/workflows/fork-mac-release.yml`

It is intended for:

- building macOS artifacts from your own fork
- publishing `dmg` and `zip` assets to your fork's Releases page
- avoiding changes to the upstream release workflow

## Recommended Flow

1. Merge your feature branch into your fork's `main`.
2. Open GitHub Actions in your fork.
3. Run `Fork Mac Release`.
4. Set:
   - `tag`: for example `v1.9.1-leo.1`
   - `ref`: usually `main`
   - `draft`: `true` for manual verification before publishing
5. Download the generated `dmg` from your fork's Release page.

## Required GitHub Secrets

Go to:

- `GitHub repo -> Settings -> Secrets and variables -> Actions`

Add these secrets for signed macOS builds:

### Required for signing / notarization

- `CSC_LINK`
  - Base64-encoded macOS signing certificate archive, or the certificate payload expected by `electron-builder`
- `CSC_KEY_PASSWORD`
  - Password for the signing certificate
- `APPLE_ID`
  - Apple Developer account email
- `APPLE_APP_SPECIFIC_PASSWORD`
  - App-specific password for notarization
- `APPLE_TEAM_ID`
  - Apple Developer Team ID

### Optional app secrets used by existing build scripts

These are already referenced by upstream workflows. If your build or runtime packaging expects them, set them too:

- `MAIN_VITE_CHERRYAI_CLIENT_SECRET`
- `MAIN_VITE_MINERU_API_KEY`
- `RENDERER_VITE_AIHUBMIX_SECRET`
- `RENDERER_VITE_PPIO_APP_SECRET`

If you do not use these integrations, you can try leaving them unset first and add them only if build-time checks require them.

## Outputs

The workflow publishes:

- `dist/*.dmg`
- `dist/*.zip`
- `dist/latest-mac.yml`
- `dist/*.blockmap`

## Practical Notes

### 1. Signed DMG vs unsigned DMG

If the Apple signing secrets are configured correctly, the generated DMG is suitable for normal replacement of the installed app on macOS.

If they are missing, the build may still produce artifacts, but macOS may warn on first launch and the install experience will be rougher.

### 2. Replacing the installed app

For self-use, the normal path is:

1. Download the DMG from your fork Release.
2. Open the DMG.
3. Replace `/Applications/Cherry Studio.app`.

### 3. Auto-update behavior

Your forked app artifacts are not automatically wired into the upstream update channel.

Treat forked DMGs as manual installs unless you also decide to maintain your own update feed and release metadata strategy.

### 4. Tag naming

Use fork-specific tags so they are easy to distinguish from upstream:

- `v1.9.1-leo.1`
- `v1.9.1-leo.2`
- `v1.9.2-leo.1`

## Suggested Maintenance Strategy

Keep this fork thin:

1. regularly fetch `upstream`
2. rebase `copilot-fixes` onto upstream `main`
3. merge into your fork `main`
4. cut a fork-specific tag only when you need a fresh macOS installer

## Current Copilot Fixes

The current fork patchset includes:

- GitHub Copilot device flow response parsing fallback for non-JSON responses
- GitHub Copilot `/models` listing using a live Copilot token instead of the empty provider API key
