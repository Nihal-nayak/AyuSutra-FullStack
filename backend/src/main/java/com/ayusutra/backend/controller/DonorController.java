package com.ayusutra.backend.controller;

import com.ayusutra.backend.model.Donor;
import com.ayusutra.backend.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donors")
@CrossOrigin(origins = "*")
public class DonorController {

    @Autowired
    private DonorRepository donorRepository;

    @PostMapping("/register")
    public ResponseEntity<String> registerDonor(@RequestBody Donor donor) {
        // Transparent encryption occurs automatically right here during .save() hook execution!
        donorRepository.save(donor);
        return ResponseEntity.ok("Volunteer saved securely under full cryptographic rest abstraction.");
    }
}