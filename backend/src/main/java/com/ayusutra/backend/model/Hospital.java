package com.ayusutra.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String district;
    private String type;
    private String pincode;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "specialties", length = 1000)
    private String specialties;

    @Column(name = "supported_schemes", length = 1000)
    private String supportedSchemes;

    // Added geolocation variables to power proximity searches
    private Double latitude;
    private Double longitude;
    private Double rating;

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getSpecialties() { return specialties; }
    public void setSpecialties(String specialties) { this.specialties = specialties; }

    public String getSupportedSchemes() { return supportedSchemes; }
    public void setSupportedSchemes(String supportedSchemes) { this.supportedSchemes = supportedSchemes; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getRating() { return rating != null ? rating : 4.5; }
    public void setRating(Double rating) { this.rating = rating; }
}