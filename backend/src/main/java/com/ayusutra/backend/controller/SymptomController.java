package com.ayusutra.backend.controller;

import com.ayusutra.backend.dto.SymptomAnalysisResult;
import com.ayusutra.backend.model.Hospital;
import com.ayusutra.backend.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/symptoms")
@CrossOrigin(origins = "*")
public class SymptomController {

    @Autowired
    private HospitalRepository hospitalRepository;

    @PostMapping("/analyze")
    public SymptomAnalysisResult analyzeSymptoms(@RequestBody Map<String, Object> request) {
        String userInput = request.getOrDefault("symptoms", "").toString().toLowerCase();
        
        // Extract user's coordinate telemetry from frontend (fallback to Bengaluru center coordinates)
        Double userLat = request.get("latitude") != null ? Double.parseDouble(request.get("latitude").toString()) : 12.9716;
        Double userLng = request.get("longitude") != null ? Double.parseDouble(request.get("longitude").toString()) : 77.5946;

        SymptomAnalysisResult result = new SymptomAnalysisResult();
        
        // Default baseline configurations
        String predictedDisease = "General Seasonal Viral Syndrome";
        String confidence = "80%";
        String dbSpecialtySearch = null; // null fetches general medicine centers
        String dosha = "Vata-Kapha Mild Aggravation";
        String desc = "Symptoms indicate general physical exhaustion or mild seasonal changes. Prioritize warm fluids and resting intervals.";

        // Diagnostic Keyword mapping directly to your DB specialties column values
        if (userInput.contains("chest pain") || userInput.contains("breathless") || userInput.contains("heart") || userInput.contains("cardio")) {
            predictedDisease = "Cardiovascular Stress Indicators";
            confidence = "92%";
            dbSpecialtySearch = "CARDIOLOGY"; // Matches 'CARDIOLOGY' in specialties column
            dosha = "Prana & Vyana Vayu Disturbance";
            desc = "Potential cardiovascular indicators detected. Clinical evaluation is highly recommended to inspect circulatory stress.";
        } else if (userInput.contains("migraine") || userInput.contains("headache") || userInput.contains("dizzy") || userInput.contains("brain")) {
            predictedDisease = "Tension-Type Migraine / Cephalea";
            confidence = "88%";
            dbSpecialtySearch = "NEUROLOGY"; // Matches 'NEUROLOGY' or neurological specialties
            dosha = "Pitta-Vata Thermal Accumulation";
            desc = "Neurological pressure variation indicators detected. Avoid screen exposure, stay in low-light environments, and consult a doctor.";
        } else if (userInput.contains("burn") || userInput.contains("skin") || userInput.contains("rash") || userInput.contains("allergy")) {
            predictedDisease = "Acute Dermatological / Allergic Reaction";
            confidence = "85%";
            dbSpecialtySearch = "BURNS"; // Matches 'BURNS' / dermatological units
            dosha = "Bhrajaka Pitta Aggravation";
            desc = "Possible inflammatory response or skin sensitivity. Keep clean, avoid harsh chemicals, and seek localized medical examination.";
        } else if (userInput.contains("pregnancy") || userInput.contains("delivery") || userInput.contains("women health")) {
            predictedDisease = "Obstetric Assessment Required";
            confidence = "95%";
            dbSpecialtySearch = "OBSTETRICS AND GYNAECOLOGY"; // Matches specialties column
            dosha = "Apana Vayu Dynamics";
            desc = "Gynaecological tracking parameters indicated. Professional clinical observation is advised.";
        } else if (userInput.contains("surgery") || userInput.contains("accident") || userInput.contains("fracture") || userInput.contains("wound")) {
            predictedDisease = "Traumatic Structural Injury";
            confidence = "90%";
            dbSpecialtySearch = "GENERAL SURGERY"; // Matches specialties column
            dosha = "Sushruta Shastra Protocol Indication";
            desc = "Physical tissue trauma indicated. Requires physical assessment by surgical team specialists.";
        }

        result.setPredictedDisease(predictedDisease);
        result.setConfidenceScore(confidence);
        result.setTargetedSpeciality(dbSpecialtySearch != null ? dbSpecialtySearch : "GENERAL MEDICINE");
        result.setDoshaImbalance(dosha);
        result.setDescription(desc);

        // Fetch top 3 nearest hospitals that support this specialty using your native DB query
        Pageable topThree = PageRequest.of(0, 3);
        List<Hospital> recommended = hospitalRepository.filterAndSortHospitals(
            null,              // No raw search bar text
            dbSpecialtySearch, // Our target mapped database specialty 
            null,              // No district restriction (nearest first anyway)
            null,              // No scheme filter
            userLat,           // Live User Latitude!
            userLng,           // Live User Longitude!
            topThree
        );

        // Fallback: If no custom specialized hospitals match, fetch any 3 closest hospitals to user's location
        if (recommended.isEmpty()) {
            recommended = hospitalRepository.filterAndSortHospitals(null, null, null, null, userLat, userLng, topThree);
        }

        result.setRecommendedHospitals(recommended);
        return result;
    }
}