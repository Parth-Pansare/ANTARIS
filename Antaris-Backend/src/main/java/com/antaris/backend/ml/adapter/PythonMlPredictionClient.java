package com.antaris.backend.ml.adapter;

import com.antaris.backend.exception.MlProviderException;
import com.antaris.backend.ml.dto.PredictionRequest;
import com.antaris.backend.ml.dto.PredictionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@Profile("python-ml")
public class PythonMlPredictionClient implements MlPredictionClient {

    private final RestClient restClient;

    public PythonMlPredictionClient(
            @Value("${antaris.ml.base-url:http://127.0.0.1:8000}")
            String baseUrl
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Override
    public PredictionResponse predictEnergy(
            PredictionRequest request
    ) {
        return callPrediction(
                "/predict/energy",
                request
        );
    }

    @Override
    public PredictionResponse predictFuel(
            PredictionRequest request
    ) {
        return callPrediction(
                "/predict/fuel",
                request
        );
    }

    @Override
    public PredictionResponse predictEnvironment(
            PredictionRequest request
    ) {
        return callPrediction(
                "/predict/environment",
                request
        );
    }

    @Override
    public PredictionResponse predictEquipment(
            PredictionRequest request
    ) {
        return callPrediction(
                "/predict/equipment",
                request
        );
    }

    private PredictionResponse callPrediction(
            String endpoint,
            PredictionRequest request
    ) {

        try {

            PredictionResponse response =
                    restClient.post()
                            .uri(endpoint)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(request)
                            .retrieve()
                            .body(PredictionResponse.class);

            if (response == null) {

                throw new MlProviderException(
                        "Python ML service returned an empty response"
                );
            }

            return response;

        } catch (MlProviderException exception) {

            throw exception;

        } catch (RestClientException exception) {

            throw new MlProviderException(
                    "Python ML service is unavailable or returned an error",
                    exception
            );
        }
    }
}