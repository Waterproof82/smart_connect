-- ========================================
-- A/B TESTING: DASHBOARD ANALYTICS
-- ========================================
-- Comprehensive queries for A/B testing dashboard

-- ========================================
-- 1. OVERALL PERFORMANCE SUMMARY
-- ========================================
SELECT * FROM ab_test_summary ORDER BY overall_score DESC;

-- ========================================
-- 2. DETAILED PERFORMANCE METRICS
-- ========================================
SELECT 
  variant_id,
  variant_name,
  total_queries,
  ROUND(avg_response_time_ms, 0) as avg_response_time_ms,
  ROUND(avg_response_length, 0) as avg_response_length,
  ROUND(avg_documents_used, 1) as avg_documents_used,
  ROUND(avg_context_length, 0) as avg_context_length,
  speed_rank,
  conciseness_rank,
  ROUND(overall_score, 0) as overall_score
FROM ab_test_performance p
JOIN (
  SELECT 
    variant_id,
    ROW_NUMBER() OVER (ORDER BY avg_response_time_ms ASC) as speed_rank,
    ROW_NUMBER() OVER (ORDER BY avg_response_length ASC) as conciseness_rank
  FROM ab_test_performance
) ranks ON p.variant_id = ranks.variant_id
ORDER BY overall_score DESC;

-- ========================================
-- 3. DAILY TRENDS (LAST 14 DAYS)
-- ========================================
SELECT 
  date,
  variant_id,
  daily_queries,
  ROUND(avg_response_time_ms, 0) as avg_response_time_ms,
  ROUND(avg_documents_used, 1) as avg_documents_used,
  LAG(daily_queries) OVER (PARTITION BY variant_id ORDER BY date) as prev_day_queries,
  ROUND(
    (daily_queries::DECIMAL / NULLIF(LAG(daily_queries) OVER (PARTITION BY variant_id ORDER BY date), 0) - 1) * 100, 
    1
  ) as query_growth_pct
FROM ab_test_daily_trends 
WHERE date >= CURRENT_DATE - INTERVAL '14 days'
ORDER BY date DESC, variant_id;

-- ========================================
-- 4. TOP PERFORMING QUERIES BY VARIANT
-- ========================================
SELECT 
  variant_id,
  user_query,
  response_time_ms,
  LENGTH(ai_response) as response_length,
  documents_used,
  timestamp
FROM ab_test_metrics 
WHERE test_name = 'prompt_variants'
  AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY response_time_ms ASC
LIMIT 20;

-- ========================================
-- 5. STATISTICAL SIGNIFICANCE ANALYSIS
-- ========================================
WITH variant_stats AS (
  SELECT 
    variant_id,
    COUNT(*) as total_queries,
    AVG(response_time_ms) as avg_response_time,
    STDDEV(response_time_ms) as stddev_response_time,
    AVG(LENGTH(ai_response)) as avg_response_length,
    STDDEV(LENGTH(ai_response)) as stddev_response_length
  FROM ab_test_metrics 
  WHERE test_name = 'prompt_variants'
    AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY variant_id
)
SELECT 
  v1.variant_id as variant_a,
  v2.variant_id as variant_b,
  v1.total_queries as queries_a,
  v2.total_queries as queries_b,
  ROUND(v1.avg_response_time, 0) as avg_time_a,
  ROUND(v2.avg_response_time, 0) as avg_time_b,
  -- T-test calculation for response time
  ROUND(
    ABS(v1.avg_response_time - v2.avg_response_time) / 
    SQRT(
      (POW(v1.stddev_response_time, 2) / v1.total_queries) + 
      (POW(v2.stddev_response_time, 2) / v2.total_queries)
    ), 
    2
  ) as t_statistic_response_time,
  -- Effect size (Cohen's d)
  ROUND(
    ABS(v1.avg_response_time - v2.avg_response_time) / 
    SQRT((POW(v1.stddev_response_time, 2) + POW(v2.stddev_response_time, 2)) / 2),
    2
  ) as effect_size_response_time
FROM variant_stats v1
CROSS JOIN variant_stats v2
WHERE v1.variant_id < v2.variant_id
ORDER BY t_statistic_response_time DESC;

-- ========================================
-- 6. CONTEXT USAGE ANALYSIS
-- ========================================
SELECT 
  variant_id,
  CASE 
    WHEN documents_used = 0 THEN 'No Context'
    WHEN documents_used <= 2 THEN 'Low Context'
    WHEN documents_used <= 5 THEN 'Medium Context'
    ELSE 'High Context'
  END as context_level,
  COUNT(*) as query_count,
  ROUND(AVG(response_time_ms), 0) as avg_response_time,
  ROUND(AVG(LENGTH(ai_response)), 0) as avg_response_length,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY variant_id), 1) as percentage
