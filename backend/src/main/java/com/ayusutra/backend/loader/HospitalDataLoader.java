package com.ayusutra.backend;

import com.ayusutra.backend.model.Hospital;
import com.ayusutra.backend.repository.HospitalRepository;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Component
public class HospitalDataLoader implements CommandLineRunner {

    @Autowired
    private HospitalRepository hospitalRepository;

    @Override
    public void run(String... args) throws Exception {
        // CRITICAL CHECK: If records already exist, bypass the load entirely!
        if (hospitalRepository.count() > 0) {
            System.out.println(">>> Database already initialized with " + hospitalRepository.count() + " hospitals. Bypassing startup loop! <<<");
            return;
        }

        System.out.println(">>> First-time initial boot setup: Seeding 3400+ hospitals offline... <<<");

        InputStream is = new ClassPathResource("clean-hospitals.js").getInputStream();
        String rawText = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        if (!rawText.isEmpty() && rawText.charAt(0) == '\uFEFF') {
            rawText = rawText.substring(1);
        }

        JsonMapper mapper = JsonMapper.builder()
                .enable(JsonReadFeature.ALLOW_TRAILING_COMMA)
                .build();
        
        List<Map<String, Object>> list = mapper.readValue(rawText, new TypeReference<List<Map<String, Object>>>() {});

        double baseLat = 12.9716;
        double baseLng = 77.5946;

        for (int i = 0; i < list.size(); i++) {
            Map<String, Object> map = list.get(i);
            Hospital h = new Hospital();
            h.setName((String) map.get("n"));
            h.setDistrict((String) map.get("d"));
            h.setAddress((String) map.get("a"));
            h.setPhoneNumber((String) map.get("p"));

            List<String> schemes = (List<String>) map.get("s");
            h.setSupportedSchemes(schemes != null ? String.join(", ", schemes) : "");

            List<String> specs = (List<String>) map.get("sp");
            h.setSpecialties(specs != null ? String.join(", ", specs) : "");

            h.setType(h.getName().contains("Private") || h.getName().contains("Foundation") ? "Private" : "Public/Government");
            h.setPincode("560001");
            h.setRating(4.0 + (i % 10) * 0.1);

            double offsetLat = ((i % 50) - 25) * 0.005;
            double offsetLng = (((i * 7) % 50) - 25) * 0.005;
            h.setLatitude(baseLat + offsetLat);
            h.setLongitude(baseLng + offsetLng);

            hospitalRepository.save(h);
        }

        System.out.println(">>> SUCCESS: CACHED ALL HOSPITALS SEEDS FRESH! <<<");
    }
}