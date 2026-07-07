package com.ayusutra.backend.controller;

import com.ayusutra.backend.model.Hospital;
import com.ayusutra.backend.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "*")
public class HospitalController {

    @Autowired
    private HospitalRepository hospitalRepository;

    @GetMapping
    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    @GetMapping("/search")
    public Map<String, Object> searchHospitals(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String scheme,
            @RequestParam(defaultValue = "12.9716") Double userLat,
            @RequestParam(defaultValue = "77.5946") Double userLng,
            @RequestParam(defaultValue = "0") int page) {
        
        // Clean text inputs coming from React states cleanly
        String search = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String spec = (specialty != null && !specialty.trim().isEmpty()) ? specialty.trim() : null;
        String dist = (district != null && !district.trim().isEmpty()) ? district.trim() : null;
        String schm = (scheme != null && !scheme.trim().isEmpty()) ? scheme.trim() : null;

        // Fetch exactly 9 sorted items for the current requested chunk index
        List<Hospital> hospitals = hospitalRepository.filterAndSortHospitals(
                search, spec, dist, schm, userLat, userLng, PageRequest.of(page, 9)
        );

        // Get total count matching this exact filter combination across the entire DB
        long totalCount = hospitalRepository.countFilteredHospitals(search, spec, dist, schm);

        Map<String, Object> response = new HashMap<>();
        response.put("hospitals", hospitals);
        response.put("total", totalCount);
        response.put("hasMore", (long) (page + 1) * 9 < totalCount);

        return response;
    }
}