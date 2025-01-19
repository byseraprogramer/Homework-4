package com.example.demo.service.impl;

import com.example.demo.model.CompanyDataTransaction;
import com.example.demo.model.CompanyDataTransaction;
import com.example.demo.repository.CompanyDataTransactionRepository;
import com.example.demo.repository.CompanyDataTransactionRepository;
import com.example.demo.service.CompanyDataTransactionService;
import com.example.demo.service.CompanyDataTransactionService;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.hibernate.annotations.Fetch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class CompanyDataTransactionServiceImpl implements CompanyDataTransactionService {
    @Autowired
    private CompanyDataTransactionRepository companyTransactionRepository;

    @Override
    public List<CompanyDataTransaction> getAllData() {
        return companyTransactionRepository.findAll();
    }

    @Override
    public CompanyDataTransaction getDataById(Long id) {
        return companyTransactionRepository.findById(id).orElse(null);
    }

    @Override
    public List<String> getPrediction(String companyId) {
        String filePath = String.format("/usr/src/app/src/main/resources/lstm_predictions_%s.csv", companyId);
        try (CSVParser parser = CSVFormat.DEFAULT.withHeader().parse(new FileReader(filePath))) {
            List<CSVRecord> records = parser.getRecords();
            if (!records.isEmpty()) {
                List<String> predictions = new ArrayList<>();
                return predictions;
            }
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
        return null;
    }
}