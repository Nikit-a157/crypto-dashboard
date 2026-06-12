package com.crypto.dashboard.model;

import java.util.List;

public class SimulationResult {
    private double finalProjectedValue;
    private double netProfitLoss;
    private double totalReturnPercentage;
    private List<Double> annualProjections;

    public SimulationResult(double finalProjectedValue, double netProfitLoss, double totalReturnPercentage, List<Double> annualProjections) {
        this.finalProjectedValue = finalProjectedValue;
        this.netProfitLoss = netProfitLoss;
        this.totalReturnPercentage = totalReturnPercentage;
        this.annualProjections = annualProjections;
    }

    public double getFinalProjectedValue() { return finalProjectedValue; }
    public double getNetProfitLoss() { return netProfitLoss; }
    public double getTotalReturnPercentage() { return totalReturnPercentage; }
    public List<Double> getAnnualProjections() { return annualProjections; }
}