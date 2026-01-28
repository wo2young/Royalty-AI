SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    character_maximum_length
FROM 
    information_schema.columns
WHERE 
    table_name = 'brand_logo';  -- 테이블 이름 (소문자로!)
