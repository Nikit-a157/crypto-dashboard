package com.crypto.dashboard.controller;

import com.crypto.dashboard.model.SimulationRequest;
import com.crypto.dashboard.model.SimulationResult;
import com.crypto.dashboard.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class SimulationController {

    // 1. Add 'final' to protect the variable
    private final SimulationService simulationService;

    // 2. Pass it through the constructor instead of using @Autowired on the field
    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/simulate")
    public ResponseEntity<SimulationResult> runSimulation(@RequestBody SimulationRequest request) {
        if (request.getInitialInvestment() <= 0 || request.getDurationYears() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        SimulationResult result = simulationService.calculateProjections(request);
        return ResponseEntity.ok(result);
    }
}