package com.organizational.knowledge_gap_platform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LinkAvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(LinkAvailabilityService.class);

    private static final Duration CACHE_TTL = Duration.ofMinutes(15);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(4);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(REQUEST_TIMEOUT)
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    private record CacheEntry(boolean available, Instant checkedAt) {
        boolean isFresh() {
            return Duration.between(checkedAt, Instant.now()).compareTo(CACHE_TTL) < 0;
        }
    }

    public boolean isLinkActive(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        CacheEntry entry = cache.get(url);
        if (entry != null && entry.isFresh()) {
            return entry.available();
        }
        return refresh(url);
    }

    public Map<String, Boolean> isLinkActiveBulk(List<String> urls) {
        List<String> distinctUrls = urls.stream()
                .filter(u -> u != null && !u.isBlank())
                .distinct()
                .toList();

        List<String> toRefresh = distinctUrls.stream()
                .filter(u -> {
                    CacheEntry e = cache.get(u);
                    return e == null || !e.isFresh();
                })
                .toList();

        List<CompletableFuture<Void>> futures = toRefresh.stream()
                .map(u -> CompletableFuture.runAsync(() -> refresh(u)))
                .toList();
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        Map<String, Boolean> result = new HashMap<>();
        for (String u : distinctUrls) {
            CacheEntry e = cache.get(u);
            result.put(u, e != null && e.available());
        }
        return result;
    }

    public boolean refresh(String url) {
        boolean available = probe(url);
        cache.put(url, new CacheEntry(available, Instant.now()));
        return available;
    }

    private boolean probe(String url) {
        try {
            HttpRequest headRequest = HttpRequest.newBuilder(URI.create(url))
                    .timeout(REQUEST_TIMEOUT)
                    .method("HEAD", HttpRequest.BodyPublishers.noBody())
                    .header("User-Agent", "KnowGap-LinkChecker/1.0")
                    .build();

            HttpResponse<Void> response = httpClient.send(headRequest, HttpResponse.BodyHandlers.discarding());
            int status = response.statusCode();

            if (status == 405 || status == 501) {
                return probeWithGet(url);
            }
            return isSuccessOrRedirect(status);
        } catch (Exception headEx) {
            try {
                return probeWithGet(url);
            } catch (Exception getEx) {
                log.debug("Link check failed for {}: {}", url, getEx.getMessage());
                return false;
            }
        }
    }

    private boolean probeWithGet(String url) throws java.io.IOException, InterruptedException {
        HttpRequest getRequest = HttpRequest.newBuilder(URI.create(url))
                .timeout(REQUEST_TIMEOUT)
                .GET()
                .header("User-Agent", "KnowGap-LinkChecker/1.0")
                .build();
        HttpResponse<Void> response = httpClient.send(getRequest, HttpResponse.BodyHandlers.discarding());
        return isSuccessOrRedirect(response.statusCode());
    }

    private boolean isSuccessOrRedirect(int status) {
        return status >= 200 && status < 400;
    }
}
