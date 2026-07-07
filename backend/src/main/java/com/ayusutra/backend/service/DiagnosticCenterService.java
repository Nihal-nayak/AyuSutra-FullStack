package com.ayusutra.backend.service;

import com.ayusutra.backend.dto.DiagnosticSearchResponse;
import com.ayusutra.backend.model.DiagnosticCenter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiagnosticCenterService {

    @PersistenceContext
    private EntityManager entityManager;

    private static final String SEARCHABLE_FIELDS =
        "LOWER(CONCAT(d.name, ' ', COALESCE(d.notes, ''), ' ', COALESCE(d.type, ''), ' ', COALESCE(d.location, '')))";

    private static final String DISTANCE_EXPR =
        "(6371 * acos(LEAST(1.0, cos(radians(:userLat)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:userLng)) + sin(radians(:userLat)) * sin(radians(d.latitude)))))";

    private static final String FILTER_CLAUSE =
        "(:checkNabl = false OR LOWER(d.type) LIKE '%nabl%') AND " +
        "(:checkHome = false OR LOWER(d.notes) LIKE '%home%') AND " +
        "(:check247 = false OR LOWER(d.status) LIKE '%24/7%' OR LOWER(d.status) LIKE '%always%' OR LOWER(d.status) LIKE '%24 hrs%') AND " +
        "(:category IS NULL OR " +
        "(:category = 'Radiology' AND (LOWER(d.notes) LIKE '%x-ray%' OR LOWER(d.notes) LIKE '%scan%' OR LOWER(d.name) LIKE '%scan%')) OR " +
        "(:category = 'Pathology' AND (LOWER(d.type) LIKE '%laboratory%' OR LOWER(d.name) LIKE '%lab%' OR LOWER(d.notes) LIKE '%report%' OR LOWER(d.notes) LIKE '%cbc%' OR LOWER(d.notes) LIKE '%blood%')) OR " +
        "(:category = 'Cardiology' AND (LOWER(d.notes) LIKE '%cardio%' OR LOWER(d.notes) LIKE '%ecg%' OR LOWER(d.name) LIKE '%cardio%')) OR " +
        "(:category = 'Wellness' AND (LOWER(d.type) LIKE '%clinic%' OR LOWER(d.name) LIKE '%health%' OR LOWER(d.name) LIKE '%polyclinic%' OR LOWER(d.notes) LIKE '%wellness%')))";

    public DiagnosticSearchResponse search(
            String query,
            boolean nabl,
            boolean homeCollection,
            boolean availability,
            String category,
            Double userLat,
            Double userLng,
            int limit,
            int offset) {

        List<String> words = parseSearchWords(query);
        String whereClause = FILTER_CLAUSE + buildWordClause(words);

        String countSql = "SELECT COUNT(*) FROM diagnostic_centers d WHERE " + whereClause;
        String searchSql = "SELECT d.*, " + DISTANCE_EXPR + " AS distance FROM diagnostic_centers d WHERE "
            + whereClause + " ORDER BY distance ASC LIMIT :limit OFFSET :offset";

        Query countQuery = entityManager.createNativeQuery(countSql);
        Query searchQuery = entityManager.createNativeQuery(searchSql, DiagnosticCenter.class);

        bindFilterParams(countQuery, nabl, homeCollection, availability, category, words);
        bindFilterParams(searchQuery, nabl, homeCollection, availability, category, words);
        searchQuery.setParameter("userLat", userLat);
        searchQuery.setParameter("userLng", userLng);
        searchQuery.setParameter("limit", limit);
        searchQuery.setParameter("offset", offset);

        long total = ((Number) countQuery.getSingleResult()).longValue();

        @SuppressWarnings("unchecked")
        List<DiagnosticCenter> centers = searchQuery.getResultList();

        boolean hasMore = (offset + centers.size()) < total;
        return new DiagnosticSearchResponse(centers, total, hasMore);
    }

    private List<String> parseSearchWords(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(query.trim().toLowerCase().split("\\s+"))
            .filter((word) -> !word.isEmpty())
            .collect(Collectors.toList());
    }

    private String buildWordClause(List<String> words) {
        StringBuilder clause = new StringBuilder();
        for (int i = 0; i < words.size(); i++) {
            clause.append(" AND ").append(SEARCHABLE_FIELDS).append(" LIKE :word").append(i);
        }
        return clause.toString();
    }

    private void bindFilterParams(
            Query query,
            boolean nabl,
            boolean homeCollection,
            boolean availability,
            String category,
            List<String> words) {

        query.setParameter("checkNabl", nabl);
        query.setParameter("checkHome", homeCollection);
        query.setParameter("check247", availability);
        query.setParameter("category", category);

        for (int i = 0; i < words.size(); i++) {
            query.setParameter("word" + i, "%" + words.get(i) + "%");
        }
    }
}
