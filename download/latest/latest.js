(function () {
  "use strict";

  const root = document.querySelector("[data-download-platform]");
  const state = document.querySelector("[data-download-state]");
  const link = document.querySelector("[data-download-link]");
  if (!root || !state || !link) return;

  const platform = root.dataset.downloadPlatform;
  const config = window.FINUTIA_DOWNLOAD_CONFIG || {};
  const expectedPathPrefix = `/${config.releaseRepository}/releases/download/`;

  function fail(message) {
    state.textContent = message;
    state.dataset.kind = "error";
    link.hidden = true;
  }

  function fromBase64(value) {
    return Uint8Array.from(atob(value), function (character) {
      return character.charCodeAt(0);
    });
  }

  async function verifiedPayload(envelope) {
    if (
      !envelope ||
      envelope.schema !== 1 ||
      typeof envelope.payload !== "string" ||
      typeof envelope.signature !== "string"
    ) {
      throw new Error("bad-envelope");
    }

    const payloadBytes = fromBase64(envelope.payload);
    const key = await crypto.subtle.importKey(
      "spki",
      fromBase64(config.signingPublicKey),
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      fromBase64(envelope.signature),
      payloadBytes
    );
    if (!valid) throw new Error("bad-signature");
    return JSON.parse(new TextDecoder().decode(payloadBytes));
  }

  function trustedRelease(value) {
    if (typeof value !== "string") return null;

    let parsed;
    try {
      parsed = new URL(value);
    } catch (_) {
      return null;
    }

    // Comparing the canonical URL too rejects encoded/dot-segment spellings whose raw text looks as
    // though it is under this repository but whose browser destination is somewhere else.
    if (
      parsed.href !== value ||
      parsed.protocol !== "https:" ||
      parsed.hostname !== "github.com" ||
      parsed.port ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      !parsed.pathname.startsWith(expectedPathPrefix)
    ) {
      return null;
    }

    const remainder = parsed.pathname.slice(expectedPathPrefix.length);
    const segments = remainder.split("/");
    if (segments.length !== 2 || segments.some(function (segment) { return !segment; })) return null;
    try {
      return {
        href: parsed.href,
        tag: decodeURIComponent(segments[0]),
        name: decodeURIComponent(segments[1])
      };
    } catch (_) {
      return null;
    }
  }

  async function confirmGitHubAsset(release, payload) {
    if (
      !Number.isSafeInteger(payload.sizeBytes) ||
      payload.sizeBytes <= 0 ||
      typeof payload.sha256 !== "string" ||
      !/^[0-9a-f]{64}$/.test(payload.sha256)
    ) {
      throw new Error("bad-artifact-identity");
    }

    const apiUrl =
      `https://api.github.com/repos/${config.releaseRepository}/releases/tags/` +
      encodeURIComponent(release.tag);
    const response = await fetch(apiUrl, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error("release-not-found");
    const githubRelease = await response.json();
    const assets = Array.isArray(githubRelease.assets)
      ? githubRelease.assets.filter(function (asset) { return asset.name === release.name; })
      : [];
    if (
      assets.length !== 1 ||
      assets[0].state !== "uploaded" ||
      assets[0].browser_download_url !== release.href ||
      assets[0].size !== payload.sizeBytes ||
      assets[0].digest !== `sha256:${payload.sha256}`
    ) {
      throw new Error("release-does-not-match-manifest");
    }
    return release.href;
  }

  if (!config.manifestBaseUrl || !config.releaseRepository || !config.signingPublicKey) {
    fail("Downloads have not been configured yet. Please check back after the first release.");
    return;
  }

  const endpoint = `${config.manifestBaseUrl}/${encodeURIComponent(platform)}/stable/latest.json`;
  fetch(endpoint, { headers: { Accept: "application/json" }, cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("no-release");
      return response.json();
    })
    .then(verifiedPayload)
    .then(async function (payload) {
      if (payload.platform !== platform || payload.channel !== "stable") {
        throw new Error("wrong-release");
      }
      const release = trustedRelease(payload.url);
      if (!release) {
        throw new Error("untrusted-url");
      }
      const releaseUrl = await confirmGitHubAsset(release, payload);

      link.href = releaseUrl;
      link.hidden = false;
      link.textContent = `Download Finutia ${payload.version}`;
      state.textContent = `Latest stable release: ${payload.version}`;
      state.dataset.kind = "ready";
    })
    .catch(function () {
      fail("No verified public release is available for this platform yet. Please check back soon.");
    });
}());
