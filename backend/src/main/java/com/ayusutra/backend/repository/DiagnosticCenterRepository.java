package com.ayusutra.backend.repository;

import com.ayusutra.backend.model.DiagnosticCenter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosticCenterRepository extends JpaRepository<DiagnosticCenter, Long> {

    @Query(value = "SELECT d.*, " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(d.latitude)))) AS distance " +
           "FROM diagnostic_centers d " +
           "ORDER BY distance ASC",
           nativeQuery = true)
    List<DiagnosticCenter> findNearestDiagnostics(
        @Param("lat") Double lat, 
        @Param("lng") Double lng, 
        Pageable pageable
    );
}