FROM ab_test_metrics 
WHERE test_name = 'prompt_variants'
  AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY variant_id, 
  CASE 
    WHEN documents_used = 0 THEN 'No Context'
    WHEN documents_used <= 2 THEN 'Low Context'
    WHEN documents_used <= 5 THEN 'Medium Context'
    ELSE 'High Context'
  END
ORDER BY variant_id, context_level;

-- ========================================
-- 7. HOURLY PERFORMANCE PATTERNS
-- ========================================
SELECT 
  EXTRACT(HOUR FROM timestamp) as hour_of_day,
  variant_id,
  COUNT(*) as query_count,
  ROUND(AVG(response_time_ms), 0) as avg_response_time,
  ROUND(AVG(documents_used), 1) as avg_documents_used
FROM ab_test_metrics 
WHERE test_name = 'prompt_variants'
  AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM timestamp), variant_id
ORDER BY hour_of_day, variant_id;

-- ========================================
-- 8. RESPONSE LENGTH DISTRIBUTION
-- ========================================
SELECT 
  variant_id,
  CASE 
    WHEN LENGTH(ai_response) <= 100 THEN 'Very Short (≤100)'
    WHEN LENGTH(ai_response) <= 200 THEN 'Short (101-200)'
    WHEN LENGTH(ai_response) <= 400 THEN 'Medium (201-400)'
    WHEN LENGTH(ai_response) <= 600 THEN 'Long (401-600)'
    ELSE 'Very Long (>600)'
  END as response_category,
  COUNT(*) as query_count,
  ROUND(AVG(response_time_ms), 0) as avg_response_time,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY variant_id), 1) as percentage
FROM ab_test_metrics 
WHERE test_name = 'prompt_variants'
  AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY variant_id,
  CASE 
    WHEN LENGTH(ai_response) <= 100 THEN 'Very Short (≤100)'
    WHEN LENGTH(ai_response) <= 200 THEN 'Short (101-200)'
    WHEN LENGTH(ai_response) <= 400 THEN 'Medium (201-400)'
    WHEN LENGTH(ai_response) <= 600 THEN 'Long (401-600)'
    ELSE 'Very Long (>600)'
  END
ORDER BY variant_id, response_category;

-- ========================================
-- 9. RECOMMENDATION ENGINE
-- ========================================
WITH performance_scores AS (
  SELECT 
    variant_id,
    -- Speed score (lower is better, normalized)
    (1.0 / avg_response_time_ms) * 1000 as speed_score,
    -- Conciseness score (lower is better, normalized)
    (1.0 / avg_response_length) * 1000 as conciseness_score,
    -- Context usage score (higher is better)
    avg_documents_used * 100 as context_score,
    -- Query volume score (higher is better)
    total_queries * 0.1 as volume_score
  FROM ab_test_performance
),
final_scores AS (
  SELECT 
    variant_id,
    variant_name,
    ROUND(
      (speed_score * 0.35) +      -- 35% weight on speed
      (conciseness_score * 0.25) + -- 25% weight on conciseness
      (context_score * 0.25) +     -- 25% weight on context usage
      (volume_score * 0.15),       -- 15% weight on volume
      0
    ) as final_score,
    ROUND(speed_score, 0) as speed_score,
    ROUND(conciseness_score, 0) as conciseness_score,
    ROUND(context_score, 0) as context_score,
    ROUND(volume_score, 0) as volume_score
  FROM performance_scores ps
  JOIN ab_test_performance ap ON ps.variant_id = ap.variant_id
)
SELECT 
  variant_id,
  variant_name,
  final_score,
  speed_score,
  conciseness_score,
  context_score,
  volume_score,
  CASE 
    WHEN final_score >= 80 THEN '🏆 Excellent'
    WHEN final_score >= 60 THEN '✅ Good'
    WHEN final_score >= 40 THEN '⚠️ Average'
    ELSE '❌ Poor'
  END as performance_rating,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY final_score DESC) = 1 THEN '🥇 RECOMMENDED'
    WHEN ROW_NUMBER() OVER (ORDER BY final_score DESC) = 2 THEN '🥈 Alternative'
    ELSE '🥉 Consider'
  END as recommendation
FROM final_scores
ORDER BY final_score DESC;