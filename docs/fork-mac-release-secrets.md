# Fork Mac Release Secrets

This document explains how to prepare the GitHub Actions secrets used by:

- `.github/workflows/fork-mac-release.yml`

It is written for a personal fork that publishes signed macOS release artifacts.

## Where to configure them

Open your fork on GitHub:

- `Settings -> Secrets and variables -> Actions -> New repository secret`

## Required secrets

### 1. `CSC_LINK`

This is the signing certificate payload consumed by `electron-builder`.

In this project, the practical path is:

1. Use a macOS machine that has your Apple Developer signing certificate installed in Keychain Access.
2. Open **Keychain Access**.
3. Find your **Developer ID Application** certificate.
4. Expand it and make sure the matching private key is present.
5. Export the certificate **together with the private key** as a `.p12` file.
6. Protect the export with a password.
7. Base64-encode the `.p12` file and store the encoded string as `CSC_LINK`.

Example on macOS:

```bash
base64 -i developer-id-application.p12 | pbcopy
```

Then paste the clipboard content into the GitHub secret value.

Notes:

- The certificate must include the private key.
- A `.cer` file alone is not enough.
- For macOS distribution, you typically want **Developer ID Application**, not an Apple Development certificate.

### 2. `CSC_KEY_PASSWORD`

This is the password you set when exporting the `.p12` file.

It must match the password used to create the file referenced by `CSC_LINK`.

### 3. `APPLE_ID`

This is the Apple account email used for notarization.

It should be an account that has access to the Apple Developer team that owns the signing identity.

### 4. `APPLE_APP_SPECIFIC_PASSWORD`

This is the app-specific password used by the notarization step.

Typical path:

1. Sign in to your Apple ID account management page.
2. Open the **Sign-In and Security** section.
3. Create an **App-Specific Password**.
4. Save it into the GitHub secret `APPLE_APP_SPECIFIC_PASSWORD`.

### 5. `APPLE_TEAM_ID`

This is your Apple Developer Team ID.

You can usually find it from:

- Apple Developer account membership details
- App Store Connect account/team settings

If you already have the signing identity installed locally, you can also often confirm the team identifier from your signing environment or certificate metadata.

## How these secrets are used in this repo

### Signing

`fork-mac-release.yml` passes:

- `CSC_LINK`
- `CSC_KEY_PASSWORD`

to the macOS build step that runs:

```bash
pnpm build:mac
```

### Notarization

The repo calls:

- `scripts/notarize.js`

That script only notarizes on macOS and only when all three are present:

- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

If they are missing, the build can still complete, but notarization is skipped.

## Optional secrets already referenced by build workflows

These are unrelated to Apple signing, but upstream workflows already pass them into builds:

- `MAIN_VITE_CHERRYAI_CLIENT_SECRET`
- `MAIN_VITE_MINERU_API_KEY`
- `RENDERER_VITE_AIHUBMIX_SECRET`
- `RENDERER_VITE_PPIO_APP_SECRET`

If your fork build fails because one of these is required by runtime packaging or build-time checks, add the missing values.

## Minimal starting setup

If your goal is only to produce a signed macOS DMG for yourself, start with:

- `CSC_LINK`
- `CSC_KEY_PASSWORD`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

Then run the `Fork Mac Release` workflow manually.

## Sanity checklist

Before triggering the workflow, verify:

- your fork `main` contains the commits you want to ship
- your tag looks fork-specific, for example `v1.9.1-leo.1`
- the `.p12` export actually includes the private key
- `CSC_KEY_PASSWORD` matches the export password
- your Apple account can notarize apps for the selected team

## Recommended release pattern

For personal maintenance, keep releases simple:

1. merge your patch branch into your fork `main`
2. run `Fork Mac Release`
3. publish as a draft first
4. download and test the DMG locally
5. publish the release once installation looks normal
