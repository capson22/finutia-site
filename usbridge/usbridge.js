(function () {
  "use strict";

  // The newest release, as GitHub's API describes it (the one address on GitHub a web page may read). The small
  // installer is what checks Finutia's signature before anything runs; this only says which release is current and
  // offers the full installer, from the releases repository and nowhere else. The Android button always links to
  // releases/latest/download/Finutia-USBridge.apk; this says which version that is, or that there is none yet.
  const repository = "capson22/Finutia-USBridge-Releases";
  const expectedPrefix = `/${repository}/releases/download/`;
  const state = document.querySelector("[data-usb-release]");
  const full = document.querySelector("[data-usb-full]");
  const apk = document.querySelector("[data-usb-apk]");
  const apkState = document.querySelector("[data-usb-apk-release]");
  if (!state || !full) return;

  function trusted(url) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch (_) {
      return null;
    }
    if (
      parsed.href !== url ||
      parsed.protocol !== "https:" ||
      parsed.hostname !== "github.com" ||
      parsed.port ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      !parsed.pathname.startsWith(expectedPrefix) ||
      parsed.pathname.slice(expectedPrefix.length).split("/").length !== 2
    ) {
      return null;
    }
    return parsed.href;
  }

  function text(node, value) {
    node.textContent = value;
    return node;
  }

  fetch(`https://api.github.com/repos/${repository}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store"
  })
    .then(function (response) {
      if (!response.ok) throw new Error("no-release");
      return response.json();
    })
    .then(function (release) {
      const version = String(release.tag_name || "").replace(/^v/, "");
      if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error("bad-version");
      const assets = Array.isArray(release.assets) ? release.assets : [];
      const released = new Date(release.published_at);
      const when = isNaN(released)
        ? ""
        : ` (${released.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })})`;
      showApk(assets, version);

      const name = `Finutia-USBridge-Setup-${version}.exe`;
      const asset = assets.find(function (a) {
        return a.name === name && a.state === "uploaded";
      });
      const href = asset && trusted(asset.browser_download_url);
      if (!href) throw new Error("no-installer");

      state.replaceChildren(
        document.createTextNode("Latest version: "),
        text(document.createElement("strong"), version),
        document.createTextNode(when)
      );
      state.dataset.kind = "ready";

      full.href = href;
      full.textContent = `full installer (${Math.round(asset.size / 1048576)} MB)`;
    })
    .catch(function () {
      state.textContent = "The latest version is listed on GitHub.";
      if (apkState && !apkState.dataset.kind) apkState.textContent = "The latest version is listed on GitHub.";
    });

  // The latest release's app, when it has one; a release made without it leaves the button with no file behind it.
  function showApk(assets, version) {
    if (!apk || !apkState) return;
    const asset = assets.find(function (a) {
      return a.name === "Finutia-USBridge.apk" && a.state === "uploaded";
    });
    if (!asset || !trusted(asset.browser_download_url)) {
      apk.hidden = true;
      const steps = document.querySelector("[data-usb-apk-steps]");
      if (steps) steps.hidden = true;
      apkState.textContent = "Not available yet.";
      apkState.dataset.kind = "none";
      return;
    }
    apkState.replaceChildren(
      document.createTextNode("Latest version: "),
      text(document.createElement("strong"), version),
      document.createTextNode(` (${Math.max(1, Math.round(asset.size / 1048576))} MB)`)
    );
    apkState.dataset.kind = "ready";
  }
}());
