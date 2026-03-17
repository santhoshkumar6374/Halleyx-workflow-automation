package com.workflow.engine;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class RuleEngine {

    private final ExpressionParser parser = new SpelExpressionParser();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean evaluate(String condition, String jsonData) {
        if ("DEFAULT".equalsIgnoreCase(condition.trim())) {
            return true;
        }

        try {
            Map<String, Object> data = objectMapper.readValue(jsonData, new TypeReference<Map<String, Object>>() {});
            
            // StandardEvaluationContext with Custom Root Object to support custom functions
            EvaluationContext context = new StandardEvaluationContext(new RuleRootObject(data));

            // Set variables dynamically
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                context.setVariable(entry.getKey(), entry.getValue());
            }

            // Convert some custom syntax to SpEL valid syntax if needed
            // e.g. amount > 100 && country == 'US' -> #amount > 100 and #country == 'US'
            String spelCondition = condition
                    .replaceAll("(?<![a-zA-Z0-9_#])([a-zA-Z_][a-zA-Z0-9_]*)(?=\\s*(==|!=|>|<|>=|<=|&&|\\|\\||\\)))", "#$1")
                    .replaceAll("(?<![a-zA-Z0-9_#])([a-zA-Z_][a-zA-Z0-9_]*)(?=(==|!=|>|<|>=|<=|&&|\\|\\||\\)))", "#$1")
                    .replaceAll("&&", "and")
                    .replaceAll("\\|\\|", "or");

            // Handle custom functions syntax mapping
            // e.g., contains('country', 'US') -> contains(data, 'country', 'US')
            // To simplify, our root object methods can just be invoked directly: contains('country', 'US')
            
            Expression expression = parser.parseExpression(spelCondition);
            Boolean result = expression.getValue(context, Boolean.class);
            return result != null && result;

        } catch (Exception e) {
            // Log failure, default to false
            System.err.println("Rule evaluation failed: " + e.getMessage());
            return false;
        }
    }

    public static class RuleRootObject {
        private final Map<String, Object> data;

        public RuleRootObject(Map<String, Object> data) {
            this.data = data;
        }

        public boolean contains(String fieldName, Object value) {
            Object fieldVal = data.get(fieldName);
            if (fieldVal instanceof String && value instanceof String) {
                return ((String) fieldVal).contains((String) value);
            }
            return false;
        }

        public boolean startsWith(String fieldName, String value) {
            Object fieldVal = data.get(fieldName);
            return fieldVal != null && fieldVal.toString().startsWith(value);
        }

        public boolean endsWith(String fieldName, String value) {
            Object fieldVal = data.get(fieldName);
            return fieldVal != null && fieldVal.toString().endsWith(value);
        }
    }
}
