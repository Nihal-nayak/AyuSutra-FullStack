package com.ayusutra.backend.repository;

import com.ayusutra.backend.model.BloodBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloodBankRepository extends JpaRepository<BloodBank, Long> {

    @Query("SELECT b FROM BloodBank b WHERE " +
           "(:district IS NULL OR b.location LIKE %:district%) AND " +
           "(:bloodGroup IS NULL OR b.notes LIKE %:bloodGroup%)")
    List<BloodBank> filterBloodBanks(
        @Param("district") String district,
        @Param("bloodGroup") String bloodGroup
    );
}