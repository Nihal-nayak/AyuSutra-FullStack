package com.ayusutra.backend.controller;

import com.ayusutra.backend.model.BloodBank;
import com.ayusutra.backend.repository.BloodBankRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/blood_banks")
@CrossOrigin(origins = "*")
public class BloodBankController {

    @Autowired
    private BloodBankRepository bloodBankRepository;

    @GetMapping
    public List<BloodBank> getAllBloodBanks() {
        return bloodBankRepository.findAll();
    }

    @GetMapping("/search")
    public List<BloodBank> searchBloodBanks(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String bloodGroup) {
        
        String dist = (district != null && !district.trim().isEmpty() && !district.equals("All Districts")) ? district.trim() : null;
        String bg = (bloodGroup != null && !bloodGroup.trim().isEmpty()) ? bloodGroup.trim() : null;

        return bloodBankRepository.filterBloodBanks(dist, bg);
    }
}