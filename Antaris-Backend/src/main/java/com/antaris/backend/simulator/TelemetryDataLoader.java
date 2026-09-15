package com.antaris.backend.simulator;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class TelemetryDataLoader {

    private static final Path TELEMETRY_DIRECTORY =
            Path.of("D:/ANTARIS/database/telemetry");

    /**
     * Loads a CSV file from the ANTARIS telemetry directory.
     *
     * @param fileName CSV file name
     * @return list of rows where each row is represented as column-name/value pairs
     */
    public List<Map<String, String>> load(String fileName) {

        Path filePath = TELEMETRY_DIRECTORY.resolve(fileName);

        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException(
                    "Telemetry file not found: " + filePath
            );
        }

        List<Map<String, String>> rows = new ArrayList<>();

        CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreEmptyLines(true)
                .setTrim(true)
                .build();

        try (
                Reader reader = Files.newBufferedReader(
                        filePath,
                        StandardCharsets.UTF_8
                );

                CSVParser parser = csvFormat.parse(reader)
        ) {

            for (CSVRecord record : parser) {

                Map<String, String> row = new LinkedHashMap<>();

                for (String header : parser.getHeaderNames()) {
                    row.put(header, record.get(header));
                }

                rows.add(row);
            }

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Failed to read telemetry file: " + filePath,
                    e
            );
        }

        return rows;
    }
}