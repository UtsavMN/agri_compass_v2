package com.agricompass.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market-prices")
public class MarketPriceController {

    @Value("${datagov.api.key}")
    private String dataGovApiKey;

    /**
     * Fetches live mandi (wholesale market) prices from data.gov.in
     * Resource: Current Daily Price of Various Commodities from Various Markets (Mandis)
     */
    @GetMapping("/live")
    public ResponseEntity<?> getLiveMarketPrices(
            @RequestParam(defaultValue = "Tomato") String commodity,
            @RequestParam(defaultValue = "Karnataka") String state,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
                    + "?api-key=" + dataGovApiKey
                    + "&format=json"
                    + "&limit=" + limit
                    + "&filters%5Bstate%5D=" + state
                    + "&filters%5Bcommodity%5D=" + commodity;

            Map response = restTemplate.getForObject(url, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                "error", true,
                "message", "Could not fetch live market prices: " + e.getMessage()
            ));
        }
    }

    /**
     * Returns a list of available commodities for querying
     */
    @GetMapping("/commodities")
    public ResponseEntity<List<String>> getAvailableCommodities() {
        return ResponseEntity.ok(List.of(
            "Tomato", "Onion", "Potato", "Rice", "Wheat",
            "Maize", "Cotton", "Sugarcane", "Groundnut", "Soyabean",
            "Ragi", "Jowar", "Bajra", "Tur", "Urad",
            "Moong", "Chilli", "Turmeric", "Coconut", "Arecanut",
            "Coffee", "Pepper", "Banana", "Mango", "Grapes",
            "Pomegranate", "Watermelon", "Papaya", "Orange", "Apple"
        ));
    }
}
