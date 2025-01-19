package com.example.demo.controller;

import com.example.demo.model.CompanyData;
import com.example.demo.model.CompanyDataTransaction;
import com.example.demo.service.CSVDataImporter;
import com.example.demo.service.CompanyDataService;
import com.example.demo.service.CompanyDataTransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping(value = "/api")
@Validated
@CrossOrigin(origins = "*")
public class CompanyDataController {

    private final CompanyDataService companyDataService;
    private final CompanyDataTransactionService companyDataTransactionService;

    public CompanyDataController(CompanyDataService companyDataService, CompanyDataTransactionService companyDataTransactionService, CSVDataImporter csvDataImporter) {
        this.companyDataService = companyDataService;
        this.companyDataTransactionService = companyDataTransactionService;
        companyDataService.fetchAndSaveCompany();
        csvDataImporter.importCSVToDatabase();
    }

    @GetMapping("/all")
    public ResponseEntity<List<CompanyData>> getAllData() {
        List<CompanyData> transactions = companyDataService.getAll();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDataTransaction> getCompanyDataById(@PathVariable Long id) {
        return ResponseEntity.ok(companyDataTransactionService.getDataById(id));
    }

    @GetMapping("/companies")
    public ResponseEntity<List<String>> getAllCompanies() {
        return ResponseEntity.ok(companyDataService.getAllCodes());
    }

    @GetMapping("/transactions/{code}")
    public ResponseEntity<List<CompanyDataTransaction>> getDataByCode(@PathVariable String code) {
        List<CompanyDataTransaction> transactions = companyDataService.getTransactionByCompanyCode(code);
        return ResponseEntity.ok(transactions);
    }

}