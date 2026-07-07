package com.ayusutra.backend.dto;

import com.ayusutra.backend.model.DiagnosticCenter;

import java.util.List;

public class DiagnosticSearchResponse {
    private List<DiagnosticCenter> centers;
    private long total;
    private boolean hasMore;

    public DiagnosticSearchResponse() {}

    public DiagnosticSearchResponse(List<DiagnosticCenter> centers, long total, boolean hasMore) {
        this.centers = centers;
        this.total = total;
        this.hasMore = hasMore;
    }

    public List<DiagnosticCenter> getCenters() { return centers; }
    public void setCenters(List<DiagnosticCenter> centers) { this.centers = centers; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public boolean isHasMore() { return hasMore; }
    public void setHasMore(boolean hasMore) { this.hasMore = hasMore; }
}
