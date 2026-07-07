package com.ayusutra.backend.controller;

import com.ayusutra.backend.dto.DiagnosticSearchResponse;
import com.ayusutra.backend.model.DiagnosticCenter;
import com.ayusutra.backend.service.DiagnosticCenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/diagnostics")
@CrossOrigin(origins = "*")
public class DiagnosticCenterController {

    @Autowired
    private DiagnosticCenterService diagnosticCenterService;

 @GetMapping
    public Map<String, Object> getDiagnostics(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "false") boolean nabl,
            @RequestParam(defaultValue = "false") boolean homeCollection,
            @RequestParam(defaultValue = "false") boolean availability,
            @RequestParam(defaultValue = "12.9716") Double userLat,
            @RequestParam(defaultValue = "77.5946") Double userLng,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {

        String search = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String cat = (category != null && !category.trim().isEmpty()) ? category.trim() : null;

        DiagnosticSearchResponse result = diagnosticCenterService.search(
                search, nabl, homeCollection, availability, cat,
                userLat, userLng, size, page * size);

        // Convert, then strictly sort by distance from nearest to farthest!
        List<Map<String, Object>> centers = result.getCenters().stream()
            .map(center -> toCenterMap(center, userLat, userLng))
            .sorted((c1, c2) -> {
                Double d1 = (Double) c1.get("distanceKm");
                Double d2 = (Double) c2.get("distanceKm");
                if (d1 == null) return 1;
                if (d2 == null) return -1;
                return Double.compare(d1, d2);
            })
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("centers", centers);
        response.put("total", result.getTotal());
        response.put("hasMore", result.isHasMore());

        return response;
    }

    private Map<String, Object> toCenterMap(DiagnosticCenter center, Double userLat, Double userLng) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", center.getId());
        map.put("name", center.getName());
        map.put("rating", center.getRating());
        map.put("reviews", center.getReviews());
        map.put("type", center.getType());
        map.put("location", center.getLocation());
        map.put("phone", center.getPhone());
        map.put("status", center.getStatus());
        map.put("notes", center.getNotes());
        map.put("latitude", center.getLatitude());
        map.put("longitude", center.getLongitude());
        
        // Dynamic inline Haversine formula calculation — NO extra utility files required!
        if (center.getLatitude() != null && center.getLongitude() != null && userLat != null && userLng != null) {
            double earthRadius = 6371.0; // Kilometers
            double dLat = Math.toRadians(center.getLatitude() - userLat);
            double dLng = Math.toRadians(center.getLongitude() - userLng);
            
            double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                     + Math.cos(Math.toRadians(userLat)) * Math.cos(Math.toRadians(center.getLatitude()))
                     * Math.sin(dLng / 2) * Math.sin(dLng / 2);
            
            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            double realDistance = earthRadius * c;

            // Round cleanly to 1 decimal place (e.g., 3.4 km away)
            map.put("distanceKm", Math.round(realDistance * 10.0) / 10.0);
        } else {
            map.put("distanceKm", null);
        }

        return map;
    }
}