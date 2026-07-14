package com.ayusutra.backend.converter;

import com.ayusutra.backend.util.EncryptionUtil;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Converter
@Component
public class CryptoConverter implements AttributeConverter<String, String> {

    private static EncryptionUtil encryptionUtil;

    // Use ApplicationContext to dynamically fetch the fully initialized bean precisely when needed
    @Autowired
    public void setApplicationContext(ApplicationContext applicationContext) {
        encryptionUtil = applicationContext.getBean(EncryptionUtil.class);
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        if (encryptionUtil == null) {
            throw new IllegalStateException("CryptoEngine context initialization delay. Please refresh server.");
        }
        return encryptionUtil.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        if (encryptionUtil == null) {
            throw new IllegalStateException("CryptoEngine context initialization delay. Please refresh server.");
        }
        return encryptionUtil.decrypt(dbData);
    }
}