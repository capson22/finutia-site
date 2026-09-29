(function () {
  "use strict";

  // The newest release, as GitHub's API describes it (the one address on GitHub a web page may read). The small
  // installer is what checks Finutia's signature before anything runs; this only says which release is current and
  // offers the full installer, from the releases repository and nowhere else.
  const repository = "capson22/Finutia-USBridge-Releases";
  const expectedPrefix = `/${repository}/releases/download/`;
  const state = document.querySelector("[data-usb-release]");
  const full = document.querySelector("[data-usb-full]");
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
      const name = `Finutia-USBridge-Setup-${version}.exe`;
      const asset = (Array.isArray(release.assets) ? release.assets : []).find(function (a) {
        return a.name === name && a.state === "uploaded";
      });
      const href = asset && trusted(asset.browser_download_url);
      if (!href) throw new Error("no-installer");

      const released = new Date(release.published_at);
      const when = isNaN(released)
        ? ""
        : ` · ${released.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
      state.replaceChildren(
        document.createTextNode("Newest release: "),
        text(document.createElement("strong"), `USBridge ${version}`),
        document.createTextNode(when)
      );
      state.dataset.kind = "ready";

      full.href = href;
      full.textContent = `Full installer, ${Math.round(asset.size / 1048576)} MB`;
      if (typeof asset.digest === "string" && /^sha256:[0-9a-f]{64}$/.test(asset.digest)) {
        const digest = text(document.createElement("span"), `SHA-256 ${asset.digest.slice(7).toUpperCase()}`);
        digest.className = "usb-digest";
        full.after(digest);
      }
    })
    .catch(function () {
      state.textContent = "The newest release is listed on GitHub.";
      full.href = `https://github.com/${repository}/releases/latest`;
      full.textContent = "Releases on GitHub";
    });
}());
