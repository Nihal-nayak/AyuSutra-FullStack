package com.ayusutra.backend.loader;

import com.ayusutra.backend.model.BloodBank;
import com.ayusutra.backend.repository.BloodBankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
@Component
public class BloodBankDataLoader implements CommandLineRunner {

    @Autowired
    private BloodBankRepository bloodBankRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Clear out old database entries to avoid duplication on restarts
        bloodBankRepository.deleteAll();

        // 2. Open the file from classpath resources
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("blood_banks_dataset.csv").getInputStream(), StandardCharsets.UTF_8))) {
            
            String line;
            boolean isHeader = true;

            while ((line = br.readLine()) != null) {
                // Skip the CSV header row
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                // Split commas safely while ignoring commas embedded inside double-quoted text fields
                String[] tokens = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

                if (tokens.length > 0) {
                    BloodBank bb = new BloodBank();
                    
                    // Column mapping based on dataset structure
                    bb.setName(cleanToken(tokens, 0));
                    
                    String rawRating = cleanToken(tokens, 1);
                    bb.setRating(rawRating.isEmpty() ? 0.0 : Double.parseDouble(rawRating));
                    
                    String rawReviews = cleanToken(tokens, 2);
                    bb.setReviews(rawReviews.isEmpty() ? 0 : Integer.parseInt(rawReviews));
                    
                    bb.setType(cleanToken(tokens, 3));
                    bb.setLocation(cleanToken(tokens, 4));
                    bb.setPhone(cleanToken(tokens, 5));
                    bb.setStatus(cleanToken(tokens, 6));
                    bb.setNotes(cleanToken(tokens, 7));

                    // Default coordinates for Bengaluru center area to support Sprint 2 proximity sorting
                    bb.setLatitude(12.9716);
                    bb.setLongitude(77.5946);

                    bloodBankRepository.save(bb);
                }
            }
        }

        System.out.println(">>> SUCCESS: IMPORTED " + bloodBankRepository.count() + " BLOOD BANKS INTO MYSQL! <<<");
    }

    // Helper utility to clean whitespace and strip surrounding quotes from tokens safely
    private String cleanToken(String[] tokens, int index) {
        if (index >= tokens.length || tokens[index] == null) {
            return "";
        }
        String clean = tokens[index].trim();
        if (clean.startsWith("\"") && clean.endsWith("\"")) {
            clean = clean.substring(1, clean.length() - 1).trim();
        }
        return clean;
    }
}