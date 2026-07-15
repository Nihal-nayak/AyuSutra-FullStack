package com.ayusutra.backend.dto;

import com.ayusutra.backend.model.Hospital;
import lombok.Data;
import java.util.List;

@Data
public class SymptomAnalysisResult {
    private String predictedDisease;
    private String confidenceScore;
    private String targetedSpeciality;
    private String doshaImbalance;
    private String description;
    private List<Hospital> recommendedHospitals;
}