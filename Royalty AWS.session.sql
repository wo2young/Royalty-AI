SELECT 
    pid, 
    state, 
    query_start, 
    wait_event_type, 
    wait_event, 
    query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY query_start;