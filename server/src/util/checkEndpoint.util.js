import axios from "axios";

async function checkEndpoint(url) {
    const startTime = Date.now();
    const cont = new AbortController();
    const timeout = setTimeout(() => {
        cont.abort();
    }, 5000); // 5 seconds timeout


    try {

        const response = await axios.get(normalizeUrl(url), {
            signal: cont.signal,
            validateStatus: () => true
        });
        return {
            success: response.status >= 200 && response.status < 400,
            statusCode: response.status,
            responseTimeMs: Date.now() - startTime,
            error: response.status >= 400
                ? `HTTP ${response.status}`
                : null
        };
    } catch (error) {
        return {
            success: false,
            statusCode: null,
            responseTimeMs: Date.now() - startTime,
            error: error.name === "CanceledError"
                ? "Request timeout"
                : error.message
        };
    } finally {
        clearTimeout(timeout);
    }
}

function normalizeUrl(input) {
    let url = input.trim();

    // Add protocol if missing
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }

    const parsedUrl = new URL(url);

    // Only allow HTTP/HTTPS
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are supported");
    }

    return parsedUrl.toString();
}


export { checkEndpoint, normalizeUrl };