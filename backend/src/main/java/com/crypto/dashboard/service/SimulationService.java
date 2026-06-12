package com.crypto.dashboard.service;

import com.crypto.dashboard.model.SimulationRequest;
import com.crypto.dashboard.model.SimulationResult;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class SimulationService {

    public SimulationResult calculateProjections(SimulationRequest request) {
        double currentAmount = request.getInitialInvestment();
        int years = request.getDurationYears();
        // The Java backend now uses the exact live rate sent by React!
        double annualGrowthRate = request.getAnnualGrowthRate(); 

        List<Double> annualProjections = new ArrayList<>();
        annualProjections.add(Math.round(currentAmount * 100.0) / 100.0);

        for (int i = 1; i <= years; i++) {
            currentAmount = currentAmount * (1 + annualGrowthRate);
            annualProjections.add(Math.round(currentAmount * 100.0) / 100.0);
        }

        double finalValue = Math.round(currentAmount * 100.0) / 100.0;
        double netProfitLoss = Math.round((finalValue - request.getInitialInvestment()) * 100.0) / 100.0;
        double totalReturnPercent = Math.round(((finalValue - request.getInitialInvestment()) / request.getInitialInvestment() * 100) * 100.0) / 100.0;

        return new SimulationResult(finalValue, netProfitLoss, totalReturnPercent, annualProjections);
    }
}