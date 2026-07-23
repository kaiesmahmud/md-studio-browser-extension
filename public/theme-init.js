(function () {
  try {
    var stored = localStorage.getItem("md-studio-theme");
    var mode = stored || "system";
    var isDark =
      mode === "dark" ||
      (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch (e) {
    /* storage blocked */
  }
})();
