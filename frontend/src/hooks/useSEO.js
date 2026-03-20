import { useEffect } from "react";

const SITE_NAME = "Immigration Pathways Consulting";
const BASE_URL = "https://www.immigrationpathwaysconsulting.com";
const DEFAULT_IMAGE = `${BASE_URL}/images/hero-banner.webp`;

function setMeta(selector, attr, value) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [attrName, attrVal] = selector.match(/\[(.+?)="(.+?)"\]/).slice(1);
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function setCanonical(url) {
  let el = document.querySelector("link[rel='canonical']");
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

export default function useSEO({ title, description }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const fullUrl = `${BASE_URL}${window.location.pathname}`;

    // Title
    document.title = fullTitle;

    // Standard meta
    setMeta("[name='description']", "content", description || "");
    setMeta("[name='title']", "content", fullTitle);

    // Canonical
    setCanonical(fullUrl);

    // Open Graph
    setMeta("[property='og:title']", "content", fullTitle);
    setMeta("[property='og:description']", "content", description || "");
    setMeta("[property='og:url']", "content", fullUrl);
    setMeta("[property='og:image']", "content", DEFAULT_IMAGE);

    // Twitter
    setMeta("[name='twitter:title']", "content", fullTitle);
    setMeta("[name='twitter:description']", "content", description || "");
    setMeta("[name='twitter:url']", "content", fullUrl);
  }, [title, description]);
}
