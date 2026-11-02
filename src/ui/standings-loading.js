const loadingClass = "qoj-ccpc-loading";
const initializationTimeoutMs = 5000;

export function hideStandingsDuringInitialization() {
    let root = null;
    let style = null;
    let rootObserver = null;
    let released = false;
    const timeoutId = window.setTimeout(() => {
        console.warn("[QOJ CCPC Enhancer] 5 秒内未完成初始化，解除榜单隐藏");
        release();
    }, initializationTimeoutMs);

    function release() {
        if (released) {
            return;
        }

        released = true;
        window.clearTimeout(timeoutId);
        window.removeEventListener("pagehide", release);
        rootObserver?.disconnect();
        root?.classList.remove(loadingClass);
        style?.remove();
    }

    function hide() {
        if (released || document.documentElement === null) {
            return;
        }

        root = document.documentElement;
        style = document.createElement("style");
        style.textContent = `
html.${loadingClass} #standings {
    visibility: hidden !important;
}
`;
        (document.head ?? root).append(style);
        root.classList.add(loadingClass);
        rootObserver?.disconnect();
    }

    try {
        window.addEventListener("pagehide", release, { once: true });

        if (document.documentElement === null) {
            rootObserver = new window.MutationObserver(hide);
            rootObserver.observe(document, { childList: true });
        } else {
            hide();
        }
    } catch (error) {
        release();
        throw error;
    }

    return release;
}
