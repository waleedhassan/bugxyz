package com.bugxyz.service.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
public class TfIdfEngine {

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
            "by", "from", "as", "is", "was", "are", "were", "be", "been", "being", "have", "has",
            "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must",
            "shall", "can", "need", "dare", "ought", "used", "it", "its", "my", "me", "we", "our",
            "ours", "you", "your", "yours", "he", "him", "his", "she", "her", "hers", "they", "them",
            "their", "theirs", "what", "which", "who", "whom", "this", "that", "these", "those",
            "am", "been", "being", "having", "doing", "would", "could", "should", "might",
            "not", "no", "nor", "if", "then", "else", "when", "while", "where", "how", "all",
            "each", "every", "both", "few", "more", "most", "other", "some", "such", "only",
            "own", "same", "so", "than", "too", "very", "just", "because", "about", "into",
            "through", "during", "before", "after", "above", "below", "between", "out", "off",
            "over", "under", "again", "further", "once", "here", "there", "any", "also", "get",
            "got", "like", "make", "see", "new", "one", "two", "way", "use"
    );

    private Map<String, Integer> vocabularyIndex;
    private double[] idfValues;
    private int vocabularySize;

    public List<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(text.toLowerCase().split("\\W+"))
                .filter(token -> token.length() > 2)
                .filter(token -> !STOP_WORDS.contains(token))
                .collect(Collectors.toList());
    }

    public void buildVocabulary(List<String> documents) {
        Map<String, Integer> docFrequency = new HashMap<>();
        Set<String> allTerms = new LinkedHashSet<>();

        for (String doc : documents) {
            List<String> tokens = tokenize(doc);
            Set<String> uniqueTokens = new HashSet<>(tokens);
            allTerms.addAll(uniqueTokens);
            for (String token : uniqueTokens) {
                docFrequency.merge(token, 1, Integer::sum);
            }
        }

        vocabularyIndex = new HashMap<>();
        int idx = 0;
        for (String term : allTerms) {
            vocabularyIndex.put(term, idx++);
        }
        vocabularySize = allTerms.size();

        int totalDocs = documents.size();
        idfValues = new double[vocabularySize];
        for (Map.Entry<String, Integer> entry : vocabularyIndex.entrySet()) {
            int df = docFrequency.getOrDefault(entry.getKey(), 0);
            idfValues[entry.getValue()] = Math.log((double) (totalDocs + 1) / (df + 1)) + 1.0;
        }

        log.debug("Built TF-IDF vocabulary with {} terms from {} documents", vocabularySize, totalDocs);
    }

    public double[] computeVector(String text) {
        if (vocabularyIndex == null || vocabularySize == 0) {
            return new double[0];
        }

        double[] vector = new double[vocabularySize];
        List<String> tokens = tokenize(text);

        if (tokens.isEmpty()) {
            return vector;
        }

        Map<String, Long> termFreq = tokens.stream()
                .collect(Collectors.groupingBy(t -> t, Collectors.counting()));

        for (Map.Entry<String, Long> entry : termFreq.entrySet()) {
            Integer index = vocabularyIndex.get(entry.getKey());
            if (index != null) {
                double tf = (double) entry.getValue() / tokens.size();
                vector[index] = tf * idfValues[index];
            }
        }

        return vector;
    }

    public double cosineSimilarity(double[] a, double[] b) {
        if (a.length != b.length || a.length == 0) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double magnitudeA = 0.0;
        double magnitudeB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            magnitudeA += a[i] * a[i];
            magnitudeB += b[i] * b[i];
        }

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        if (magnitudeA == 0.0 || magnitudeB == 0.0) {
            return 0.0;
        }

        return dotProduct / (magnitudeA * magnitudeB);
    }

    public List<SimilarityResult> findSimilar(String query, List<String> documents, List<Long> docIds,
                                               int topK, double threshold) {
        if (documents.isEmpty()) {
            return Collections.emptyList();
        }

        buildVocabulary(documents);
        double[] queryVector = computeVector(query);

        List<SimilarityResult> results = new ArrayList<>();
        for (int i = 0; i < documents.size(); i++) {
            double[] docVector = computeVector(documents.get(i));
            double score = cosineSimilarity(queryVector, docVector);
            if (score >= threshold) {
                results.add(new SimilarityResult(docIds.get(i), score));
            }
        }

        results.sort(Comparator.comparingDouble(SimilarityResult::score).reversed());
        return results.stream().limit(topK).collect(Collectors.toList());
    }

    public record SimilarityResult(Long docId, double score) {}
}
