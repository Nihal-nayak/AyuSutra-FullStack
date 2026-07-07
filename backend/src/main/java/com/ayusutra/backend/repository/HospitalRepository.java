package com.ayusutra.backend.repository;

import com.ayusutra.backend.model.Hospital;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    @Query(value = "SELECT h.*, " +
           "(6371 * acos(cos(radians(:userLat)) * cos(radians(h.latitude)) * cos(radians(h.longitude) - radians(:userLng)) + sin(radians(:userLat)) * sin(radians(h.latitude)))) AS distance " +
           "FROM hospitals h WHERE " +
           "(:searchTerm IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(h.specialties) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:specialty IS NULL OR LOWER(h.specialties) LIKE LOWER(CONCAT('%', :specialty, '%'))) AND " +
           "(:district IS NULL OR LOWER(h.district) LIKE LOWER(CONCAT('%', :district, '%'))) AND " +
           "(:scheme IS NULL OR LOWER(h.supported_schemes) LIKE LOWER(CONCAT('%', :scheme, '%'))) " +
           "ORDER BY distance ASC",
           countQuery = "SELECT COUNT(*) FROM hospitals h WHERE " +
                        "(:searchTerm IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(h.specialties) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
                        "(:specialty IS NULL OR LOWER(h.specialties) LIKE LOWER(CONCAT('%', :specialty, '%'))) AND " +
                        "(:district IS NULL OR LOWER(h.district) LIKE LOWER(CONCAT('%', :district, '%'))) AND " +
                        "(:scheme IS NULL OR LOWER(h.supported_schemes) LIKE LOWER(CONCAT('%', :scheme, '%')))",
           nativeQuery = true)
    List<Hospital> filterAndSortHospitals(
        @Param("searchTerm") String searchTerm,
        @Param("specialty") String specialty,
        @Param("district") String district,
        @Param("scheme") String scheme,
        @Param("userLat") Double userLat,
        @Param("userLng") Double userLng,
        Pageable pageable
    );

    @Query(value = "SELECT COUNT(*) FROM hospitals h WHERE " +
                   "(:searchTerm IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(h.specialties) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
                   "(:specialty IS NULL OR LOWER(h.specialties) LIKE LOWER(CONCAT('%', :specialty, '%'))) AND " +
                   "(:district IS NULL OR LOWER(h.district) LIKE LOWER(CONCAT('%', :district, '%'))) AND " +
                   "(:scheme IS NULL OR LOWER(h.supported_schemes) LIKE LOWER(CONCAT('%', :scheme, '%')))",
           nativeQuery = true)
    long countFilteredHospitals(
        @Param("searchTerm") String searchTerm,
        @Param("specialty") String specialty,
        @Param("district") String district,
        @Param("scheme") String scheme
    );
}