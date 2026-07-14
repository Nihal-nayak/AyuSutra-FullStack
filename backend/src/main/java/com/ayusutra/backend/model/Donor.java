package com.ayusutra.backend.model;

import com.ayusutra.backend.converter.CryptoConverter;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "registered_donors")
@Data
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SENSITIVE ATTRIBUTE LAYER: Encrypted cleanly in MySQL Rest storage
    @Convert(converter = CryptoConverter.class)
    @Column(name = "full_name", nullable = false)
    private String fullName;

    // SENSITIVE ATTRIBUTE LAYER: Encrypted to shield phone streams
    @Convert(converter = CryptoConverter.class)
    @Column(name = "phone_number", nullable = false)
    private String phone;

    // Kept in plaintext so the frontend search filters can index by type efficiently
    @Column(name = "blood_group", nullable = false)
    private String bloodGroup;

    @Column(name = "last_donation_date")
    private String lastDonation;
}