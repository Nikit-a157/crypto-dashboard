package com.crypto.dashboard.model;

public class SimulationRequest {
    private double initialInvestment;
    private int durationYears;
    private double annualGrowthRate;

    public double getInitialInvestment() { return initialInvestment; }
    public void setInitialInvestment(double initialInvestment) { this.initialInvestment = initialInvestment; }
    public int getDurationYears() { return durationYears; }
    public void setDurationYears(int durationYears) { this.durationYears = durationYears; }
    public double getAnnualGrowthRate() { return annualGrowthRate; }
    public void setAnnualGrowthRate(double annualGrowthRate) { this.annualGrowthRate = annualGrowthRate; }
}